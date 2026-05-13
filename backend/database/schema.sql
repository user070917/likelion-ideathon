-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    age INT,
    gender TEXT,
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
    emotion_score FLOAT,
    depression_risk INT,
    repeat_ratio FLOAT,
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
CREATE POLICY "Public Read Access" ON users FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Access" ON conversations FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Access" ON analysis_results FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON analysis_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Access" ON alerts FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON alerts FOR INSERT WITH CHECK (true);
