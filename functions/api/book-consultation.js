// Cloudflare Pages Functions - 상담 예약 API
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { sessionId, name, phone, email, consultationType } = await request.json();
    
    if (!sessionId || !name || !phone) {
      return new Response(JSON.stringify({ error: '필수 필드가 누락되었습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 상담 예약 저장
    const result = await env['kproment2-db'].prepare(
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
