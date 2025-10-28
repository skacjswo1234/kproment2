// Cloudflare Pages Functions - 답변 저장 API
export async function onRequestPost(context) {
  return handleRequest(context);
}

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

async function handleRequest(context) {
  const { request, env } = context;
  
  try {
    console.log('=== 답변 저장 API 호출됨 ===');
    console.log('env 객체:', env);
    console.log('env.DB 존재:', !!env.DB);
    console.log('env.DB 타입:', typeof env.DB);
    
    // D1 바인딩 확인 - kproment2-db 사용
    let db = env['kproment2-db'];
    console.log('kproment2-db 바인딩 존재:', !!db);
    
    if (!db) {
      console.error('kproment2-db 데이터베이스가 바인딩되지 않았습니다!');
      console.log('사용 가능한 env 키들:', Object.keys(env));
      return new Response(JSON.stringify({ 
        error: 'kproment2-db 데이터베이스가 바인딩되지 않았습니다.',
        availableKeys: Object.keys(env),
        suggestion: 'Cloudflare Pages에서 D1 바인딩을 확인해주세요.'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    const body = await request.json();
    console.log('요청 데이터:', body);
    
    const { sessionId, questionId, questionText, answerText, answerCategory } = body;
    
    // 데이터 타입 변환
    const questionIdInt = parseInt(questionId);
    
    if (!sessionId || !questionIdInt || !answerText) {
      console.log('필수 필드 누락:', { sessionId, questionId: questionIdInt, answerText });
      return new Response(JSON.stringify({ error: '필수 필드가 누락되었습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 테이블 존재 확인 및 생성
    console.log('테이블 존재 확인 중...');
    const tables = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('현재 테이블:', tables.results);
    
    // 필요한 테이블이 없으면 생성
    const tableNames = tables.results.map(t => t.name);
    if (!tableNames.includes('consultation_sessions')) {
      console.log('consultation_sessions 테이블 생성 중...');
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS consultation_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'in_progress' 
        )
      `).run();
    }
    
    if (!tableNames.includes('user_answers')) {
      console.log('user_answers 테이블 생성 중...');
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS user_answers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          question_id INTEGER NOT NULL,
          question_text TEXT NOT NULL,
          answer_text TEXT NOT NULL,
          answer_category TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id)
        )
      `).run();
    }

    // 세션 존재 확인 또는 생성
    console.log('세션 확인 중...');
    const sessionResult = await db.prepare(
      'SELECT id FROM consultation_sessions WHERE session_id = ?'
    ).bind(sessionId).first();
    
    console.log('세션 결과:', sessionResult);

    if (!sessionResult) {
      console.log('새 세션 생성 중...');
      await db.prepare(
        'INSERT INTO consultation_sessions (session_id, status) VALUES (?, ?)'
      ).bind(sessionId, 'in_progress').run();
      console.log('세션 생성 완료');
    }

    // 답변 저장
    console.log('답변 저장 중...');
    const result = await db.prepare(
      'INSERT INTO user_answers (session_id, question_id, question_text, answer_text, answer_category) VALUES (?, ?, ?, ?, ?)'
    ).bind(sessionId, questionIdInt, questionText, answerText, answerCategory).run();
    
    console.log('저장 결과:', result);

    return new Response(JSON.stringify({ 
      success: true, 
      answerId: result.meta.last_row_id,
      message: '답변이 저장되었습니다.' 
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('=== 답변 저장 오류 ===');
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    console.error('전체 에러:', error);
    
    return new Response(JSON.stringify({ 
      error: '서버 오류가 발생했습니다.',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}
