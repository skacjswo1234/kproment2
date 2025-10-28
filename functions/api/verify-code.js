// Cloudflare Pages Functions - 인증번호 검증
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { sessionId, phoneNumber, verificationCode } = await request.json();
      
      if (!sessionId || !phoneNumber || !verificationCode) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: '필수 정보가 누락되었습니다.' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 저장된 인증번호 조회
      const storedData = await env.VERIFICATION_CODES.get(`${sessionId}_${phoneNumber}`);
      
      if (!storedData) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: '인증번호가 만료되었거나 존재하지 않습니다.' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const verificationData = JSON.parse(storedData);
      
      // 만료 시간 확인
      if (new Date() > new Date(verificationData.expiresAt)) {
        // 만료된 데이터 삭제
        await env.VERIFICATION_CODES.delete(`${sessionId}_${phoneNumber}`);
        
        return new Response(JSON.stringify({ 
          success: false, 
          message: '인증번호가 만료되었습니다. 다시 발송해주세요.' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 인증번호 검증
      if (verificationData.verificationCode !== verificationCode) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: '인증번호가 올바르지 않습니다.' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 인증 성공 - 인증된 휴대폰번호를 세션에 저장
      await env.VERIFIED_PHONES.put(sessionId, JSON.stringify({
        phoneNumber,
        verifiedAt: new Date().toISOString()
      }), { expirationTtl: 3600 }); // 1시간 유효

      // 사용된 인증번호 삭제
      await env.VERIFICATION_CODES.delete(`${sessionId}_${phoneNumber}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: '인증이 완료되었습니다.' 
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
    console.error('인증번호 검증 오류:', error);
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
