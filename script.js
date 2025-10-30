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
      "총1천만원 미만",
      "총1천만원 이상~3천만원 미만",
      "총3천만원 이상~5천만원 미만",
      "총5천만원 이상~1억원 미만",
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
    options: [],
    category: "학력",
    inputType: "text",
    placeholder: "예: 00대학교 00학과"
  },
  {
    id: 9,
    text: "9.현재 직업 또는 직업종 분야를 작성해 주세요\n*4대보험 이력이 높을수록 확률이 좋습니다\n\n예:00업 00팀.부서",
    options: [],
    category: "직업",
    inputType: "text",
    placeholder: "예: IT업 개발팀"
  },
  {
    id: 10,
    text: "10.성함을 작성해주세요\n\n예:홍길동",
    options: [],
    category: "성함",
    inputType: "text",
    placeholder: "예: 홍길동"
  },
  {
    id: 11,
    text: "마지막.인증가능한 휴대폰 번호를 입력해주세요.\n답변 검토 후 문자로 결과발표 안내드린 후 추가상담을 원하는 분에 한하여 무료 유선 상담 진행 가능합니다.",
    options: [],
    category: "휴대폰번호",
    inputType: "phone"
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
const answerOptions = document.getElementById('answer-options');
const chatContainer = document.getElementById('chat-container');
const messagesList = document.getElementById('messages-list');
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
  
  // 실시간 시간 업데이트 시작
  startRealtimeClock();
  
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
  appendAssistantMessageBubble(question.text);
  
  // 답변 옵션 생성
  answerOptions.innerHTML = '';
  
  // 휴대폰번호 입력인 경우 특별한 UI 생성
  if (question.inputType === 'phone') {
    createPhoneInputUI();
  } else if (question.inputType === 'text') {
    createTextInputUI(question.placeholder || '내용을 입력하세요');
  } else {
    // 일반 옵션 버튼들 생성
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
      
      // 키보드 이벤트: Enter, Space로 선택
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAnswer(option);
        }
        
        // 방향키로 버튼 이동
        const buttons = Array.from(answerOptions.querySelectorAll('.answer-button'));
        const currentIndex = buttons.indexOf(button);
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % buttons.length;
          buttons[nextIndex].focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
          buttons[prevIndex].focus();
        }
      });
      
      answerOptions.appendChild(button);
    });
    
    // 첫 번째 버튼에 자동 포커스
    setTimeout(() => {
      const firstButton = answerOptions.querySelector('.answer-button');
      if (firstButton) {
        firstButton.focus();
      }
    }, 100);
  }
  
  // 진행률 업데이트
  updateProgress();
}
// 어시스턴트 메시지 버블 추가 (왼쪽)
function appendAssistantMessageBubble(text) {
  if (!messagesList) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'flex w-full mb-4 fade-in justify-start';
  wrapper.innerHTML = `
    <div class="flex gap-3 max-w-85 md:max-w-70">
      <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden bg-card border border-primary/30">
        <img src="logo.png" alt="케이프로미넌트" class="w-full h-full object-cover rounded-full">
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs font-medium text-primary">케이프로미넌트</span>
        <div class="px-4 py-3 rounded-sm shadow-lg bg-card border border-border text-white chat-bubble assistant terminal-glow">
          <p class="text-sm whitespace-pre-wrap leading-relaxed text-left">${text}</p>
        </div>
        <span class="text-[10px] text-gray-500 mt-1">${formatFullTime(new Date())}</span>
      </div>
    </div>
  `;
  messagesList.appendChild(wrapper);
  // 부드러운 스크롤 애니메이션
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: 'smooth'
  });
}

