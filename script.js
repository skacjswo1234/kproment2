// 질문 데이터
const questions = [
  {
    id: 1,
    text: "현재 사업자등록증이 없는 예비창업자 이신가요?",
    options: [
      "네. 사업자 등록 한적 없습니다",
      "네. 지금은 폐업해서 사업자가 없어요",
      "아뇨. 창업 후 3년 미만의 초기창업자입니다",
      "아뇨. 창업 후 3년 이상의 창업자입니다"
    ],
    category: "사업자 상태"
  },
  {
    id: 2,
    text: "희망 대출 금액은 얼마인가요?",
    options: [
      "1,000만원 이하",
      "1,000만원 ~ 3,000만원",
      "3,000만원 ~ 5,000만원",
      "5,000만원 이상"
    ],
    category: "대출 금액"
  },
  {
    id: 3,
    text: "현재 월 소득은 얼마인가요?",
    options: [
      "200만원 이하",
      "200만원 ~ 400만원",
      "400만원 ~ 600만원",
      "600만원 이상"
    ],
    category: "소득 수준"
  },
  {
    id: 4,
    text: "신용등급은 어떻게 되시나요?",
    options: [
      "1등급 (900점 이상)",
      "2등급 (800~899점)",
      "3등급 (700~799점)",
      "4등급 이하 (700점 미만)"
    ],
    category: "신용 상태"
  },
  {
    id: 5,
    text: "창업하고자 하는 업종은 무엇인가요?",
    options: [
      "IT/소프트웨어",
      "제조업",
      "서비스업",
      "기타"
    ],
    category: "업종"
  }
];

// 전역 변수
let currentQuestionIndex = 0;
let answers = {};
let sessionId = '';
let isLoading = false;

// DOM 요소
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const totalSteps = document.getElementById('total-steps');
const questionText = document.getElementById('question-text');
const answerOptions = document.getElementById('answer-options');
const chatContainer = document.getElementById('chat-container');
const loadingOverlay = document.getElementById('loading-overlay');
const resultModal = document.getElementById('result-modal');
const resultContent = document.getElementById('result-content');
const bookConsultationBtn = document.getElementById('book-consultation');
const restartChatBtn = document.getElementById('restart-chat');

// 초기화
document.addEventListener('DOMContentLoaded', function() {
  // 세션 ID 생성
  sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // 총 단계 수 설정
  totalSteps.textContent = questions.length;
  
  // 첫 번째 질문 표시
  showQuestion();
  
  // 이벤트 리스너 등록
  bookConsultationBtn.addEventListener('click', handleBookConsultation);
  restartChatBtn.addEventListener('click', resetChat);
});

// 질문 표시
function showQuestion() {
  const question = questions[currentQuestionIndex];
  questionText.textContent = question.text;
  
  // 답변 옵션 생성
  answerOptions.innerHTML = '';
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'answer-button group';
    button.innerHTML = `
      <span>${option}</span>
      <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 18 6-6-6-6"></path>
      </svg>
    `;
    
    button.addEventListener('click', () => handleAnswer(option));
    answerOptions.appendChild(button);
  });
  
  // 진행률 업데이트
  updateProgress();
}

// 답변 처리
async function handleAnswer(answer) {
  const question = questions[currentQuestionIndex];
  answers[currentQuestionIndex] = answer;
  
  // 답변 저장
  await saveAnswer(question.id, question.text, answer, question.category);
  
  // 다음 질문으로 이동
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    setTimeout(() => {
      showQuestion();
    }, 500);
  } else {
    // 모든 질문 완료 - 상담 결과 생성
    await generateConsultationResult();
  }
}

