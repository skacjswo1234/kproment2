// 질문 데이터
const questions = [
  {
    id: 1,
    text: "1.현재 사업자등록증 없는 예비창업자 이신가요?\n*사업자등록증 없으신 예비창업자가 1억원이상 자금확보 확률이 90%이상,스타트업,초기창업자도 충분한 정부지원 및 신청 가능합니다.",
    options: [
      "네,사업자 등록 한적없습니다",
      "네,지금은 폐업해서 사업자가 없습니다.",
      "아니요.사업자등록 3년 미만 의 초기창업자입니다",
      "아니요.사업자등록 3년 이상의 사업자입니다."
    ],
    category: "사업자 상태"
  },
  {
    id: 2,
    text: "2.예비창업제도 정부지원 사업에 대해서 알고 계신가요?",
    options: [
      "네 잘 알고 있습니다",
      "들어본 적 있습니다",
      "지원경험 있습니다",
      "최종합격 까지 했습니다",
      "합격해서 지원금 받은적이 있습니다"
    ],
    category: "정부지원 경험"
  },
  {
    id: 3,
    text: "3.창업생각하는 사업 아이템이 있으신가요?",
    options: [
      "생각하고있는 아이템 있습니다",
      "아직 구체적구상 전입니다",
      "창업준비 아이템이 없어요",
      "아직 없습니다"
    ],
    category: "사업 아이템"
  },
  {
    id: 4,
    text: "4.등본상 거주지가 어디 지역인가요?\n*경쟁률이 낮은 지역으로 빠르게 진행가능합니다.",
    options: [
      "서울",
      "수도권",
      "충북/천안",
      "충남/대전",
      "경북/대구",
      "경남/부산",
      "전북/전주",
      "전남/광주",
      "강원",
      "제주/기타"
    ],
    category: "거주지역"
  },
  {
    id: 5,
    text: "5.기존 대출이력은 어떻게 되나요?",
    options: [
      "총1천만원 미안",
      "총1천만원 이상~3천만원 미만",
      "총3천만원 이상~5천만원 미만",
      "총5천만원 이상~ 1억원 미안",
      "총1억원 이상"
    ],
    category: "대출이력"
  },
  {
    id: 6,
    text: "6.성별을 선택해주세요\n*여성사업 우대 지원있습니다.",
    options: [
      "남성",
      "여성"
    ],
    category: "성별"
  },
  {
    id: 7,
    text: "7.만 나이를 선택해주세요\n*만39세 이하 정부우대조건 지원사업 기회 많습니다.",
    options: [
      "만25세이하",
      "만30세이하",
      "만35세이하",
      "만39세이하",
      "만39세 이상"
    ],
    category: "나이"
  },
  {
    id: 8,
    text: "8.최종 학력과 전공을 작성해 주세요\n\n예:00대학교 00과",
    options: [
      "고등학교 졸업",
      "전문대학 졸업",
      "4년제 대학교 졸업",
      "대학원 졸업",
      "기타"
    ],
    category: "학력"
  },
  {
    id: 9,
    text: "9.현재 직업 또는 직업종 분야를 작성해 주세요\n*4대보험 이력이 높을수로 확률이 좋습니다\n\n예:00업 00팀.부서",
    options: [
      "사무직",
      "영업직",
      "기술직",
      "서비스업",
      "제조업",
      "IT업",
      "기타"
    ],
    category: "직업"
  },
  {
    id: 10,
    text: "10.성함을 작성해주세요\n\n예:홍길동",
    options: [
      "홍길동",
      "김철수",
      "이영희",
      "박민수",
      "기타"
    ],
    category: "성함"
  },
  {
    id: 11,
    text: "마지막.인증가능한 휴대폰 번호를 입력해주세요.\n답변 검토 후 문자로 결과발표 안내드린 후 추가상담을 원하는 분에 한하여 무료 유선 상담 진행 가능합니다.",
    options: [
      "010-1234-5678",
      "010-9876-5432",
      "010-5555-7777",
      "직접 입력"
    ],
    category: "휴대폰번호"
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
  
  // 모달 이벤트 리스너
  document.getElementById('success-close').addEventListener('click', function() {
    hideModal('success-modal');
  });

  document.getElementById('error-close').addEventListener('click', function() {
    hideModal('error-modal');
  });

  document.getElementById('network-close').addEventListener('click', function() {
    hideModal('network-modal');
  });

  // 모달 배경 클릭 시 닫기
  ['success-modal', 'error-modal', 'network-modal'].forEach(modalId => {
    document.getElementById(modalId).addEventListener('click', function(e) {
      if (e.target === this) {
        hideModal(modalId);
      }
    });
  });
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
  let supportAmountMin = 5000;
  let supportAmountMax = 10000;
  let approvalProbability = 70;
  let recommendedProducts = ['정부지원사업', '창업자금지원', '기술개발지원'];
  
  // 답변에 따른 조건 조정
  const businessStatus = answers[0];
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
  
  const supportExperience = answers[1];
  if (supportExperience?.includes('지원경험 있습니다') || supportExperience?.includes('합격해서 지원금 받은적이 있습니다')) {
    approvalProbability += 15;
    supportAmountMax += 2000;
  } else if (supportExperience?.includes('들어본 적 있습니다')) {
    approvalProbability += 5;
  }
  
  const businessItem = answers[2];
  if (businessItem?.includes('생각하고있는 아이템 있습니다')) {
    approvalProbability += 10;
    recommendedProducts.push('아이템개발지원');
  }
  
  const region = answers[3];
  if (region?.includes('서울') || region?.includes('수도권')) {
    approvalProbability += 5; // 수도권 우대
  } else if (region?.includes('제주') || region?.includes('강원')) {
    approvalProbability += 10; // 지역균형발전 우대
  }
  
  const loanHistory = answers[4];
  if (loanHistory?.includes('총1천만원 미안')) {
    approvalProbability += 10; // 대출이력이 적으면 우대
  } else if (loanHistory?.includes('총1억원 이상')) {
    approvalProbability -= 15; // 대출이력이 많으면 불리
  }
  
  const gender = answers[5];
  if (gender?.includes('여성')) {
    approvalProbability += 10; // 여성사업 우대
    recommendedProducts.push('여성창업지원');
  }
  
  const age = answers[6];
  if (age?.includes('만39세이하')) {
    approvalProbability += 15; // 젊은 창업자 우대
    recommendedProducts.push('청년창업지원');
  }
  
  const education = answers[7];
  if (education?.includes('대학원 졸업')) {
    approvalProbability += 10; // 고학력 우대
    recommendedProducts.push('고학력창업지원');
  }
  
  const job = answers[8];
  if (job?.includes('IT업') || job?.includes('기술직')) {
    approvalProbability += 10; // IT/기술분야 우대
    recommendedProducts.push('IT기술지원');
  }
  
  approvalProbability = Math.max(30, Math.min(95, approvalProbability));
  
  return {
    supportAmountMin,
    supportAmountMax,
    approvalProbability,
    recommendedProducts
  };
}

// 결과 표시
function showResult(result) {
  const resultHtml = `
감사합니다! 모든 질문에 답변해주셨습니다.

입력해주신 정보를 바탕으로 정부정책지원 가능 여부와 자금확보 가능성을 분석해드리겠습니다.

📋 <strong>상담 결과 요약:</strong>
• 정부지원 가능 금액: ${result.supportAmountMin}만원 ~ ${result.supportAmountMax}만원
• 지원 확률: ${result.approvalProbability}%
• 추천 지원사업: ${result.recommendedProducts.join(', ')}
• 기술특허개발, 제조, IT 시제품개발, 앱웹개발 지원 가능

📞 <strong>다음 단계:</strong>
• 무료 상담 예약 (전화/대면)
• 정부지원 서류 준비 안내
• 1:1 맞춤 상담 진행

가능 여부 및 모든 비용적 부분은 답변 검토 후 상담내용을 바탕으로 커스텀 이 되고 비용산출이 되기 때문에 반드시 답변을 주셔야 가능성 여부와 비용부분 안내가 가능합니다.

※입력하신 정보는 보안으로 안전하게 보관되며,순차적 상담 후 노출되지 않게 폐기 처분 합니다.
  `;
  
  resultContent.innerHTML = resultHtml;
  resultModal.classList.remove('hidden');
}

// 모달 관련 함수들
function showSuccessModal() {
  const modal = document.getElementById('success-modal');
  modal.classList.remove('hidden');
  modal.classList.add('modal-show');
}

function showErrorModal(message = '상담 예약 중 오류가 발생했습니다.') {
  const modal = document.getElementById('error-modal');
  const messageElement = document.getElementById('error-message');
  messageElement.textContent = message;
  modal.classList.remove('hidden');
  modal.classList.add('modal-show');
}

function showNetworkModal() {
  const modal = document.getElementById('network-modal');
  modal.classList.remove('hidden');
  modal.classList.add('modal-show');
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add('hidden');
  modal.classList.remove('modal-show');
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
      showSuccessModal();
      resultModal.classList.add('hidden');
    } else {
      showErrorModal('상담 예약 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('상담 예약 오류:', error);
    showErrorModal('상담 예약 중 오류가 발생했습니다.');
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
    showNetworkModal();
});
