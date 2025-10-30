-- 케이프로미넌트 정책자금 상담 데이터베이스 스키마 (kproment2-db)
-- 사용자 상담 세션 테이블
CREATE TABLE IF NOT EXISTS consultation_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled'))
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

-- 정책자금 상담 결과 테이블
CREATE TABLE IF NOT EXISTS consultation_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  support_amount_min INTEGER, 
  support_amount_max INTEGER, 
  approval_probability INTEGER, 
  recommended_programs TEXT, 
  support_summary TEXT, 
  business_type TEXT, 
  region TEXT, 
  gender TEXT, 
  age_group TEXT, 
  education_level TEXT,
  job_field TEXT, 
  loan_history TEXT, 
  support_experience TEXT, 
  business_item TEXT, 
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
  consultation_type TEXT DEFAULT 'phone' CHECK (consultation_type IN ('phone', 'meeting', 'video')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id)
);

-- 정부지원사업 정보 테이블 (참조용)
CREATE TABLE IF NOT EXISTS support_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_name TEXT NOT NULL,
  program_type TEXT NOT NULL, 
  support_amount_min INTEGER, 
  support_amount_max INTEGER, 
  eligibility_conditions TEXT, 
  required_documents TEXT, 
  application_period TEXT, 
  support_agency TEXT, 
  contact_info TEXT, 
  is_active BOOLEAN DEFAULT 1, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 지역별 지원사업 정보 테이블
CREATE TABLE IF NOT EXISTS regional_support (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region TEXT NOT NULL,
  program_name TEXT NOT NULL,
  support_amount_min INTEGER,
  support_amount_max INTEGER,
  special_conditions TEXT, -- 특별 조건
  competition_rate REAL, -- 경쟁률
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 상담 통계 테이블
CREATE TABLE IF NOT EXISTS consultation_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  pending_sessions INTEGER DEFAULT 0,
  avg_approval_probability REAL DEFAULT 0,
  most_common_region TEXT,
  most_common_business_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 관리자 패스워드 테이블
CREATE TABLE IF NOT EXISTS admin_password (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  password TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_answers_session_id ON user_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_consultation_results_session_id ON consultation_results(session_id);
CREATE INDEX IF NOT EXISTS idx_consultation_results_business_type ON consultation_results(business_type);
CREATE INDEX IF NOT EXISTS idx_consultation_results_region ON consultation_results(region);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_session_id ON consultation_bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_support_programs_type ON support_programs(program_type);
CREATE INDEX IF NOT EXISTS idx_support_programs_active ON support_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_regional_support_region ON regional_support(region);
CREATE INDEX IF NOT EXISTS idx_consultation_stats_date ON consultation_stats(date);

-- 샘플 데이터 (선택사항)
-- INSERT INTO consultation_sessions (session_id, status) VALUES ('sample_session_001', 'completed');
-- INSERT INTO user_answers (session_id, question_id, question_text, answer_text, answer_category) VALUES 
--   ('sample_session_001', 1, '1.현재 사업자등록증 없는 예비창업자 이신가요?', '네,사업자 등록 한적없습니다', '사업자 상태'),
--   ('sample_session_001', 2, '2.예비창업제도 정부지원 사업에 대해서 알고 계신가요?', '들어본 적 있습니다', '정부지원 경험');

-- 정부지원사업 샘플 데이터
INSERT INTO support_programs (program_name, program_type, support_amount_min, support_amount_max, eligibility_conditions, support_agency) VALUES 
  ('예비창업자 패키지', '예비창업자', 3000, 5000, '사업자등록증 없음, 만39세 이하', '중소벤처기업부'),
  ('청년창업사관학교', '청년창업자', 5000, 10000, '만39세 이하, 4년제 대학 졸업', '중소벤처기업부'),
  ('여성창업멘토링', '여성창업자', 2000, 5000, '여성, 사업자등록 3년 미만', '여성가족부'),
  ('지역균형발전 창업지원', '지역창업자', 3000, 8000, '지방 거주, 지역특화산업', '기획재정부'),
  ('IT기술창업 지원', 'IT창업자', 5000, 15000, 'IT관련 사업, 기술특허 보유', '과학기술정보통신부');

-- 지역별 지원사업 샘플 데이터
INSERT INTO regional_support (region, program_name, support_amount_min, support_amount_max, competition_rate) VALUES 
  ('서울', '서울창업허브', 5000, 10000, 3.2),
  ('수도권', '경기창업지원', 4000, 8000, 2.8),
  ('부산', '부산창업특구', 3000, 7000, 2.1),
  ('대구', '대구창업지원', 3000, 6000, 1.9),
  ('광주', '광주창업지원', 2000, 5000, 1.5),
  ('대전', '대전창업지원', 2000, 5000, 1.7),
  ('울산', '울산창업지원', 2000, 4000, 1.3),
  ('세종', '세종창업지원', 3000, 6000, 1.8),
  ('강원', '강원창업지원', 2000, 5000, 1.2),
  ('제주', '제주창업지원', 2000, 4000, 1.1);

-- 관리자 기본 패스워드 (1234)
INSERT OR IGNORE INTO admin_password (id, password) VALUES (1, '1234');