// 진행률 업데이트
function updateProgress() {
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${Math.round(progress)}% 완료`;
}

// 답변 저장 API 호출 (로컬 스토리지 백업)
async function saveAnswer(questionId, questionText, answerText, answerCategory) {
  try {
    console.log('=== 답변 저장 시작 ===');
    console.log('데이터:', { sessionId, questionId, questionText, answerText, answerCategory });
    
    // 로컬 스토리지에 먼저 저장
    const localAnswers = JSON.parse(localStorage.getItem('userAnswers') || '[]');
    localAnswers.push({
      sessionId,
      questionId,
      questionText,
      answerText,
      answerCategory,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('userAnswers', JSON.stringify(localAnswers));
    console.log('로컬 스토리지 저장 완료');
    
    // API 호출 시도
    console.log('API 호출 중...');
    const response = await fetch('/api/save-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        questionId,
        questionText,
        answerText,
        answerCategory
      })
    });
    
    console.log('API 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 저장 실패:', response.status, errorText);
      console.warn('로컬 스토리지에 저장됨');
    } else {
      const result = await response.json();
      console.log('API 저장 성공:', result);
    }
  } catch (error) {
    console.error('API 오류:', error);
    console.warn('로컬 스토리지에 저장됨');
  }
}

// 상담 결과 생성
async function generateConsultationResult() {
  isLoading = true;
  loadingOverlay.classList.remove('hidden');
  
  try {
    const response = await fetch('/api/generate-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        answers: Object.entries(answers).map(([questionId, answerText]) => ({
          questionId: parseInt(questionId),
          answerText
        }))
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      showResult(result.loanConditions);
    } else {
      // API 실패 시 기본 결과 표시
      showResult(calculateDefaultResult());
    }
  } catch (error) {
    console.error('상담 결과 생성 오류:', error);
    // 오류 시 기본 결과 표시
    showResult(calculateDefaultResult());
  } finally {
    isLoading = false;
    loadingOverlay.classList.add('hidden');
  }
}

// 기본 결과 계산 (API 실패 시 사용)
function calculateDefaultResult() {
  let loanAmountMin = 1000;
  let loanAmountMax = 3000;
  let interestRateMin = 4.5;
  let interestRateMax = 6.8;
  let approvalProbability = 70;
  let recommendedProducts = ['창업자금 특화 대출'];
  
  // 답변에 따른 조건 조정
  const businessStatus = answers[0];
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
  
  const loanAmount = answers[1];
  if (loanAmount?.includes('5,000만원 이상')) {
    loanAmountMax = 10000;
    interestRateMin = 3.5;
    interestRateMax = 5.5;
  }
  
  const income = answers[2];
  if (income?.includes('600만원 이상')) {
    approvalProbability += 15;
    interestRateMin -= 0.5;
  } else if (income?.includes('200만원 이하')) {
    approvalProbability -= 20;
    interestRateMax += 1.0;
  }
  
  const creditGrade = answers[3];
  if (creditGrade?.includes('1등급')) {
    approvalProbability += 20;
    interestRateMin -= 1.0;
    interestRateMax -= 0.5;
  } else if (creditGrade?.includes('4등급 이하')) {
    approvalProbability -= 30;
    interestRateMin += 1.5;
    interestRateMax += 2.0;
  }
  
  approvalProbability = Math.max(30, Math.min(95, approvalProbability));
  
  return {
    loanAmountMin,
    loanAmountMax,
    interestRateMin,
    interestRateMax,
    approvalProbability,
    recommendedProducts
  };
}

// 결과 표시
function showResult(result) {
  const resultHtml = `
감사합니다! 모든 질문에 답변해주셨습니다.

입력해주신 정보를 바탕으로 최적의 대출 상품을 추천해드리겠습니다.

📋 <strong>상담 결과 요약:</strong>
• 대출 가능 금액: ${result.loanAmountMin}만원 ~ ${result.loanAmountMax}만원
• 예상 금리: 연 ${result.interestRateMin}% ~ ${result.interestRateMax}%
• 추천 상품: ${result.recommendedProducts.join(', ')}
• 승인 가능성: ${result.approvalProbability}%

📞 <strong>다음 단계:</strong>
• 무료 상담 예약 (전화/대면)
• 서류 준비 안내
• 1:1 맞춤 상담 진행

추가 문의사항이 있으시면 언제든 연락주세요!
  `;
  
  resultContent.innerHTML = resultHtml;
  resultModal.classList.remove('hidden');
}

// 상담 예약 처리
async function handleBookConsultation() {
  const name = prompt('이름을 입력해주세요:');
  if (!name) return;
  
  const phone = prompt('연락처를 입력해주세요:');
  if (!phone) return;
  
  const email = prompt('이메일을 입력해주세요 (선택사항):');
  
  try {
    const response = await fetch('/api/book-consultation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        name,
        phone,
        email: email || '',
        consultationType: 'phone'
      })
    });
    
    if (response.ok) {
      alert('상담 예약이 완료되었습니다! 곧 연락드리겠습니다.');
      resultModal.classList.add('hidden');
    } else {
      alert('상담 예약 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('상담 예약 오류:', error);
    alert('상담 예약 중 오류가 발생했습니다.');
  }
}

// 채팅 초기화
function resetChat() {
  currentQuestionIndex = 0;
  answers = {};
  sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // UI 초기화
  resultModal.classList.add('hidden');
  loadingOverlay.classList.add('hidden');
  
  // 첫 번째 질문으로 돌아가기
  showQuestion();
}

// 유틸리티 함수들
function formatTime(date = new Date()) {
  return date.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 에러 핸들링
window.addEventListener('error', function(e) {
  console.error('JavaScript 오류:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('Promise 오류:', e.reason);
});

// 네트워크 상태 확인
window.addEventListener('online', function() {
  console.log('네트워크 연결됨');
});

window.addEventListener('offline', function() {
  console.log('네트워크 연결 끊김');
  alert('네트워크 연결이 끊어졌습니다. 연결을 확인해주세요.');
});
