from fastapi import FastAPI, UploadFile, File, HTTPException, Form
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

# Load environment variables
load_dotenv()

app = FastAPI(title="CareMonitor AI API")

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
                user['lastSpeech'] = latest_conv.data[0]['created_at']
            else:
                user['status'] = 'unregistered'
                user['aiSummary'] = '분석 데이터가 아직 없습니다.'
                user['lastSpeech'] = '기록 없음'
                
        return users
    except Exception as e:
        print(f"Get Users Error: {e}")
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
        
        # 4. Save to Database
        # First, save the conversation text
        conv_response = supabase.table("conversations").insert({
            "user_id": str(user_id),
            "text": text
        }).execute()
        
        if not conv_response.data:
            raise Exception("Failed to save conversation")
            
        conversation_id = conv_response.data[0]['id']
        
        # Then, save the analysis results
        analysis_response = supabase.table("analysis_results").insert({
            "conversation_id": conversation_id,
            "emotion": analysis.get("emotion"),
            "depression_risk": analysis.get("depression_risk"),
            "risk_level": analysis.get("risk_level"),
            "summary": analysis.get("summary"),
            "dementia_pattern": analysis.get("dementia_pattern")
        }).execute()
        
        return {
            "user_id": user_id,
            "text": text,
            "analysis": analysis
        }
        
    except Exception as e:
        print(f"Server Error: {e}")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
