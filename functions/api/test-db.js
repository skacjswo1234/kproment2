// 테스트용 API 함수
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    console.log('=== 테스트 API 호출됨 ===');
    console.log('env 객체:', Object.keys(env));
    console.log('allinpay-db 바인딩:', !!env['allinpay-db']);
    
    // 간단한 테스트
    if (env['allinpay-db']) {
      const testResult = await env['allinpay-db'].prepare("SELECT 1 as test").first();
      console.log('테스트 쿼리 성공:', testResult);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'D1 연결 성공',
        testResult: testResult
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      return new Response(JSON.stringify({ 
        error: 'D1 바인딩 실패',
        availableKeys: Object.keys(env)
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
  } catch (error) {
    console.error('테스트 API 오류:', error);
    return new Response(JSON.stringify({ 
      error: '테스트 실패',
      details: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
