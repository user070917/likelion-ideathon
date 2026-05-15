import os
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import datetime
import os
import shutil
import uuid
from dotenv import load_dotenv
from supabase import create_client, Client
from services.ai_service import ai_service

class CareBotRequest(BaseModel):
    history: List[dict]
    user_id: Optional[str] = None

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Clean up any leftover mp3 files from previous runs
    for file in os.listdir(os.getcwd()):
        if file.endswith(".mp3"):
            remove_file(os.path.join(os.getcwd(), file))
    yield

app = FastAPI(title="CareMonitor AI API", lifespan=lifespan)

def remove_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print(f"Error removing file {path}: {e}")

# Load environment variables (ensure they are set in your environment)
SUPABASE_URL = os.getenv("SUPABASE_URL", "your_supabase_url_here")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your_supabase_anon_key_here")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "CareMonitor AI API is running"}

@app.get("/users")
async def get_users():
    try:
        # 1. Fetch all users
        users_response = supabase.table("users").select("*").order("name").execute()
        users = users_response.data
        
        # 2. For each user, fetch the latest analysis result
        # (This is a simplified version; for production, a single complex SQL join or view is better)
        for user in users:
            # Get the most recent conversation and its analysis
            latest_conv = supabase.table("conversations")\
                .select("*, analysis_results(*)")\
                .eq("user_id", user['id'])\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()
            
            if latest_conv.data and latest_conv.data[0]['analysis_results']:
                analysis = latest_conv.data[0]['analysis_results'][0]
                user['status'] = analysis.get('risk_level', 'normal').lower()
                user['aiSummary'] = analysis.get('summary', '분석 대기 중')
                user['mmseScore'] = analysis.get('mmse_score', 0)
                user['lastSpeech'] = latest_conv.data[0]['created_at']
            else:
                user['status'] = 'unregistered'
                user['aiSummary'] = '분석 데이터가 아직 없습니다.'
                user['mmseScore'] = 0
                user['lastSpeech'] = '기록 없음'
                
        return users
    except Exception as e:
        print(f"Get Users Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{user_id}/greeting")
