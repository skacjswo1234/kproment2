// Cloudflare Pages Functions - 관리자 로그인
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { password } = await request.json();
    if (!password) {
      return new Response(JSON.stringify({ success: false, message: '비밀번호를 입력해주세요.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const db = env.kproment2_db || env['kproment2-db'];
    if (!db) {
      console.error('D1 바인딩 누락:', Object.keys(env || {}));
      return new Response(JSON.stringify({ success: false, message: '데이터베이스 연결 오류' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // 테이블 생성/초기화는 배포 시 점검으로 처리. 런타임에서는 조회만 수행

    let row;
    try {
      row = await db.prepare('SELECT password FROM admin_password WHERE id = 1').first();
    } catch (e) {
      console.error('비밀번호 조회 실패:', e);
      return new Response(JSON.stringify({ success: false, message: 'DB 조회 실패', detail: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    if (!row) {
      return new Response(JSON.stringify({ success: false, message: '관리자 비밀번호가 설정되지 않았습니다.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const current = row ? row.password : '1234';
    if (password !== current) {
      return new Response(JSON.stringify({ success: false, message: '비밀번호가 올바르지 않습니다.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, message: '로그인 성공' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
    });
  } catch (error) {
    console.error('관리자 로그인 오류:', error);
    return new Response(JSON.stringify({ success: false, message: '서버 오류가 발생했습니다.', detail: String(error?.message || error) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
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
