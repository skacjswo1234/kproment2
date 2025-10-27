
DROP TABLE IF EXISTS consultation_bookings;
DROP TABLE IF EXISTS consultation_results;
DROP TABLE IF EXISTS user_answers;
DROP TABLE IF EXISTS consultation_sessions;


CREATE TABLE consultation_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'in_progress' 
);


CREATE TABLE user_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  question_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  answer_category TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id)
);


CREATE TABLE consultation_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  loan_amount_min INTEGER,
  loan_amount_max INTEGER,
  interest_rate_min REAL,
  interest_rate_max REAL,
  approval_probability INTEGER,
  recommended_products TEXT, 
  consultation_summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id)
);


CREATE TABLE consultation_bookings (
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


CREATE INDEX idx_user_answers_session_id ON user_answers(session_id);
CREATE INDEX idx_consultation_results_session_id ON consultation_results(session_id);
CREATE INDEX idx_consultation_bookings_session_id ON consultation_bookings(session_id);


SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
