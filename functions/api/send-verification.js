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
      const SOLAPI_API_KEY = env.SOLAPI_API_KEY || 'NCSXSG86GBJ31VDX';
      const SOLAPI_API_SECRET = env.SOLAPI_API_SECRET || 'WIMT8DAV6UTPM9XDG1KDEBINQVB4Z2FT';
      const SOLAPI_SENDER = env.SOLAPI_SENDER || '01099820085';
      
      console.log('API 키 확인:', { 
        hasKey: !!SOLAPI_API_KEY, 
        hasSecret: !!SOLAPI_API_SECRET,
        sender: SOLAPI_SENDER 
      });
      
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

    // 솔라피 API 호출 (일반 단건 발송 엔드포인트)
    const requestBody = {
      message: {
        to: phoneNumber,
        from: SOLAPI_SENDER,
        text: `[케이프로미넌트] 인증번호: ${verificationCode}\n정부정책지원 상담을 위한 인증번호입니다.`
      }
    };

    const solapiUrl = 'https://api.solapi.com/messages/v4/send';

    // 솔라피 HMAC-SHA256 인증 헤더 생성
    let authorizationHeader = '';
    try {
      const date = new Date().toISOString();
      const salt = crypto.randomUUID();

      async function hmacSha256Hex(secret, message) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(secret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
        const bytes = new Uint8Array(signatureBuffer);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      }

      const signature = await hmacSha256Hex(SOLAPI_API_SECRET, date + salt);
      authorizationHeader = `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`;
    } catch (authErr) {
      console.error('HMAC 서명 생성 실패:', authErr);
      return new Response(JSON.stringify({
        success: false,
        message: '서버 인증 구성 오류가 발생했습니다.',
        detail: String(authErr?.message || authErr)
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

    console.log('솔라피 API 요청:', {
      url: solapiUrl,
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json'
      },
      body: requestBody
    });

    let solapiResponse;
    try {
      solapiResponse = await fetch(solapiUrl, {
        method: 'POST',
        headers: {
          Authorization: authorizationHeader,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    } catch (netErr) {
      console.error('솔라피 네트워크 오류:', netErr);
      return new Response(JSON.stringify({
        success: false,
        message: '문자 발송 서버 연결에 실패했습니다.',
        detail: String(netErr?.message || netErr)
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    console.log('솔라피 API 응답 상태:', solapiResponse.status);
    
    if (!solapiResponse.ok) {
      const errorText = await solapiResponse.text();
      console.error('솔라피 API 오류:', {
        status: solapiResponse.status,
        statusText: solapiResponse.statusText,
        error: errorText
      });
      return new Response(JSON.stringify({
        success: false,
        message: `인증번호 발송에 실패했습니다. (${solapiResponse.status}: ${solapiResponse.statusText})`,
        detail: errorText
      }), {
        status: solapiResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    const responseData = await solapiResponse.json();
    console.log('솔라피 API 성공 응답:', responseData);

      // 인증번호를 데이터베이스에 저장 (3분 유효)
      const verificationData = {
        sessionId,
        phoneNumber,
        verificationCode,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString() // 3분 후 만료
      };

    // Cloudflare KV 바인딩 확인
    if (!env.VERIFICATION_CODES || typeof env.VERIFICATION_CODES.put !== 'function') {
      console.error('KV 바인딩 누락: VERIFICATION_CODES가 정의되지 않았습니다.');
      return new Response(JSON.stringify({
        success: false,
        message: '서버 설정 오류: 인증번호 저장소가 연결되지 않았습니다.',
        detail: 'Cloudflare Pages 프로젝트에 KV 바인딩(VERIFICATION_CODES)을 연결하세요.'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Cloudflare KV에 저장
    try {
      await env.VERIFICATION_CODES.put(
        `${sessionId}_${phoneNumber}`, 
        JSON.stringify(verificationData),
        { expirationTtl: 180 } // 3분 TTL
      );
    } catch (kvErr) {
      console.error('KV 저장 실패:', kvErr);
      return new Response(JSON.stringify({
        success: false,
        message: '인증번호 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',
        detail: String(kvErr?.message || kvErr)
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
    console.error('인증번호 발송 오류(핸들되지 않은 예외):', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: '서버 오류가 발생했습니다.',
      detail: String(error?.message || error)
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

