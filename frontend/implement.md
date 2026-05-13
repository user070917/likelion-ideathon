# AI 기반 독거노인 감정 분석 및 위험 감지 시스템 구현 기획서

## 1. 프로젝트 개요

본 프로젝트는 독거노인의 음성 데이터를 기반으로 감정 상태, 우울 위험도, 반복 표현, 치매 의심 패턴 등을 AI로 분석하여  
복지사가 웹 대시보드에서 위험 신호를 빠르게 확인할 수 있도록 돕는 서비스이다.

사용자는 AI 스피커 또는 웹/모바일 음성 입력을 통해 대화하며,  
시스템은 STT(Speech To Text) → AI 분석 → 데이터 저장 → 시각화 과정을 자동으로 수행한다.

---

# 2. 전체 시스템 구조

```text
[ 사용자 음성 ]
        ↓
[ Whisper STT ]
        ↓
[ 텍스트 변환 ]
        ↓
[ AI 분석 서버 ]
 - 감정 분석
 - 우울 위험도 분석
 - 반복 표현 분석
 - 치매 의심 패턴 탐지
        ↓
[ 분석 결과 JSON 생성 ]
        ↓
[ Backend API 서버 ]
        ↓
[ PostgreSQL(DB) 저장 ]
        ↓
[ 복지사 웹 UI ]
 - 위험도 표시
 - 감정 변화 그래프
 - 최근 대화 요약
 - 알림 시스템
```

---

# 3. 기술 스택

## Frontend

현재 제작된 UI GitHub:
https://github.com/user070917/likelion-ideathon

사용 기술:
- React
- Vite
- TailwindCSS
- Chart.js 또는 Recharts
- Axios

역할:
- 복지사 대시보드 UI
- 사용자 정보 조회
- 감정 변화 그래프 출력
- 위험도 표시
- 최근 대화 기록 표시
- 알림 표시

---

## Backend

추천 기술:
- FastAPI
- Uvicorn
- JWT 인증
- WebSocket (실시간 알림)

선정 이유:
- Python AI 모델과 연결이 매우 쉬움
- REST API 작성 속도가 빠름
- 비동기 처리 성능 우수
- Whisper 및 HuggingFace 모델 연동 용이

주요 기능:
- 음성 업로드 API
- 분석 결과 저장 API
- 사용자 조회 API
- 위험 알림 API
- 복지사 대시보드 API

---

## AI 분석 서버

추천 기술:
- Python
- Transformers
- HuggingFace
- OpenAI Whisper
- KoBERT / KLUE BERT

기능:
- STT 처리
- 감정 분석
- 우울 위험 분석
- 반복 표현 분석
- 치매 의심 패턴 탐지

---

## Database

추천:
- Supabase PostgreSQL

선정 이유:
- PostgreSQL 기반
- 실시간 기능 제공
- 인증 기능 내장
- React 연동 쉬움
- 무료 플랜 사용 가능

저장 데이터:
- 사용자 정보
- 음성 텍스트
- 감정 분석 결과
- 위험도 기록
- 알림 기록

---

# 4. 추천 아키텍처

## 최종 추천 구조

```text
React(Vercel 배포)
        ↓
FastAPI(Render/Railway 배포)
        ↓
Supabase PostgreSQL
        ↓
Python AI 분석 서버
```

---

# 5. 데이터 흐름 설계

## 음성 입력 처리 흐름

### 1단계
사용자가 음성 입력

### 2단계
Whisper가 음성을 텍스트로 변환

예시:

```json
{
  "text": "오늘 너무 우울하고 힘들어요"
}
```

---

### 3단계
AI 분석 수행

분석 항목:
- 감정 상태
- 우울 위험도
- 반복 단어
- 치매 의심 패턴

---

### 4단계
분석 결과 JSON 생성

예시:

```json
{
  "emotion": "sad",
  "emotion_score": 0.95,
  "depression_risk": 82,
  "repeat_ratio": 0.33,
  "dementia_pattern": true
}
```

---

### 5단계
Backend API로 전송

```http
POST /analysis
```

---

### 6단계
DB 저장

저장 항목:
- 사용자 ID
- 대화 내용
- 분석 결과
- 생성 시간

---

### 7단계
복지사 웹 UI에서 조회

