// 디버깅용 API 함수 - D1 연결 테스트
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    console.log('API 호출됨');
    console.log('env.DB:', env.DB);
    
    // D1 연결 테스트
    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'D1 데이터베이스가 연결되지 않았습니다.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 테이블 존재 확인
    const tables = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('테이블 목록:', tables);
    
    // 간단한 테스트 쿼리
    const testResult = await env.DB.prepare("SELECT 1 as test").first();
    console.log('테스트 쿼리 결과:', testResult);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'API 정상 작동',
      tables: tables.results,
      testResult: testResult
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API 오류:', error);
    return new Response(JSON.stringify({ 
      error: '서버 오류가 발생했습니다.',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
