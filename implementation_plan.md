# AI 선제적 대화 시작(Proactive Conversation) 기능 구현 계획

현재 시스템은 사용자의 음성을 녹음하여 분석하는 **수동적(Passive) 수집** 방식입니다. 이를 AI가 먼저 안부를 묻거나 대화를 유도하는 **능동적(Proactive) 방식**으로 전환하기 위한 아키텍처 및 구현 계획입니다.

## User Review Required

> [!IMPORTANT]
> **대상 기기(Client)에 대한 결정이 필요합니다.**
> 실제 환경에서는 어르신 댁에 설치된 스피커나 태블릿 앱이 필요합니다. 현재 우리가 만든 것은 '사회복지사용 대시보드'뿐입니다. 
> 
> **이번 구현의 목표를 어떻게 잡을까요?**
> 1. **시뮬레이션 모드 (추천)**: 현재 대시보드의 '음성 분석' 버튼을 누르면, AI가 먼저 인사말 오디오를 재생하고(TTS), 바로 이어서 어르신의 대답을 녹음하는 형태로 기존 UI 내에서 흐름을 구현.
> 2. **어르신용 웹페이지 신규 제작**: `/resident/[id]` 형태의 간단한 페이지를 새로 만들어, 해당 페이지가 열려 있으면 서버에서 신호를 보내 AI가 말을 걸고 대답을 듣는 실제 기기 환경을 모방.

## Open Questions

> [!WARNING]
> 1. **발화 트리거(Trigger) 방식**: AI가 말을 거는 시점은 어떻게 정할까요? 
>    - 사회복지사가 대시보드에서 [말걸기] 버튼을 눌렀을 때 수동 트리거
>    - 정해진 시간(아침 9시, 식사 시간 등)에 스케줄러에 의한 자동 트리거
> 2. **대화 기록 저장**: `conversations` 테이블에 AI가 한 말과 어르신이 한 말을 구분해서 저장해야 합니다. 테이블 구조(role 컬럼 추가 등) 변경에 동의하시나요?

---

## 핵심 구현 로직 (Workflow)

1. **Trigger (발화 시작)**: 특정 조건(시간, 버튼 클릭)에 의해 프로세스 시작.
2. **Context Generation (문맥 생성)**: 백엔드에서 해당 어르신의 DB 정보(이름, 건강상태, 이전 대화 요약)를 바탕으로 GPT-4o에게 "어르신에게 건넬 첫 인사말을 50자 이내로 작성해줘"라고 요청.
3. **TTS (Text-to-Speech)**: 생성된 인사말 텍스트를 OpenAI TTS API를 사용하여 사람의 목소리(따뜻한 음성) 오디오 파일로 변환.
4. **Delivery & Play**: 변환된 오디오를 클라이언트(프론트엔드)로 전송하여 재생.
5. **Listening (응답 대기)**: 오디오 재생이 끝남과 동시에 자동으로 마이크가 켜지며 어르신의 대답을 녹음 시작 (기존 STT -> 분석 파이프라인으로 연결).

---

## Proposed Changes

### Backend (FastAPI)

#### [MODIFY] `backend/services/ai_service.py`
- OpenAI TTS (Text-to-Speech) API 연동 함수 추가.
- 어르신 프로필을 기반으로 맞춤형 인사말을 생성하는 프롬프트 및 함수 추가.

#### [MODIFY] `backend/main.py`
- `GET /users/{user_id}/greeting`: 특정 사용자를 위한 맞춤형 인사말 오디오와 텍스트를 생성하여 반환하는 신규 API 엔드포인트 추가.

#### [MODIFY] `backend/database/schema.sql`
- `conversations` 테이블에 `speaker_role` (예: 'ai', 'resident') 컬럼을 추가하여 누가 한 말인지 구분하도록 구조 개선.

---

### Frontend (Next.js)

*※ 1안(시뮬레이션 모드) 선택 기준*

#### [MODIFY] `frontend/src/api/index.ts`
- 인사말 오디오를 받아오는 API 호출 함수(`generateGreeting`) 추가.

#### [MODIFY] `frontend/src/components/dashboard/VoiceRecordModal.tsx`
- **모달 흐름 변경**: 
  1. 모달이 열리면 즉시 녹음이 시작되지 않고, `generateGreeting` API를 호출하여 **AI 인사말을 먼저 재생**.
  2. 오디오 요소(`<audio>`)의 `onEnded` 이벤트를 감지하여, AI의 말이 끝나면 **자동으로 녹음 모드(MediaRecorder) 시작**.
- UI에 "AI가 인사말을 준비 중입니다...", "AI가 말하는 중...", "어르신 대답을 듣는 중..." 등의 상태 표시 추가.

---

## Verification Plan

### Manual Verification
1. 대시보드에서 특정 입주자의 '음성 분석' 버튼 클릭.
2. 모달이 뜨면서 잠시 후 스피커에서 AI의 맞춤형 인사말(예: "김어르신, 식사는 하셨어요? 오늘 관절은 좀 어떠신가요?")이 음성으로 출력되는지 확인.
3. 인사말이 끝나자마자 자동으로 마이크가 활성화되어 사용자의 음성을 녹음하는지 확인.
4. 녹음 종료 후 기존처럼 AI 분석 결과가 정상적으로 도출되는지 확인.
5. 데이터베이스 `conversations` 테이블에 AI의 발화와 사용자의 발화가 각각 올바르게 기록되었는지 확인.
