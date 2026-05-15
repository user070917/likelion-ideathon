import os
import asyncio
import json
from dotenv import load_dotenv
from supabase import create_client, Client
from services.ai_service import ai_service

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def reanalyze_all():
    print("Starting re-analysis of all user conversations...")
    try:
        # 1. Fetch all users
        users_res = supabase.table("users").select("id, name").execute()
        users = users_res.data
        
        for user in users:
            user_id = user['id']
            print(f"Analyzing for user: {user['name']} ({user_id})")
            
            # 2. Get the latest non-AI conversation
            conv_res = supabase.table("conversations")\
                .select("*")\
                .eq("user_id", user_id)\
                .eq("speaker_role", "resident")\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()
            
            if not conv_res.data:
                print(f"  No resident conversations found for {user['name']}")
                continue
                
            latest_conv = conv_res.data[0]
            text = latest_conv['text']
            print(f"  Latest text: {text[:30]}...")
            
            # 3. Analyze with new prompt
            analysis = await ai_service.analyze_text(text)
            print(f"  Result: {analysis['risk_level']} - {analysis['summary']}")
            
            # 4. Update or insert analysis results
            # Check if analysis already exists for this conversation
            existing_analysis = supabase.table("analysis_results")\
                .select("id")\
                .eq("conversation_id", latest_conv['id'])\
                .execute()
            
            data = {
                "conversation_id": latest_conv['id'],
                "emotion": analysis.get("emotion"),
                "depression_risk": analysis.get("depression_risk"),
                "mmse_score": analysis.get("mmse_score", 0),
                "risk_level": analysis.get("risk_level"),
                "summary": analysis.get("summary"),
                "dementia_pattern": analysis.get("dementia_pattern")
            }
            
            if existing_analysis.data:
                try:
                    res = supabase.table("analysis_results").update(data).eq("id", existing_analysis.data[0]['id']).execute()
                    if res.data:
                        print(f"  Updated existing analysis: {res.data[0]['id']}")
                    else:
                        print(f"  Update returned no data for {user['name']}")
                except Exception as update_err:
                    print(f"  Update failed for {user['name']}: {update_err}")
            else:
                try:
                    res = supabase.table("analysis_results").insert(data).execute()
                    if res.data:
                        print(f"  Inserted new analysis: {res.data[0]['id']}")
                    else:
                        print(f"  Insert returned no data for {user['name']}")
                except Exception as insert_err:
                    print(f"  Insert failed for {user['name']}: {insert_err}")
                
        print("Re-analysis complete!")
    except Exception as e:
        print(f"Error during re-analysis: {e}")

if __name__ == "__main__":
    asyncio.run(reanalyze_all())
