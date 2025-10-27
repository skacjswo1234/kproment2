-- D1 데이터베이스 스키마
-- 사용자 상담 세션 테이블
CREATE TABLE IF NOT EXISTS consultation_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'in_progress' 
);

-- 사용자 답변 테이블
CREATE TABLE IF NOT EXISTS user_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  question_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  answer_category TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id)
);

-- 상담 결과 테이블
CREATE TABLE IF NOT EXISTS consultation_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  loan_amount_min INTEGER,
  loan_amount_max INTEGER,
  interest_rate_min REAL,
  interest_rate_max REAL,
  approval_probability INTEGER,
  recommended_products TEXT, -- JSON 형태로 저장
  consultation_summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id)
);

-- 상담 예약 테이블
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_time TEXT,
  consultation_type TEXT DEFAULT 'phone', 
  status TEXT DEFAULT 'pending', 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_answers_session_id ON user_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_consultation_results_session_id ON consultation_results(session_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_session_id ON consultation_bookings(session_id);

-- 샘플 데이터 (선택사항)
-- INSERT INTO consultation_sessions (session_id, status) VALUES ('sample_session_001', 'completed');
-- INSERT INTO user_answers (session_id, question_id, question_text, answer_text, answer_category) VALUES 
--   ('sample_session_001', 1, '현재 사업자등록증이 없는 예비창업자 이신가요?', '네. 사업자 등록 한적 없습니다', '사업자 상태'),
--   ('sample_session_001', 2, '희망 대출 금액은 얼마인가요?', '1,000만원 ~ 3,000만원', '대출 금액');
