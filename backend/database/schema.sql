-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    age INT,
    gender TEXT,
    phone_number TEXT,
    address TEXT,
    guardian_phone TEXT,
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analysis Results Table
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    emotion TEXT,
    depression_risk INT,
    risk_level TEXT,
    summary TEXT,
    dementia_pattern BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    risk_level TEXT, -- 'normal', 'warning', 'danger'
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Mock Data
INSERT INTO users (name, age, gender) VALUES 
('Eleanor Vance', 82, 'female'),
('Arthur Pendelton', 75, 'male'),
('Martha Stewart', 79, 'female'),
('James Robertson', 84, 'male');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create Public Access Policies (MVP/Prototype Mode)
-- Allows anyone with the anon key to read and write

-- Users Policies
DROP POLICY IF EXISTS "Public Read Access" ON users;
DROP POLICY IF EXISTS "Public Insert Access" ON users;
DROP POLICY IF EXISTS "Public Update Access" ON users;
CREATE POLICY "Public Read Access" ON users FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON users FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access" ON users FOR DELETE USING (true);

-- Conversations Policies
DROP POLICY IF EXISTS "Public Read Access" ON conversations;
DROP POLICY IF EXISTS "Public Insert Access" ON conversations;
CREATE POLICY "Public Read Access" ON conversations FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON conversations FOR INSERT WITH CHECK (true);

-- Analysis Results Policies
DROP POLICY IF EXISTS "Public Read Access" ON analysis_results;
DROP POLICY IF EXISTS "Public Insert Access" ON analysis_results;
CREATE POLICY "Public Read Access" ON analysis_results FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON analysis_results FOR INSERT WITH CHECK (true);

-- Alerts Policies
DROP POLICY IF EXISTS "Public Read Access" ON alerts;
DROP POLICY IF EXISTS "Public Insert Access" ON alerts;
CREATE POLICY "Public Read Access" ON alerts FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON alerts FOR INSERT WITH CHECK (true);

-- 1. 필요한 상세 정보 컬럼들을 테이블에 추가합니다.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS guardian_phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS medical_history TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age INTEGER;
-- 2. 컬럼 추가 후 API 서버가 즉시 인식하도록 캐시를 갱신합니다.
NOTIFY pgrst, 'reload schema';
