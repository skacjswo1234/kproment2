// Cloudflare Pages Functions - 답변 저장 API
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { sessionId, questionId, questionText, answerText, answerCategory } = await request.json();
    
    if (!sessionId || !questionId || !answerText) {
      return new Response(JSON.stringify({ error: '필수 필드가 누락되었습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 세션 존재 확인 또는 생성
    const sessionResult = await env.DB.prepare(
      'SELECT id FROM consultation_sessions WHERE session_id = ?'
    ).bind(sessionId).first();

    if (!sessionResult) {
      await env.DB.prepare(
        'INSERT INTO consultation_sessions (session_id, status) VALUES (?, ?)'
      ).bind(sessionId, 'in_progress').run();
    }

    // 답변 저장
    const result = await env.DB.prepare(
      'INSERT INTO user_answers (session_id, question_id, question_text, answer_text, answer_category) VALUES (?, ?, ?, ?, ?)'
    ).bind(sessionId, questionId, questionText, answerText, answerCategory).run();

    return new Response(JSON.stringify({ 
      success: true, 
      answerId: result.meta.last_row_id,
      message: '답변이 저장되었습니다.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('답변 저장 오류:', error);
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
