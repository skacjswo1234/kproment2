// Cloudflare Pages Functions - 관리자 비밀번호 변경
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { currentPassword, newPassword } = await request.json();
      
    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '필수 정보가 누락되었습니다.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.kproment2_db || env['kproment2-db'];
    if (!db) {
      return new Response(JSON.stringify({ success: false, message: '데이터베이스 연결 오류' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // 런타임에서는 조회만 수행
    const row = await db.prepare('SELECT password FROM admin_password WHERE id = 1').first();
    if (!row) {
      return new Response(JSON.stringify({ success: false, message: '관리자 비밀번호가 설정되지 않았습니다.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const current = row.password;

    // 현재 비밀번호 확인
    if (currentPassword !== current) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '현재 비밀번호가 올바르지 않습니다.' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 새 비밀번호 유효성 검사
    if (newPassword.length < 4) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '새 비밀번호는 4자 이상이어야 합니다.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // DB 업데이트
    await db.prepare('INSERT OR REPLACE INTO admin_password (id, password, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)').bind(newPassword).run();

    return new Response(JSON.stringify({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
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
