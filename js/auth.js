// Supabase 인증 관련 함수들

// 이메일 회원가입
async function signUpWithEmail() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (!email || !password) {
        updateStatus('❌ 이메일과 비밀번호를 입력하세요');
        return;
    }
    
    if (password !== confirmPassword) {
        updateStatus('❌ 비밀번호가 일치하지 않습니다');
        return;
    }
    
    if (password.length < 6) {
        updateStatus('❌ 비밀번호는 6자 이상이어야 합니다');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        
        updateStatus('✅ 회원가입 완료! 이메일을 확인하세요');
        closeAuthModal();
    } catch (error) {
        console.error('Sign up error:', error);
        updateStatus('❌ 회원가입 실패: ' + error.message);
    }
}

// 이메일 로그인
async function signInWithEmail() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        updateStatus('❌ 이메일과 비밀번호를 입력하세요');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        
        updateStatus('✅ 로그인 성공!');
        closeAuthModal();
    } catch (error) {
        console.error('Sign in error:', error);
        updateStatus('❌ 로그인 실패: ' + error.message);
    }
}

// Google 로그인
async function signInWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
    } catch (error) {
        console.error('Google sign in error:', error);
        updateStatus('❌ Google 로그인 실패: ' + error.message);
    }
}

// GitHub 로그인
async function signInWithGithub() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
    } catch (error) {
        console.error('GitHub sign in error:', error);
        updateStatus('❌ GitHub 로그인 실패: ' + error.message);
    }
}

// 로그아웃
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        updateStatus('✅ 로그아웃 되었습니다');
    } catch (error) {
        console.error('Sign out error:', error);
        updateStatus('❌ 로그아웃 실패: ' + error.message);
    }
}

// 인증 모달 열기
function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    showLoginForm();
}

// 인증 모달 닫기
function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

// 로그인 폼 표시
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
}

// 회원가입 폼 표시
function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}