// 사용자 메시지 버블 추가 (오른쪽)
function appendUserMessageBubble(text) {
  if (!messagesList) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'flex w-full mb-4 fade-in justify-end';
  wrapper.innerHTML = `
    <div class="flex gap-3 max-w-85 md:max-w-70 flex-row-reverse">
      <div class="flex flex-col gap-1">
        <div class="px-4 py-3 rounded-sm shadow-lg bg-gradient-to-r from-[#00E5DB] to-[#00C7BE] text-gray-900 chat-bubble user border border-border">
          <p class="text-sm whitespace-pre-wrap leading-relaxed text-left">${text}</p>
        </div>
        <span class="text-[10px] text-gray-500 mt-1 text-right">${formatFullTime(new Date())}</span>
      </div>
    </div>
  `;
  messagesList.appendChild(wrapper);
  // 부드러운 스크롤 애니메이션
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: 'smooth'
  });
}

// 공통 텍스트 입력 UI 생성
function createTextInputUI(placeholder) {
  const container = document.createElement('div');
  container.className = 'space-y-3';
  container.innerHTML = `
    <div class="relative">
      <input 
        type="text" 
        id="text-input" 
        placeholder="${placeholder}" 
        class="w-full px-4 py-3 rounded-sm bg-card border border-border text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        maxlength="80"
      />
      <button 
        id="text-submit-btn" 
        class="text-input-btn absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 px-3 py-2 text-sm"
      >
        확인
      </button>
    </div>
  `;
  
  answerOptions.appendChild(container);
  
  const input = document.getElementById('text-input');
  const submitBtn = document.getElementById('text-submit-btn');
  
  // Enter 키 제출
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitBtn.click();
    }
  });
  
  // 버튼 제출
  submitBtn.addEventListener('click', function() {
    const value = input.value.trim();
    if (!value) {
      alert('내용을 입력해주세요.');
      return;
    }
    handleAnswer(value);
  });
  
  // 포커스 자동 설정
  setTimeout(() => {
    input.focus();
  }, 100);
}

// 휴대폰번호 입력 UI 생성
function createPhoneInputUI() {
  const phoneInputContainer = document.createElement('div');
  phoneInputContainer.className = 'space-y-4';
  phoneInputContainer.innerHTML = `
    <div class="relative">
      <input 
        type="tel" 
        id="phone-input" 
        placeholder="010-1234-5678" 
        class="w-full px-4 py-3 rounded-sm bg-card border border-border text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        maxlength="13"
      />
      <button 
        id="send-verification-btn" 
        disabled
        class="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-lg bg-gradient-to-r from-[#00E5DB] to-[#00C7BE] text-gray-900 hover:shadow-[0_0_15px_rgba(0,229,219,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" 
        title="인증번호 발송"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send h-4 w-4" aria-hidden="true">
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
          <path d="m21.854 2.147-10.94 10.939"></path>
        </svg>
      </button>
    </div>
    <div id="verification-section" class="hidden space-y-3">
      <div class="relative">
        <input 
          type="text" 
          id="verification-code-input" 
          placeholder="6자리 인증번호를 입력하세요" 
          class="w-full px-4 py-3 rounded-sm bg-card border border-border text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          maxlength="6"
        />
        <button 
          id="verify-code-btn" 
          class="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#00E5DB] to-[#00C7BE] text-gray-900 hover:shadow-[0_0_15px_rgba(0,229,219,0.4)] active:scale-95 transition-all duration-200 text-sm"
        >
          인증
        </button>
      </div>
      <div id="verification-status" class="text-sm text-gray-400"></div>
    </div>
  `;
  
  answerOptions.appendChild(phoneInputContainer);
  
  // 이벤트 리스너 등록
  setupPhoneInputEvents();
  
  // 포커스 자동 설정
  setTimeout(() => {
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput) {
      phoneInput.focus();
    }
  }, 100);
}

