// Supabase 설정
const SUPABASE_URL = 'https://vojrdmxekwosegwwhkln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanJkbXhla3dvc2Vnd3doa2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDA2OTcsImV4cCI6MjA3NjMxNjY5N30.QsgEks0crGuaAka7a5Xak7tra9EQy0_MgssuSVPK3os';

// Supabase 클라이언트는 config.js에서 전역 변수로 선언됨

// 초기화 함수
function initSupabase() {
    if (typeof supabase === 'undefined' || !window.supabase) {
        console.error('Supabase library not loaded');
        return false;
    }
    
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // 인증 상태 변경 리스너
        supabase.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user ?? null;
            updateAuthUI();
            
            if (event === 'SIGNED_IN') {
                console.log('User signed in:', currentUser.email);
                loadCloudMindmaps();
            } else if (event === 'SIGNED_OUT') {
                console.log('User signed out');
                clearMindmapList();
            }
        });
        
        // 현재 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
            currentUser = session?.user ?? null;
            updateAuthUI();
            if (currentUser) {
                loadCloudMindmaps();
            } else {
                clearMindmapList();
            }
        });
        
        return true;
    } catch (error) {
        console.error('Supabase initialization error:', error);
        return false;
    }
}

// 인증 상태에 따라 UI 업데이트
function updateAuthUI() {
    const authSection = document.getElementById('authSection');
    const userSection = document.getElementById('userSection');
    const userEmail = document.getElementById('userEmail');
    
    if (currentUser) {
        if (authSection) authSection.style.display = 'none';
        if (userSection) userSection.style.display = 'block';
        if (userEmail && currentUser.email) {
            // 이메일에서 @ 앞부분만 표시하거나 전체 이메일 표시
            const email = currentUser.email;
            const displayEmail = email.length > 25 ? email.substring(0, 22) + '...' : email;
            userEmail.textContent = displayEmail;
        }
    } else {
        if (authSection) authSection.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
    }
}

// 마인드맵 목록 초기화
function clearMindmapList() {
    const container = document.getElementById('recentItems');
    if (container) {
        container.innerHTML = '<div class="recent-items-empty">로그인 후 파일을 확인할 수 있습니다</div>';
    }
}
