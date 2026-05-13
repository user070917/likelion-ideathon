import os
import json
from typing import Dict, Any
from openai import OpenAI

# Initialize OpenAI client with environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "your_openai_api_key_here"))

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
                    - emotion_score: 0.0 ~ 1.0 (감정의 강도)
                    - depression_risk: 0 ~ 100 (우울 위험도 점수)
                    - repeat_ratio: 0.0 ~ 1.0 (단어/문장 반복성)
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
                "emotion_score": 0.0,
                "depression_risk": 0,
                "repeat_ratio": 0.0,
                "dementia_pattern": False
            }

ai_service = AIService()