// 휴대폰번호 입력 이벤트 설정
function setupPhoneInputEvents() {
  const phoneInput = document.getElementById('phone-input');
  const sendBtn = document.getElementById('send-verification-btn');
  const verificationSection = document.getElementById('verification-section');
  const verificationCodeInput = document.getElementById('verification-code-input');
  const verifyBtn = document.getElementById('verify-code-btn');
  const verificationStatus = document.getElementById('verification-status');
  
  // 휴대폰번호 입력 포맷팅
  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // 숫자만 추출
    if (value.length >= 4) {
      value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (value.length >= 3) {
      value = value.replace(/(\d{3})(\d{0,4})/, '$1-$2');
    }
    e.target.value = value;
    
    // 발송 버튼 활성화/비활성화
    sendBtn.disabled = value.length < 13;
  });
  
  // 인증번호 발송
  sendBtn.addEventListener('click', async function() {
    const phoneNumber = phoneInput.value.replace(/\D/g, '');
    if (phoneNumber.length !== 11) {
      alert('올바른 휴대폰번호를 입력해주세요.');
      return;
    }
    
    try {
      sendBtn.disabled = true;
      sendBtn.innerHTML = `
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
      `;
      
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          phoneNumber: phoneNumber
        })
      });
      
      if (response.ok) {
        verificationSection.classList.remove('hidden');
        verificationStatus.textContent = '인증번호가 발송되었습니다.';
        verificationStatus.className = 'text-sm text-green-400';
        
        // 3분 타이머 시작
        startVerificationTimer();
      } else {
        let errorMessage = '인증번호 발송 실패';
        try {
          const errJson = await response.json();
          errorMessage = errJson.message || errorMessage;
        } catch (_) {}
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('인증번호 발송 오류:', error);
      verificationStatus.textContent = error?.message || '인증번호 발송에 실패했습니다. 다시 시도해주세요.';
      verificationStatus.className = 'text-sm text-red-400';
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send h-4 w-4" aria-hidden="true">
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
          <path d="m21.854 2.147-10.94 10.939"></path>
        </svg>
      `;
    }
  });
  
  // 인증번호 입력
  verificationCodeInput.addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, ''); // 숫자만 입력
  });
  
  // 인증번호 검증
  verifyBtn.addEventListener('click', async function() {
    const code = verificationCodeInput.value;
    if (code.length !== 6) {
      alert('6자리 인증번호를 입력해주세요.');
      return;
    }
    
    try {
      verifyBtn.disabled = true;
      verifyBtn.textContent = '인증 중...';
      
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          phoneNumber: phoneInput.value.replace(/\D/g, ''),
          verificationCode: code
        })
      });
      
      if (response.ok) {
        verificationStatus.textContent = '인증이 완료되었습니다!';
        verificationStatus.className = 'text-sm text-green-400';
        
        // 답변 저장 및 다음 단계로 진행
        setTimeout(() => {
          handleAnswer(phoneInput.value);
        }, 1000);
      } else {
        const result = await response.json();
        verificationStatus.textContent = result.message || '인증번호가 올바르지 않습니다.';
        verificationStatus.className = 'text-sm text-red-400';
      }
    } catch (error) {
      console.error('인증 오류:', error);
      verificationStatus.textContent = '인증 중 오류가 발생했습니다.';
      verificationStatus.className = 'text-sm text-red-400';
    } finally {
      verifyBtn.disabled = false;
      verifyBtn.textContent = '인증';
    }
  });
}

// 인증번호 타이머 (3분)
function startVerificationTimer() {
  let timeLeft = 180; // 3분
  const verificationStatus = document.getElementById('verification-status');
  
  const timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    verificationStatus.textContent = `인증번호가 발송되었습니다. (${minutes}:${seconds.toString().padStart(2, '0')})`;
    
    timeLeft--;
    
    if (timeLeft < 0) {
      clearInterval(timer);
      verificationStatus.textContent = '인증번호가 만료되었습니다. 다시 발송해주세요.';
      verificationStatus.className = 'text-sm text-red-400';
    }
  }, 1000);
}

// 답변 처리
async function handleAnswer(answer) {
  const question = questions[currentQuestionIndex];
  answers[currentQuestionIndex] = answer;
  appendUserMessageBubble(answer);
  
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
  let loanSupportProbability = 95; // 대출 지원확률
  let recommendedProducts = ['정부지원사업', '창업자금지원', '기술개발지원'];
  
  // 답변에 따른 조건 조정
  const businessStatus = answers[0];
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
  
  const supportExperience = answers[1];
  if (supportExperience?.includes('지원경험 있습니다') || supportExperience?.includes('합격해서 지원금 받은적이 있습니다')) {
    supportAmountMax += 2000;
  }
  
  const businessItem = answers[2];
  if (businessItem?.includes('생각하고있는 아이템 있습니다')) {
    recommendedProducts.push('아이템개발지원');
  }
  
  const region = answers[3];
  if (region?.includes('제주') || region?.includes('강원')) {
    // 지역균형발전 우대
  }
  
  // 대출이력에 따른 지원확률 계산
  const loanHistory = answers[4];
  if (loanHistory?.includes('총1천만원 미만')) {
    loanSupportProbability = 95;
  } else if (loanHistory?.includes('총1천만원 이상~3천만원 미만')) {
    loanSupportProbability = 90;
  } else if (loanHistory?.includes('총3천만원 이상~5천만원 미만')) {
    loanSupportProbability = 85;
  } else if (loanHistory?.includes('총5천만원 이상~1억원 미만')) {
    loanSupportProbability = 80;
  } else if (loanHistory?.includes('총1억원 이상')) {
    loanSupportProbability = 70;
  }
  
  const gender = answers[5];
  if (gender?.includes('여성')) {
    recommendedProducts.push('여성창업지원');
  }
  
  const age = answers[6];
  if (age?.includes('만39세이하')) {
    recommendedProducts.push('청년창업지원');
  }
  
  const education = answers[7];
  if (education?.includes('대학원 졸업')) {
    recommendedProducts.push('고학력창업지원');
  }
  
  const job = answers[8];
  if (job?.includes('IT업') || job?.includes('기술직')) {
    recommendedProducts.push('IT기술지원');
  }
  
  return {
    supportAmountMin,
    supportAmountMax,
    loanSupportProbability,
    recommendedProducts
  };
}

// 결과 표시
function showResult(result) {
  const loanSupportRate = result.loanSupportProbability || 80; // 대출 지원확률 기본값
  const resultHtml = `
감사합니다! 모든 질문에 답변해주셨습니다.

입력해주신 정보를 바탕으로 정부정책지원 기술특허개발 가능여부와 자금확보 가능성을 분석해 드립니다.

📋 <strong>상담 결과 요약:</strong>
• 정부지원 가능자금: 최저 1억원 ~ 최대 3억원 예비창업지원
• 대출 지원확률: ${loanSupportRate}%
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
  // 대화에서 이미 받은 정보 사용
  const name = answers[9] || '고객'; // 질문 10번: 성함
  const phone = answers[10] || ''; // 질문 11번: 휴대폰번호
  
  if (!phone) {
    showErrorModal('휴대폰번호 정보가 없습니다. 다시 시작해주세요.');
    return;
  }
  
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
        email: '', // 이메일은 선택사항이므로 빈 값
        consultationType: 'phone'
      })
    });
    
    if (response.ok) {
      showSuccessModal();
      resultModal.classList.add('hidden');
      
      // 3초 후 자동으로 초기 단계로 돌아가기
      setTimeout(() => {
        resetChat();
      }, 3000);
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

// 실시간 시간 포맷팅 함수 (년월일시분초)
function formatFullTime(date = new Date()) {
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

// 실시간 시간 업데이트 함수
function updateRealtimeClock() {
  const now = new Date();
  const timeString = formatFullTime(now);
  
  // 모든 시간 표시 요소 업데이트
  const welcomeTimeElement = document.getElementById('welcome-time');
  const currentQuestionTimeElement = document.getElementById('current-question-time');
  
  if (welcomeTimeElement) {
    welcomeTimeElement.textContent = timeString;
  }
  
  if (currentQuestionTimeElement) {
    currentQuestionTimeElement.textContent = timeString;
  }
}

// 실시간 시간 업데이트 시작
function startRealtimeClock() {
  // 즉시 한 번 실행
  updateRealtimeClock();
  
  // 1초마다 업데이트
  setInterval(updateRealtimeClock, 1000);
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
