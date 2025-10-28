// Cloudflare Pages Functions - 상담 결과 생성 API
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { sessionId, answers } = await request.json();
    
    if (!sessionId || !answers) {
      return new Response(JSON.stringify({ error: '필수 필드가 누락되었습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 답변 분석하여 대출 조건 계산
    const loanConditions = calculateLoanConditions(answers);
    
    // 상담 결과 저장
    const result = await env['kproment2-db'].prepare(
      'INSERT INTO consultation_results (session_id, support_amount_min, support_amount_max, approval_probability, recommended_programs, support_summary) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      sessionId,
      loanConditions.supportAmountMin,
      loanConditions.supportAmountMax,
      loanConditions.approvalProbability,
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
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 정책자금 지원 조건 계산 함수
function calculateLoanConditions(answers) {
  let supportAmountMin = 3000; // 기본값 (만원)
  let supportAmountMax = 8000;
  let approvalProbability = 70;
  let recommendedProducts = ['정부지원사업', '창업자금지원', '기술개발지원'];
  let summary = '';

  // 사업자 상태에 따른 조건 조정
  const businessStatus = answers.find(a => a.questionId === 1)?.answerText;
  if (businessStatus?.includes('사업자 등록 한적없습니다')) {
    supportAmountMin = 3000;
    supportAmountMax = 5000;
    approvalProbability = 90; // 예비창업자 우대
    recommendedProducts = ['예비창업자 지원사업', '스타트업 지원', '정부지원사업'];
  } else if (businessStatus?.includes('3년 미만')) {
    supportAmountMin = 5000;
    supportAmountMax = 10000;
    approvalProbability = 85;
    recommendedProducts = ['초기창업자 지원', '정부지원사업', '기술개발지원'];
  } else if (businessStatus?.includes('3년 이상')) {
    supportAmountMin = 3000;
    supportAmountMax = 8000;
    approvalProbability = 75;
    recommendedProducts = ['기존사업자 지원', '정부지원사업', '기술혁신지원'];
  }

  // 정부지원 경험에 따른 조건 조정
  const supportExperience = answers.find(a => a.questionId === 2)?.answerText;
  if (supportExperience?.includes('지원경험 있습니다') || supportExperience?.includes('합격해서 지원금 받은적이 있습니다')) {
    approvalProbability += 15;
    supportAmountMax += 2000;
  } else if (supportExperience?.includes('들어본 적 있습니다')) {
    approvalProbability += 5;
  }

  // 사업 아이템에 따른 조건 조정
  const businessItem = answers.find(a => a.questionId === 3)?.answerText;
  if (businessItem?.includes('생각하고있는 아이템 있습니다')) {
    approvalProbability += 10;
    recommendedProducts.push('아이템개발지원');
  }

  // 거주지역에 따른 조건 조정
  const region = answers.find(a => a.questionId === 4)?.answerText;
  if (region?.includes('서울') || region?.includes('수도권')) {
    approvalProbability += 5; // 수도권 우대
  } else if (region?.includes('제주') || region?.includes('강원')) {
    approvalProbability += 10; // 지역균형발전 우대
  }

  // 대출이력에 따른 조건 조정
  const loanHistory = answers.find(a => a.questionId === 5)?.answerText;
  if (loanHistory?.includes('총1천만원 미안')) {
    approvalProbability += 10; // 대출이력이 적으면 우대
  } else if (loanHistory?.includes('총1억원 이상')) {
    approvalProbability -= 15; // 대출이력이 많으면 불리
  }

  // 성별에 따른 조건 조정
  const gender = answers.find(a => a.questionId === 6)?.answerText;
  if (gender?.includes('여성')) {
    approvalProbability += 10; // 여성사업 우대
    recommendedProducts.push('여성창업지원');
  }

  // 나이에 따른 조건 조정
  const age = answers.find(a => a.questionId === 7)?.answerText;
  if (age?.includes('만39세이하')) {
    approvalProbability += 15; // 젊은 창업자 우대
    recommendedProducts.push('청년창업지원');
  }

  // 학력에 따른 조건 조정
  const education = answers.find(a => a.questionId === 8)?.answerText;
  if (education?.includes('대학원 졸업')) {
    approvalProbability += 10; // 고학력 우대
    recommendedProducts.push('고학력창업지원');
  }

  // 직업분야에 따른 조건 조정
  const job = answers.find(a => a.questionId === 9)?.answerText;
  if (job?.includes('IT업') || job?.includes('기술직')) {
    approvalProbability += 10; // IT/기술분야 우대
    recommendedProducts.push('IT기술지원');
  }

  // 승인 가능성 범위 제한
  approvalProbability = Math.max(30, Math.min(95, approvalProbability));

  summary = `입력하신 정보를 바탕으로 ${supportAmountMin}만원~${supportAmountMax}만원 정부지원이 가능하며, 승인 가능성은 ${approvalProbability}%로 추정됩니다. 기술특허개발, 제조, IT 시제품개발, 앱웹개발을 포함한 토탈 원스톱 솔루션 지원이 가능합니다.`;

  return {
    supportAmountMin,
    supportAmountMax,
    approvalProbability,
    recommendedProducts,
    summary
  };
}
