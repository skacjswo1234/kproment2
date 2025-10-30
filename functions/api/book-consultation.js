// Cloudflare Pages Functions - 상담 예약 API
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { sessionId, name, phone, email, consultationType, allAnswers } = await request.json();
    
    console.log('받은 데이터:', { sessionId, name, phone, allAnswers });
    
    if (!sessionId || !name || !phone) {
      return new Response(JSON.stringify({ error: '필수 필드가 누락되었습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env['kproment2-db'];
    
    // 세션 존재 확인 또는 생성
    const sessionResult = await db.prepare(
      'SELECT id FROM consultation_sessions WHERE session_id = ?'
    ).bind(sessionId).first();
    
    if (!sessionResult) {
      // 세션 생성
      await db.prepare(
        'INSERT INTO consultation_sessions (session_id, status) VALUES (?, ?)'
      ).bind(sessionId, 'completed').run();
    }

    // 모든 답변을 한 번에 저장
    if (allAnswers && Array.isArray(allAnswers) && allAnswers.length > 0) {
      console.log('전체 답변 저장 중...', allAnswers.length, '개');
      
      for (const answer of allAnswers) {
        await db.prepare(
          'INSERT INTO user_answers (session_id, question_id, question_text, answer_text, answer_category) VALUES (?, ?, ?, ?, ?)'
        ).bind(
          sessionId,
          answer.questionId,
          answer.questionText,
          answer.answerText,
          answer.answerCategory
        ).run();
      }
      
      console.log('전체 답변 저장 완료');
    }

    // 상담 예약 저장
    const result = await db.prepare(
      'INSERT INTO consultation_bookings (session_id, name, phone, email, consultation_type) VALUES (?, ?, ?, ?, ?)'
    ).bind(sessionId, name, phone, email || '', consultationType || 'phone').run();

    return new Response(JSON.stringify({ 
      success: true,
      bookingId: result.meta.last_row_id,
      message: '상담 예약이 완료되었습니다. 곧 연락드리겠습니다.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('상담 예약 오류:', error);
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