표시 항목:
- 위험도 색상 표시
- 감정 변화 그래프
- 최근 대화 요약
- 위험 알림

---

# 6. DB 설계

## users 테이블

| 컬럼명 | 타입 |
|---|---|
| id | uuid |
| name | text |
| age | int |
| gender | text |
| created_at | timestamp |

---

## conversations 테이블

| 컬럼명 | 타입 |
|---|---|
| id | uuid |
| user_id | uuid |
| text | text |
| created_at | timestamp |

---

## analysis_results 테이블

| 컬럼명 | 타입 |
|---|---|
| id | uuid |
| conversation_id | uuid |
| emotion | text |
| emotion_score | float |
| depression_risk | int |
| repeat_ratio | float |
| dementia_pattern | boolean |
| created_at | timestamp |

---

## alerts 테이블

| 컬럼명 | 타입 |
|---|---|
| id | uuid |
| user_id | uuid |
| risk_level | text |
| message | text |
| created_at | timestamp |

---

# 7. API 설계

## 음성 업로드

```http
POST /upload/audio
```

역할:
- 음성 파일 업로드
- Whisper 분석 요청

---

## 분석 결과 저장

```http
POST /analysis
```

---

## 사용자 목록 조회

```http
GET /users
```

---

## 특정 사용자 분석 조회

```http
GET /users/{id}/analysis
```

---

## 위험 알림 조회

```http
GET /alerts
```

---

# 8. 프론트엔드 구현 구조

## 추천 폴더 구조

```text
src/
 ├── components/
 ├── pages/
 ├── api/
 ├── hooks/
 ├── store/
 ├── charts/
 └── utils/
```

---

## 주요 페이지

### Dashboard
- 위험 사용자 리스트
- 감정 변화 그래프
- 위험 알림

### UserDetail
- 최근 대화 기록
- 위험 분석 결과
- 감정 변화 추이

### AlertPage
- 위험 알림 목록
- 긴급 사용자 확인

---

# 9. AI 분석 모델 추천

## STT

### Whisper
추천 이유:
- 한국어 성능 우수
- 노이즈 환경 강함

---

## 감정 분석

### KLUE BERT
추천 이유:
- 한국어 최적화
- 감정 분석 정확도 높음

---

## 치매 의심 패턴

규칙 기반 + NLP 혼합 추천

예시:
- 단어 반복 증가
- 문맥 붕괴
- 질문 반복
- 기억 혼동 표현

---

# 10. 위험도 계산 예시

```python
risk_score =
    depression_score * 0.5 +
    repeat_ratio * 30 +
    dementia_pattern * 20
```

위험 단계:
- 0~30 → 정상
- 31~60 → 주의
- 61~100 → 위험

---

# 11. 실시간 알림 시스템

추천:
- Supabase Realtime
또는
- FastAPI WebSocket

알림 조건:
- 우울 위험도 70 이상
- 반복 표현 급증
- 치매 패턴 감지

복지사 UI에서:
- 빨간 배지 표시
- 실시간 알림 팝업
- 위험 사용자 상단 고정

---

# 12. 배포 구조

## Frontend
추천:
- Vercel

---

## Backend
추천:
- Railway
또는
- Render

---

## DB
추천:
- Supabase

---

## AI 서버
추천:
- Railway GPU
또는
- 별도 Python 서버

---

# 13. 구현 우선순위

## 1차 MVP

- 로그인
- 사용자 목록
- 음성 업로드
- Whisper STT
- 감정 분석
- 결과 저장
- 위험도 표시

---

## 2차 기능 확장

- 실시간 알림
- 감정 변화 그래프
- 치매 패턴 분석
- 최근 대화 요약

---

## 3차 고도화

- AI 챗봇 연동
- 자동 전화 시스템
- AI 음성 대화
- 장기 감정 변화 분석
- 이상 행동 탐지

---

# 14. 최종 추천

현재 프로젝트 기준 가장 현실적이고 구현 난이도가 적절한 조합:

- Frontend → React + Vite
- Backend → FastAPI
- AI → Whisper + HuggingFace
- DB → Supabase PostgreSQL
- 배포 → Vercel + Railway

이 구조가:
- 해커톤 개발 속도 빠름
- 실제 서비스 확장 가능
- AI 연동 쉬움
- 유지보수 편함
- React UI와 연결 쉬움

이라는 장점이 있다.
