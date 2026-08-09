// Google 로그인 / 로그아웃 / 인증 상태 관리

let currentUser = null;

// Google 로그인
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(function(error) {
        console.error('로그인 오류:', error);
        updateStatus('❌ 로그인 실패: ' + error.message);
    });
}

// 로그아웃
function signOut() {
    auth.signOut().catch(function(error) {
        console.error('로그아웃 오류:', error);
    });
}

// 인증 상태 변경 감지
auth.onAuthStateChanged(function(user) {
    currentUser = user;
    updateAuthUI(user);

    if (user) {
        // 로그인 → 클라우드 파일 목록 로드
        loadCloudRecentFiles();
    } else {
        // 로그아웃 → 로컬 파일 목록 복원
        loadRecentFiles();
    }
});

// 로그인/로그아웃 UI 갱신
function updateAuthUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const userInfo = document.getElementById('userInfo');
    const userPhoto = document.getElementById('userPhoto');
    const userName = document.getElementById('userName');

    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userPhoto) {
            if (user.photoURL) {
                userPhoto.src = user.photoURL;
                userPhoto.style.display = 'block';
            } else {
                userPhoto.style.display = 'none';
            }
        }
        if (userName) userName.textContent = user.displayName || user.email || '';
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
    }
}