async def get_greeting(user_id: str, background_tasks: BackgroundTasks):
    try:
        print(f"Generating greeting for user: {user_id}")
        # 1. Fetch user info
        user_res = supabase.table("users").select("*").eq("id", user_id).single().execute()
        if not user_res.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_name = user_res.data.get("name", "어르신")
        
        # 최근 1시간 이내의 대화 내역 5개 가져오기 (새로운 세션이면 안부를 새로 묻도록)
        one_hour_ago = (datetime.datetime.now() - datetime.timedelta(hours=1)).isoformat()
        
        recent_convs = supabase.table("conversations")\
            .select("text, speaker_role")\
            .eq("user_id", user_id)\
            .gt("created_at", one_hour_ago)\
            .order("created_at", desc=True)\
            .limit(5)\
            .execute()
        
        # AI 형식에 맞게 변환 (과거 대화가 뒤로 가도록 reverse)
        history = [{"role": m["speaker_role"], "text": m["text"]} for m in reversed(recent_convs.data)]
        
        latest_analysis = supabase.table("conversations")\
            .select("*, analysis_results(*)")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        context = ""
        if latest_analysis.data and len(latest_analysis.data) > 0:
            results = latest_analysis.data[0].get("analysis_results", [])
            if results and len(results) > 0:
                context = results[0].get("summary", "")
        
        print(f"History length: {len(history)}, Context found: {context}")

        # 3. Generate personalized greeting text with HISTORY
        # Use unified carebot response for greeting as well
        greeting_text = await ai_service.generate_carebot_response(user_name, history)
        
        # 4. Extract text if JSON is present (for TTS and clean storage)
        import re
        clean_greeting = re.sub(r'\{[\s\S]*\}', '', greeting_text).strip()
        if not clean_greeting:
            clean_greeting = f"안녕하세요 {user_name} 어르신, 오늘 기분은 어떠신가요?"

        # 5. Save AI's greeting (SAVE CLEAN TEXT)
        supabase.table("conversations").insert({
            "user_id": user_id,
            "text": clean_greeting,
            "speaker_role": "ai"
        }).execute()

        # 6. TTS (USE CLEAN TEXT)
        audio_filename = f"greeting_{user_id}_{uuid.uuid4()}.mp3"
        audio_path = os.path.join(os.getcwd(), audio_filename)
        
        success = await ai_service.text_to_speech(clean_greeting, audio_path)
        
        if not success:
            raise HTTPException(status_code=500, detail="TTS failed")
            
        import urllib.parse
        safe_greeting = urllib.parse.quote(clean_greeting)
        
        # Add background task to remove file after sending
        background_tasks.add_task(remove_file, audio_path)
        
        return FileResponse(
            audio_path, 
            media_type="audio/mpeg", 
            headers={
                "Access-Control-Expose-Headers": "X-CareBot-Text",
                "X-CareBot-Text": safe_greeting,
                "Cache-Control": "no-store, max-age=0"
            }
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc() # 터미널에 상세 에러 출력
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/audio")
async def upload_audio(user_id: str = Form(...), file: UploadFile = File(...)):
    # 1. Save audio file temporarily
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    temp_path = os.path.join(os.getcwd(), temp_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Call Whisper STT
        text = await ai_service.transcribe_audio(temp_path)
        
        # 3. Call AI Analysis (GPT-4o)
        analysis = await ai_service.analyze_text(text)
        print(f"DEBUG - Analysis result for user {user_id}: {analysis}")
        
        # 4. Save to Database
        # First, save the conversation text
        conv_res = supabase.table("conversations").insert({
            "user_id": user_id,
            "text": text
        }).execute()
        
        if not conv_res.data:
            raise Exception("Failed to save conversation")
            
        # Then, save the analysis results
        analysis_res = supabase.table("analysis_results").insert({
            "conversation_id": conv_res.data[0]["id"],
            "emotion": analysis.get("emotion"),
            "depression_risk": analysis.get("depression_risk"),
            "mmse_score": analysis.get("mmse_score", 0),
            "risk_level": analysis.get("risk_level"),
            "summary": analysis.get("summary"),
            "dementia_pattern": analysis.get("dementia_pattern")
        }).execute()

        # 분석 데이터와 함께 텍스트도 반환하여 프론트에서 다음 대화를 이어가게 함
        return {
            "id": analysis_res.data[0]["id"],
            "text": text,
            "summary": analysis.get("summary"),
            "risk_level": analysis.get("risk_level"),
            "emotion": analysis.get("emotion"),
            "mmse_score": analysis.get("mmse_score", 0)
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/users/{user_id}/analysis")
async def get_user_analysis(user_id: uuid.UUID):
    try:
        # Fetch conversations and their analysis results for a specific user
        response = supabase.table("conversations")\
            .select("*, analysis_results(*)")\
            .eq("user_id", str(user_id))\
            .order("created_at", desc=True)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/users/{user_id}")
async def update_user(user_id: str, data: dict):
    try:
        # 데이터베이스 업데이트에 불필요하거나 오류를 일으킬 수 있는 필드 제거
        for key in ["id", "created_at", "lastSpeech", "aiSummary", "ward"]:
            if key in data:
                del data[key]
            
        response = supabase.table("users").update(data).eq("id", user_id).execute()
        return response.data
    except Exception as e:
      print(f"Update Error Details: {e}")
      raise HTTPException(status_code=500, detail=str(e))

@app.delete("/users/{user_id}")
async def delete_user(user_id: str):
    try:
        response = supabase.table("users").delete().eq("id", user_id).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        print(f"Delete Error Details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/alerts")
async def get_alerts():
    try:
        response = supabase.table("alerts")\
            .select("*, users(name)")\
            .eq("is_resolved", False)\
            .order("created_at", desc=True)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/carebot/chat")
async def carebot_chat(request: CareBotRequest):
    try:
        # Get user info for persona
        user_id = request.history[0].get('user_id') if request.history else None
        user_name = "어르신"
        if user_id:
            user_res = supabase.table("users").select("name").eq("id", user_id).single().execute()
            if user_res.data:
                user_name = user_res.data.get("name", "어르신")

        response = await ai_service.generate_carebot_response(user_name, request.history)
        return {"response": response}
    except Exception as e:
        print(f"CareBot Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/carebot/talk")
async def carebot_talk(request: CareBotRequest, background_tasks: BackgroundTasks):
    try:
        # Get user info for persona
        user_id = request.history[0].get('user_id') if request.history else None
        user_name = "어르신"
        # We need a way to pass user_id in CareBotRequest if we want personalized name
        # For now, let's just use "어르신" if not provided.
        
        # 1. Generate text response
        response_text = await ai_service.generate_carebot_response(user_name, request.history)
        print(f"DEBUG - CareBot Response: {response_text[:100]}...")
        
        # 2. Extract text and JSON assessment
        import re
        import json
        clean_text = re.sub(r'\{[\s\S]*\}', '', response_text).strip()
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        
        # 3. Save AI's response to conversations table
        if user_id:
            conv_res = supabase.table("conversations").insert({
                "user_id": user_id,
                "text": clean_text or "분석이 완료되었습니다.",
                "speaker_role": "ai"
            }).execute()
            
            # 4. If assessment JSON exists, save to analysis_results
            if json_match and conv_res.data:
                try:
                    assessment = json.loads(json_match.group(0))
                    cog = assessment.get("cognitive_assessment", {})
                    summary_data = cog.get("summary", {})
                    
                    supabase.table("analysis_results").insert({
                        "conversation_id": conv_res.data[0]["id"],
                        "emotion": "stable", # CareBot output doesn't specify emotion in this schema
                        "depression_risk": 0,
                        "mmse_score": summary_data.get("mmse_score", 0),
                        "risk_level": summary_data.get("clinical_risk", "Normal"),
                        "summary": summary_data.get("special_note", clean_text),
                        "dementia_pattern": summary_data.get("clinical_risk") != "정상"
                    }).execute()
                except Exception as json_err:
                    print(f"Failed to save CareBot assessment: {json_err}")

        # 5. TTS (USE CLEAN TEXT)
        if not clean_text:
            clean_text = "분석이 완료되었습니다. 고생하셨습니다 어르신."

        audio_filename = f"carebot_{uuid.uuid4()}.mp3"
        audio_path = os.path.join(os.getcwd(), audio_filename)
        
        success = await ai_service.text_to_speech(clean_text, audio_path)
        if not success:
            raise HTTPException(status_code=500, detail="TTS failed")

        import urllib.parse
        safe_text = urllib.parse.quote(response_text)
        
        background_tasks.add_task(remove_file, audio_path)
        
        return FileResponse(
            audio_path, 
            media_type="audio/mpeg", 
            headers={
                "Access-Control-Expose-Headers": "X-CareBot-Text",
                "X-CareBot-Text": safe_text,
                "Cache-Control": "no-store, max-age=0"
            }
        )
    except Exception as e:
        print(f"CareBot Talk Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
