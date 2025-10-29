// 관리자 페이지 JavaScript

// 전역 변수
let inquiries = [];

// DOM 요소
const loginScreen = document.getElementById('login-screen');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const sidebar = document.getElementById('sidebar');
const menuItems = document.querySelectorAll('.menu-item');
const tabContents = document.querySelectorAll('.tab-content');
const inquiriesList = document.getElementById('inquiries-list');
const inquiriesLoading = document.getElementById('inquiries-loading');
const refreshBtn = document.getElementById('refresh-inquiries');
const passwordForm = document.getElementById('password-form');
const passwordMessage = document.getElementById('password-message');
const inquiryModal = document.getElementById('inquiry-modal');
const modalClose = document.getElementById('modal-close');
const inquiryDetails = document.getElementById('inquiry-details');

// 초기화
document.addEventListener('DOMContentLoaded', function() {
  // 로그인 폼 이벤트
  loginForm.addEventListener('submit', handleLogin);
  
  // 모바일 메뉴 토글
  mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  
  // 메뉴 아이템 클릭
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      if (tab === 'logout') {
        handleLogout();
      } else {
        switchTab(tab);
      }
    });
  });
  
  // 새로고침 버튼
  refreshBtn.addEventListener('click', loadInquiries);
  
  // 비밀번호 변경 폼
  passwordForm.addEventListener('submit', handlePasswordChange);
  
  // 모달 닫기
  modalClose.addEventListener('click', closeModal);
  inquiryModal.addEventListener('click', (e) => {
    if (e.target === inquiryModal) {
      closeModal();
    }
  });
  
  // 세션 확인
  checkSession();
});

// 로그인 처리
async function handleLogin(e) {
  e.preventDefault();
  
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('/api/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem('adminLoggedIn', 'true');
      showDashboard();
      loadInquiries();
    } else {
      showLoginError(result.message);
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    showLoginError('로그인 중 오류가 발생했습니다.');
  }
}

// 로그인 에러 표시
function showLoginError(message) {
  loginError.textContent = message;
  loginError.style.display = 'block';
  setTimeout(() => {
    loginError.style.display = 'none';
  }, 5000);
}

// 대시보드 표시
function showDashboard() {
  loginScreen.classList.add('hidden');
  adminDashboard.classList.remove('hidden');
}

// 로그인 화면 표시
function showLogin() {
  adminDashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  localStorage.removeItem('adminLoggedIn');
}

// 세션 확인
function checkSession() {
  const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  if (loggedIn) {
    showDashboard();
    loadInquiries();
  }
}

// 모바일 메뉴 토글
function toggleMobileMenu() {
  mobileMenuToggle.classList.toggle('active');
  sidebar.classList.toggle('open');
}

// 탭 전환
function switchTab(tabName) {
  // 메뉴 아이템 활성화
  menuItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.tab === tabName) {
      item.classList.add('active');
    }
  });
  
  // 탭 콘텐츠 전환
  tabContents.forEach(tab => {
    tab.classList.remove('active');
  });
  
  const activeTab = document.getElementById(`${tabName}-tab`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
  
  // 모바일에서 사이드바 닫기
  if (window.innerWidth <= 768) {
    mobileMenuToggle.classList.remove('active');
    sidebar.classList.remove('open');
  }
}

// 문의리스트 로드
async function loadInquiries() {
  
  inquiriesLoading.style.display = 'block';
  inquiriesList.innerHTML = '';
  
  try {
    const response = await fetch('/api/admin-inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const result = await response.json();
    
    if (result.success) {
      inquiries = result.inquiries;
      displayInquiries();
    } else {
      inquiriesList.innerHTML = '<div class="error-message">문의리스트를 불러올 수 없습니다.</div>';
    }
  } catch (error) {
    console.error('문의리스트 로드 오류:', error);
    inquiriesList.innerHTML = '<div class="error-message">문의리스트를 불러오는 중 오류가 발생했습니다.</div>';
  } finally {
    inquiriesLoading.style.display = 'none';
  }
}

// 문의리스트 표시
function displayInquiries() {
  if (inquiries.length === 0) {
    inquiriesList.innerHTML = '<div class="message">등록된 문의가 없습니다.</div>';
    return;
  }
  
  inquiriesList.innerHTML = inquiries.map(inquiry => `
    <div class="inquiry-card" onclick="showInquiryDetail('${inquiry.sessionId}')">
      <div class="inquiry-header">
        <div class="inquiry-session">세션: ${inquiry.sessionId}</div>
        <div class="inquiry-date">${formatDate(inquiry.createdAt)}</div>
      </div>
      <div class="inquiry-summary">
        총 ${inquiry.totalQuestions}개 질문에 답변 완료
      </div>
      <div class="inquiry-answers">
        ${inquiry.answers.slice(0, 3).map(answer => `
          <div class="answer-item">
            <div class="answer-question">${answer.questionText}</div>
            <div class="answer-text">${answer.answerText}</div>
            <div class="answer-category">${answer.answerCategory}</div>
          </div>
        `).join('')}
        ${inquiry.answers.length > 3 ? '<div class="answer-item">... 더보기</div>' : ''}
      </div>
    </div>
  `).join('');
}

// 문의 상세 표시
function showInquiryDetail(sessionId) {
  const inquiry = inquiries.find(i => i.sessionId === sessionId);
  if (!inquiry) return;
  
  inquiryDetails.innerHTML = `
    <div class="inquiry-detail">
      <div class="detail-header">
        <h3>세션: ${inquiry.sessionId}</h3>
        <p>등록일: ${formatDate(inquiry.createdAt)}</p>
        <p>총 ${inquiry.totalQuestions}개 질문에 답변</p>
      </div>
      <div class="detail-answers">
        ${inquiry.answers.map((answer, index) => `
          <div class="detail-answer">
            <div class="answer-number">Q${index + 1}</div>
            <div class="answer-content">
              <div class="answer-question">${answer.questionText}</div>
              <div class="answer-text">${answer.answerText}</div>
              <div class="answer-category">카테고리: ${answer.answerCategory}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  inquiryModal.style.display = 'block';
}

// 모달 닫기
function closeModal() {
  inquiryModal.style.display = 'none';
}

// 비밀번호 변경 처리
async function handlePasswordChange(e) {
  e.preventDefault();
  
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  if (newPassword !== confirmPassword) {
    showPasswordMessage('새 비밀번호가 일치하지 않습니다.', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/admin-change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showPasswordMessage(result.message, 'success');
      passwordForm.reset();
    } else {
      showPasswordMessage(result.message, 'error');
    }
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    showPasswordMessage('비밀번호 변경 중 오류가 발생했습니다.', 'error');
  }
}

// 비밀번호 메시지 표시
function showPasswordMessage(message, type) {
  passwordMessage.textContent = message;
  passwordMessage.className = `message ${type}`;
  passwordMessage.style.display = 'block';
  setTimeout(() => {
    passwordMessage.style.display = 'none';
  }, 5000);
}

// 로그아웃 처리
function handleLogout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    showLogin();
  }
}

// 날짜 포맷팅
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 윈도우 리사이즈 이벤트
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    mobileMenuToggle.classList.remove('active');
    sidebar.classList.remove('open');
  }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
});
