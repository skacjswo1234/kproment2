// Cloudflare Pages Functions - 관리자 문의리스트 조회
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    // 토큰/세션 없이 단순 조회 요구사항에 맞춰 공개 조회

    // D1 데이터베이스에서 문의리스트 조회
    const db = env.kproment2_db || env['kproment2-db'];
    if (!db) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '데이터베이스 연결 오류' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 문의리스트 조회 (최신순)
    const result = await db.prepare(`
      SELECT 
        id,
        session_id,
        question_id,
        question_text,
        answer_text,
        answer_category,
        created_at
      FROM user_answers 
      ORDER BY created_at DESC
    `).all();

    // 예약 정보 조회
    const bookingsResult = await db.prepare(`
      SELECT 
        id,
        session_id,
        name,
        phone,
        email,
        consultation_type,
        status,
        created_at
      FROM consultation_bookings
      ORDER BY created_at DESC
    `).all();

    // 예약 정보를 세션ID로 매핑 (원본 UTC 시간 그대로 반환)
    const bookingsBySession = {};
    bookingsResult.results.forEach(booking => {
      bookingsBySession[booking.session_id] = {
        bookingId: booking.id,
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        consultationType: booking.consultation_type,
        status: booking.status,
        bookingDate: booking.created_at
      };
    });

    // 세션별로 그룹화 (원본 UTC 시간 그대로 반환)
    const inquiriesBySession = {};
    result.results.forEach(row => {
      const sessionId = row.session_id;
      if (!inquiriesBySession[sessionId]) {
        const booking = bookingsBySession[sessionId] || {};
        inquiriesBySession[sessionId] = {
          sessionId: sessionId,
          bookingId: booking.bookingId || null,
          name: booking.name || '미등록',
          phone: booking.phone || '미등록',
          email: booking.email || '',
          consultationType: booking.consultationType || 'phone',
          status: booking.status || 'pending',
          answers: [],
          createdAt: row.created_at,
          bookingDate: booking.bookingDate || null,
          totalQuestions: 0
        };
      }
      inquiriesBySession[sessionId].answers.push({
        questionId: row.question_id,
        questionText: row.question_text,
        answerText: row.answer_text,
        answerCategory: row.answer_category,
        createdAt: row.created_at
      });
      inquiriesBySession[sessionId].totalQuestions++;
    });

    // 배열로 변환하고 최신순 정렬
    const inquiries = Object.values(inquiriesBySession).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return new Response(JSON.stringify({ 
      success: true, 
      inquiries: inquiries,
      total: inquiries.length
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
    console.error('문의리스트 조회 오류:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
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
