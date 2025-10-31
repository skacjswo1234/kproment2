// Cloudflare Pages Functions - 상담 결과 생성 API
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // D1 바인딩 체크
    if (!env['kproment2-db']) {
      console.error('D1 데이터베이스 바인딩이 없습니다!');
      return new Response(JSON.stringify({ 
        error: 'D1 데이터베이스 바인딩이 설정되지 않았습니다.',
        detail: 'Cloudflare Pages에서 kproment2-db D1 바인딩을 추가해주세요.'
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
    
    const { sessionId, answers } = await request.json();
    
    console.log('받은 answers:', answers); // 디버깅용
    console.log('questionId 5번 답변:', answers.find(a => a.questionId === 5)); // 디버깅용
    
    if (!sessionId || !answers) {
      return new Response(JSON.stringify({ error: '필수 필드가 누락되었습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 답변 분석하여 대출 조건 계산
    const loanConditions = calculateLoanConditions(answers);
    
    console.log('계산된 loanConditions:', loanConditions); // 디버깅용
    
    // 세션 존재 확인 또는 생성 (FOREIGN KEY constraint 에러 방지)
    const sessionCheck = await env['kproment2-db'].prepare(
      'SELECT id FROM consultation_sessions WHERE session_id = ?'
    ).bind(sessionId).first();
    
    if (!sessionCheck) {
      console.log('세션이 존재하지 않아 생성합니다:', sessionId);
      // 세션이 없으면 생성
      await env['kproment2-db'].prepare(
        'INSERT INTO consultation_sessions (session_id, status) VALUES (?, ?)'
      ).bind(sessionId, 'in_progress').run();
    }
    
    // 상담 결과 저장
    const result = await env['kproment2-db'].prepare(
      'INSERT INTO consultation_results (session_id, support_amount_min, support_amount_max, approval_probability, recommended_programs, support_summary) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      sessionId,
      loanConditions.supportAmountMin,
      loanConditions.supportAmountMax,
      loanConditions.loanSupportProbability,
      JSON.stringify(loanConditions.recommendedProducts),
      loanConditions.summary
    ).run();

    // 세션 상태 업데이트
    await env['kproment2-db'].prepare(
      'UPDATE consultation_sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?'
    ).bind('completed', sessionId).run();

    return new Response(JSON.stringify({ 
      success: true,
      resultId: result.meta.last_row_id,
      loanConditions
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('상담 결과 생성 오류:', error);
    console.error('에러 스택:', error.stack);
    console.error('에러 메시지:', error.message);
    
    return new Response(JSON.stringify({ 
      error: '서버 오류가 발생했습니다.',
      detail: error.message,
      stack: error.stack
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

// 정책자금 지원 조건 계산 함수
function calculateLoanConditions(answers) {
  let supportAmountMin = 3000; // 기본값 (만원)
  let supportAmountMax = 8000;
  let loanSupportProbability = 0; // 기본값 없음
  let recommendedProducts = ['정부지원사업', '창업자금지원', '기술개발지원'];
  let summary = '';

  // 사업자 상태에 따른 조건 조정
  const businessStatus = answers.find(a => a.questionId === 1)?.answerText;
  if (businessStatus?.includes('사업자 등록 한적없습니다')) {
    supportAmountMin = 3000;
    supportAmountMax = 5000;
    recommendedProducts = ['예비창업자 지원사업', '스타트업 지원', '정부지원사업'];
  } else if (businessStatus?.includes('3년 미만')) {
    supportAmountMin = 5000;
    supportAmountMax = 10000;
    recommendedProducts = ['초기창업자 지원', '정부지원사업', '기술개발지원'];
  } else if (businessStatus?.includes('3년 이상')) {
    supportAmountMin = 3000;
    supportAmountMax = 8000;
    recommendedProducts = ['기존사업자 지원', '정부지원사업', '기술혁신지원'];
  }

  // 정부지원 경험에 따른 조건 조정
  const supportExperience = answers.find(a => a.questionId === 2)?.answerText;
  if (supportExperience?.includes('지원경험 있습니다') || supportExperience?.includes('합격해서 지원금 받은적이 있습니다')) {
    supportAmountMax += 2000;
  }

  // 사업 아이템에 따른 조건 조정
  const businessItem = answers.find(a => a.questionId === 3)?.answerText;
  if (businessItem?.includes('생각하고있는 아이템 있습니다')) {
    recommendedProducts.push('아이템개발지원');
  }

  // 거주지역에 따른 조건 조정
  const region = answers.find(a => a.questionId === 4)?.answerText;
  if (region?.includes('제주') || region?.includes('강원')) {
    // 지역균형발전 우대
  }

  // 대출이력에 따른 지원확률 계산 (answerIndex 기반)
  const loanHistoryAnswer = answers.find(a => a.questionId === 5 || a.questionId === '5');
  const loanHistoryIndex = loanHistoryAnswer?.answerIndex;
  const loanHistoryText = loanHistoryAnswer?.answerText;
  console.log('=== 대출이력 디버깅 ===');
  console.log('전체 답변:', loanHistoryAnswer);
  console.log('answerText:', loanHistoryText);
  console.log('answerIndex:', loanHistoryIndex);
  console.log('answerIndex 타입:', typeof loanHistoryIndex);
  
  // answerIndex로 매칭 (0: 총1천만원 미만, 1: 1~3천만원, 2: 3~5천만원, 3: 5천만~1억, 4: 1억 이상)
  if (loanHistoryIndex === 0) {
    loanSupportProbability = 95;
  } else if (loanHistoryIndex === 1) {
    loanSupportProbability = 90;
  } else if (loanHistoryIndex === 2) {
    loanSupportProbability = 85;
  } else if (loanHistoryIndex === 3) {
    loanSupportProbability = 80;
  } else if (loanHistoryIndex === 4) {
    loanSupportProbability = 70;
  } else {
    console.log('대출이력 매칭 실패 - answerIndex:', loanHistoryIndex); // 디버깅용
    loanSupportProbability = 80; // 기본값 설정
  }
  
  console.log('대출 지원확률:', loanSupportProbability); // 디버깅용

  // 성별에 따른 조건 조정
  const gender = answers.find(a => a.questionId === 6)?.answerText;
  if (gender?.includes('여성')) {
    recommendedProducts.push('여성창업지원');
  }

  // 나이에 따른 조건 조정
  const age = answers.find(a => a.questionId === 7)?.answerText;
  if (age?.includes('만39세이하')) {
    recommendedProducts.push('청년창업지원');
  }

  // 학력에 따른 조건 조정
  const education = answers.find(a => a.questionId === 8)?.answerText;
  if (education?.includes('대학원 졸업')) {
    recommendedProducts.push('고학력창업지원');
  }

  // 직업분야에 따른 조건 조정
  const job = answers.find(a => a.questionId === 9)?.answerText;
  if (job?.includes('IT업') || job?.includes('기술직')) {
    recommendedProducts.push('IT기술지원');
  }

  summary = `입력해주신 정보를 바탕으로 정부정책지원 기술특허개발 가능여부와 자금확보 가능성을 분석합니다. ${supportAmountMin}만원~${supportAmountMax}만원 정부지원이 가능하며, 대출 지원확률은 ${loanSupportProbability}%입니다. 기술특허개발, 제조, IT 시제품개발, 앱웹개발을 포함한 토탈 원스톱 솔루션 지원이 가능합니다.`;

  console.log('최종 계산된 loanSupportProbability:', loanSupportProbability); // 디버깅용

  return {
    supportAmountMin,
    supportAmountMax,
    loanSupportProbability,
    recommendedProducts,
    summary
  };
}

// CORS를 위한 OPTIONS 요청 처리
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
