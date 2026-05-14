import os
import json
from typing import Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client with environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AIService:
    async def transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribe audio using OpenAI Whisper STT
        """
        try:
            with open(audio_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file,
                    language="ko"
                )
            return transcript.text
        except Exception as e:
            print(f"STT Error: {e}")
            return "음성 인식에 실패했습니다."

    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze text for emotion, depression risk, repetition, and dementia patterns using GPT-4o
        """
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": """
                    당신은 독거노인 심리 분석 전문가입니다. 
                    입력된 대화 텍스트를 분석하여 반드시 다음 형식을 갖춘 JSON 데이터로만 응답하세요.
                    
                    항목:
                    - emotion: 'stable' (안정), 'sad' (슬픔), 'angry' (분노), 'anxious' (불안) 중 하나
                    - depression_risk: 0 ~ 100 (우울 위험도 점수)
                    - risk_level: 'Normal', 'Warning', 'Danger' 중 하나
                    - summary: 분석 내용을 바탕으로 어르신의 상태를 한 줄로 요약 (한국어)
                    - dementia_pattern: true/false (문맥 붕괴 등 치매 의심 징후 여부)
                    """},
                    {"role": "user", "content": text}
                ],
                response_format={ "type": "json_object" }
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"AI Analysis Error: {e}")
            return {
                "emotion": "stable",
                "depression_risk": 0,
                "risk_level": "Normal",
                "summary": "분석 데이터 부족",
                "dementia_pattern": False
            }

ai_service = AIService()
