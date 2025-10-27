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
    const result = await env.DB.prepare(
      'INSERT INTO consultation_results (session_id, loan_amount_min, loan_amount_max, interest_rate_min, interest_rate_max, approval_probability, recommended_products, consultation_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      sessionId,
      loanConditions.loanAmountMin,
      loanConditions.loanAmountMax,
      loanConditions.interestRateMin,
      loanConditions.interestRateMax,
      loanConditions.approvalProbability,
      JSON.stringify(loanConditions.recommendedProducts),
      loanConditions.summary
    ).run();

    // 세션 상태 업데이트
    await env.DB.prepare(
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

// 대출 조건 계산 함수
function calculateLoanConditions(answers) {
  let loanAmountMin = 1000; // 기본값
  let loanAmountMax = 3000;
  let interestRateMin = 4.5;
  let interestRateMax = 6.8;
  let approvalProbability = 70;
  let recommendedProducts = ['창업자금 특화 대출'];
  let summary = '';

  // 사업자 상태에 따른 조건 조정
  const businessStatus = answers.find(a => a.questionId === 1)?.answerText;
  if (businessStatus?.includes('사업자 등록 한적 없습니다')) {
    loanAmountMin = 500;
    loanAmountMax = 2000;
    interestRateMin = 5.0;
    interestRateMax = 7.5;
    approvalProbability = 60;
  } else if (businessStatus?.includes('3년 미만')) {
    loanAmountMin = 2000;
    loanAmountMax = 5000;
    interestRateMin = 4.0;
    interestRateMax = 6.0;
    approvalProbability = 80;
  }

  // 대출 금액에 따른 조건 조정
  const loanAmount = answers.find(a => a.questionId === 2)?.answerText;
  if (loanAmount?.includes('5,000만원 이상')) {
    loanAmountMax = 10000;
    interestRateMin = 3.5;
    interestRateMax = 5.5;
  }

  // 소득 수준에 따른 조건 조정
  const income = answers.find(a => a.questionId === 3)?.answerText;
  if (income?.includes('600만원 이상')) {
    approvalProbability += 15;
    interestRateMin -= 0.5;
  } else if (income?.includes('200만원 이하')) {
    approvalProbability -= 20;
    interestRateMax += 1.0;
  }

  // 신용등급에 따른 조건 조정
  const creditGrade = answers.find(a => a.questionId === 4)?.answerText;
  if (creditGrade?.includes('1등급')) {
    approvalProbability += 20;
    interestRateMin -= 1.0;
    interestRateMax -= 0.5;
  } else if (creditGrade?.includes('4등급 이하')) {
    approvalProbability -= 30;
    interestRateMin += 1.5;
    interestRateMax += 2.0;
  }

  // 업종에 따른 조건 조정
  const industry = answers.find(a => a.questionId === 5)?.answerText;
  if (industry?.includes('IT/소프트웨어')) {
    approvalProbability += 10;
    recommendedProducts.push('IT창업 특화 대출');
  } else if (industry?.includes('제조업')) {
    recommendedProducts.push('제조업 특화 대출');
  }

  // 승인 가능성 범위 제한
  approvalProbability = Math.max(30, Math.min(95, approvalProbability));

  summary = `입력하신 정보를 바탕으로 ${loanAmountMin}만원~${loanAmountMax}만원 대출이 가능하며, 예상 금리는 연 ${interestRateMin}%~${interestRateMax}%입니다. 승인 가능성은 ${approvalProbability}%로 추정됩니다.`;

  return {
    loanAmountMin,
    loanAmountMax,
    interestRateMin,
    interestRateMax,
    approvalProbability,
    recommendedProducts,
    summary
  };
}
