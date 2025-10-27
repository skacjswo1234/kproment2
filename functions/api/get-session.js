// Cloudflare Pages Functions - 세션 조회 API
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  
  if (!sessionId) {
    return new Response(JSON.stringify({ error: '세션 ID가 필요합니다.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 세션 정보 조회
    const session = await env.DB.prepare(
      'SELECT * FROM consultation_sessions WHERE session_id = ?'
    ).bind(sessionId).first();

    if (!session) {
      return new Response(JSON.stringify({ error: '세션을 찾을 수 없습니다.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 답변 조회
    const answers = await env.DB.prepare(
      'SELECT * FROM user_answers WHERE session_id = ? ORDER BY created_at'
    ).bind(sessionId).all();

    // 상담 결과 조회
    const result = await env.DB.prepare(
      'SELECT * FROM consultation_results WHERE session_id = ?'
    ).bind(sessionId).first();

    // 상담 예약 조회
    const booking = await env.DB.prepare(
      'SELECT * FROM consultation_bookings WHERE session_id = ?'
    ).bind(sessionId).first();

    return new Response(JSON.stringify({
      success: true,
      session,
      answers: answers.results || [],
      result,
      booking
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('세션 조회 오류:', error);
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
