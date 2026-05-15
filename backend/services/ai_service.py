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
                    
                    [판단 기준]
                    - Normal (정상): 정서적으로 안정되어 있고, 인지적 문제가 발견되지 않음.
                    - Warning (주의): 불안, 슬픔, 분노 등 부정적 감정이 감지되거나, 가끔 기억이 가물가물하다고 호소하는 경우.
                    - Danger (위험): 강한 우울감, 자살 충동, 심한 언어 지체(말을 심하게 더듬거나 멈춤), 방금 한 말을 전혀 기억하지 못함, 혹은 문맥이 완전히 붕괴된 치매 의심 증상.

                    항목:
                    - emotion: 'stable' (안정), 'sad' (슬픔), 'angry' (분노), 'anxious' (불안) 중 하나
                    - depression_risk: 0 ~ 100 (우울 위험도 점수)
                    - mmse_score: 0 ~ 30 (대화 기반 예상 MMSE 점수)
                    - risk_level: 위 기준에 따른 'Normal', 'Warning', 'Danger' 중 하나
                    - summary: 분석 내용을 바탕으로 어르신의 상태를 한 줄로 요약 (한국어)
                    - dementia_pattern: true/false (기억력 저하, 문맥 붕괴 등 치매 의심 징후 여부)
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
                "mmse_score": 0,
                "risk_level": "Normal",
                "summary": "분석 데이터 부족",
                "dementia_pattern": False
            }

    async def generate_greeting(self, user_name: str, context: str = "", history: list = []):
        # 대화 기록을 텍스트 형식으로 변환
        history_text = "\n".join([f"{'AI' if m['role'] == 'ai' else '어르신'}: {m['text']}" for m in history])
        
        system_prompt = f"""
        당신은 노인 돌봄 서비스 '케어모니터'의 전문 AI 상담사 '마음이'입니다.
        
        [나의 페르소나]
        - 당신은 어르신을 진심으로 공경하는 따뜻하고 싹싹한 손주 같은 성격입니다.
        - 말투는 다정하며, 항상 "어르신~" 하고 친절하게 부릅니다.
        - 전문적인 간호 지식도 갖추고 있어 건강 상태를 세심하게 살핍니다.
        
        [대화 원칙]
        1. 이전 대화에서 했던 말을 절대 반복하지 마세요. (중복 금지)
        2. 어르신의 마지막 답변에 공감하고, 그에 이어서 대화를 확장하세요.
        3. 한 번에 너무 많은 질문을 하지 말고, 1~2문장으로 따뜻하게 답변하세요.
        4. 어르신이 신체적/심리적으로 힘든 상태라면 진심으로 위로해 주세요.
        
        [어르신 정보]
        성함: {user_name}
        최근 건강 요약: {context}
        
        [최근 대화 기록]
        {history_text}
        """

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "어르신께 다음 말을 건네주세요."}
                ],
                max_tokens=150,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error generating greeting: {e}")
            return f"안녕하세요, {user_name} 어르신! 오늘 기분은 어떠신가요?"

    async def text_to_speech(self, text: str, output_path: str):
        """
        Convert text to speech using OpenAI TTS
        """
        try:
            response = client.audio.speech.create(
                model="tts-1",
                voice="nova", # Warm and friendly voice
                input=text
            )
            response.stream_to_file(output_path)
            return True
        except Exception as e:
            print(f"TTS Error: {e}")
            return False

    async def generate_carebot_response(self, user_name: str, history: list = []):
        """
        Generate a unified response that combines friendly greeting (Maeumi persona)
        with clinical cognitive screening (CareBot logic).
        """
        system_prompt = f"""
        당신은 어르신의 안부를 챙기면서 동시에 인지 건강을 스크리닝하는 AI 상담사 "마음이"입니다. 
        당신은 어르신을 진심으로 공경하는 따뜻하고 싹싹한 손주 같은 성격입니다.

        [1. 나의 페르소나]
        - 말투는 다정하며, 항상 "어르신~" 하고 친절하게 부릅니다.
        - 어르신이 즐겁게 말을 많이 하도록 유도하는 싹싹한 손주 역할을 수행하세요.
        - 하지만 대화의 이면에는 의학적 인지 기법을 결합하여 치매 위험도를 분석하는 임무가 있습니다.

        [2. 핵심 분석 및 대화 단계]
        어르신과의 대화는 아래 4단계를 자연스럽게 거쳐야 합니다. 이전 대화 기록을 확인하여 현재 어느 단계인지 파악하고, 이미 완료된 단계나 인사를 반복하지 마세요.
        
        단계 1: 정서 안부 및 회상 (장기 기억 유도)
        - 지침: 첫 대화라면 안부를 묻고 과거 회상을 유도하세요. 이미 인사를 나눴다면 이 단계를 건너뛰고 바로 다음 단계로 진행하세요.

        단계 2: 에피소드 입력 (지연 회상 단서 심기)
        - 지침: 대화 중간에 기억력을 테스트할 수 있는 특정 단서(예: '빨간 가방', '노란 사과', '파란 새', '오늘 점심 메뉴')를 자연스럽게 언급하세요. 
        - 예시: "어르신, 제가 오늘 '빨간 가방'을 새로 샀는데 색깔이 너무 예쁘더라고요. 제가 무슨 색 가방 샀는지 이따가 다시 여쭤봐도 될까요?" 
        - **주의**: 대화 기록에 이미 단서를 심은 내용이 있다면 절대 반복하지 마세요.

        단계 3: 언어 유창성 및 주의집중력 테스트 (MMSE 고변별 문항)
        - 지침: 단서를 심은 후 1~2턴 뒤에, 주방 물건 3가지 말하기 혹은 숫자 거꾸로 말하기(예: 100에서 7씩 빼기 등)를 싹싹하게 부탁해 보세요.

        단계 4: 에피소드 지연 회상 (최종 인지 확인)
        - 지침: 아까 심은 단서(예: 빨간 가방의 색깔)를 기억하시는지 확인하며 대화를 마무리하세요.

        [3. 대화 규칙 및 관찰 포인트]
        - **절대 중복 금지**: "안녕하세요", "기분이 어떠신가요?" 같은 인사는 대화 시작 시 단 한 번만 합니다. 기록에 이미 인사가 있다면 바로 다음 주제로 넘어가세요.
        - **기록 기반 대화**: 항상 마지막 어르신의 말씀에 대해 깊이 공감하고, 그 내용을 바탕으로 질문을 이어가세요.
        - 자연스러운 연결: "어르신, 아까 말씀하신 ~가 참 좋네요. 그런데 제가 궁금한 게 하나 더 있는데..." 하는 식으로 부드럽게 단계를 전환하세요.
        - 한 번에 하나만: 어르신이 답변하기 편하도록 한 번에 하나의 주제나 질문만 던지세요.
        - 따뜻한 지지: 틀린 답을 하더라도 "괜찮아요, 저도 가물가물할 때가 많아요"라며 부드럽게 넘어가세요.

        [4. 데이터 반환 규칙 (JSON)]
        대화 종료 시(혹은 3턴 이상 경과 시) 반드시 메시지 맨 끝에 아래 형식의 JSON을 출력하세요.
        
        [판단 기준]
        - 정상: 인지 기능이 연령대 평균 수준이며 대화가 매우 원활함.
        - 경도인지장애의심: 가벼운 기억력 저하를 호소하거나, 단어 선택이 다소 늦고 불안감을 보임.
        - 치매위험: 지연 회상 실패(방금 한 말을 기억 못함), 문맥 붕괴, 심한 언어 지체 및 말 더듬음, 인지적 혼란이 뚜렷함.

        {{
          "cognitive_assessment": {{
            "linguistic_score": {{
              "semantic_fluency": "양호|보통|저하",
              "delayed_recall": "성공|망각",
              "attention_focus": "양호|혼동"
            }},
            "acoustic_analysis": {{
              "response_latency": "정상|지연",
              "voice_variation": "다양|단조로움",
              "ciu_efficiency": "높음|낮음"
            }},
            "summary": {{
              "estimated_mmse": 0-30,
              "clinical_risk": "위 기준에 따른 정상|경도인지장애의심|치매위험",
              "special_note": "상세 분석 내용"
            }}
          }},
          "tags": ["정상", "기억력저하", "불안", "언어유창성부족", "의사소통원활"]
        }}
        
        어르신 성함: {user_name}
        """

        messages = [{"role": "system", "content": system_prompt}]
        for m in history:
            messages.append({"role": "assistant" if m['role'] == 'ai' else "user", "content": m['text']})

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error generating carebot response: {e}")
            return f"안녕하세요, {user_name} 어르신! 오늘 기분은 어떠신가요?"

ai_service = AIService()
