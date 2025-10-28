// Cloudflare Pages Functions - 인증번호 발송
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { sessionId, phoneNumber } = await request.json();
      
      if (!phoneNumber || phoneNumber.length !== 11) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: '올바른 휴대폰번호를 입력해주세요.' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 6자리 인증번호 생성
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 솔라피 API 설정 (환경변수에서 가져오기)
      const SOLAPI_API_KEY = env.SOLAPI_API_KEY;
      const SOLAPI_API_SECRET = env.SOLAPI_API_SECRET;
      const SOLAPI_SENDER = env.SOLAPI_SENDER || '01012345678'; // 발신번호
      
      if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET) {
        console.error('솔라피 API 키가 설정되지 않았습니다.');
        return new Response(JSON.stringify({ 
          success: false, 
          message: '서비스 설정 오류가 발생했습니다.' 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

    // 솔라피 API 호출 (올바른 형식)
    const solapiResponse = await fetch('https://api.solapi.com/messages/v4/send-many/detail', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(SOLAPI_API_KEY + ':' + SOLAPI_API_SECRET)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          to: phoneNumber,
          from: SOLAPI_SENDER,
          text: `[케이프로먼트] 인증번호: ${verificationCode}\n정부정책지원 상담을 위한 인증번호입니다.`
        }]
      })
    });

      if (!solapiResponse.ok) {
        const errorData = await solapiResponse.text();
        console.error('솔라피 API 오류:', errorData);
        return new Response(JSON.stringify({ 
          success: false, 
          message: '인증번호 발송에 실패했습니다. 다시 시도해주세요.' 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 인증번호를 데이터베이스에 저장 (3분 유효)
      const verificationData = {
        sessionId,
        phoneNumber,
        verificationCode,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString() // 3분 후 만료
      };

    // Cloudflare KV에 저장
    await env.VERIFICATION_CODES.put(
      `${sessionId}_${phoneNumber}`, 
      JSON.stringify(verificationData),
      { expirationTtl: 180 } // 3분 TTL
    );

    return new Response(JSON.stringify({ 
      success: true, 
      message: '인증번호가 발송되었습니다.' 
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
    console.error('인증번호 발송 오류:', error);
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

