// 다국어 지원 (Internationalization)

// 현재 언어 설정 (기본값: 한국어)
let currentLanguage = localStorage.getItem('language') || 'ko';

// 번역 데이터
const translations = {
    ko: {
        // 헤더
        'app.title': 'Mindmap',
        
        // 테마
        'theme.toggle': '다크모드 전환',
        'theme.dark': '다크모드',
        'theme.light': '라이트모드',
        
        // 인증
        'auth.login': '로그인 / 회원가입',
        'auth.logout': '로그아웃',
        'auth.email': '이메일',
        'auth.password': '비밀번호',
        'auth.signup': '회원가입',
        'auth.signin': '로그인',
        'auth.cancel': '취소',
        'auth.signup.title': '회원가입',
        'auth.signin.title': '로그인',
        
        // 빠른 작업
        'action.addNode': '노드 추가 (랜덤)',
        'action.newPage': '새 페이지',
        'action.undo': '실행취소',
        'action.redo': '다시실행',
        'action.fit': '화면맞춤',
        'action.snap': '그리드스냅',
        
        // 섹션
        'section.controls': '컨트롤',
        'section.nodeStyle': '노드 스타일',
        'section.fileManagement': '파일 관리',
        'section.files': '파일',
        
        // 컨트롤 카테고리
        'controls.category.basic': '기본 조작',
        'controls.category.multiSelect': '다중 선택',
        'controls.category.editing': '편집',
        
        // 컨트롤 - 데스크톱 기본 조작
        'controls.desktop.create': '더블클릭 (빈 공간) → 노드 생성',
        'controls.desktop.edit': '더블클릭 (노드) → 노드 편집',
        'controls.desktop.move': '좌클릭 드래그 (노드) → 이동',
        'controls.desktop.connect': '우클릭 드래그 (노드) → 연결선 생성',
        'controls.desktop.context': '우클릭 (노드) → 메뉴',
        'controls.desktop.pan': '휠 클릭 드래그 → 화면 이동',
        'controls.desktop.zoom': '휠 스크롤 → 확대/축소',
        
        // 컨트롤 - 데스크톱 다중 선택
        'controls.desktop.multiSelect': 'Shift + 드래그 → 영역 선택',
        'controls.desktop.multiSelectCtrl': 'Ctrl + 클릭 → 개별 선택/해제',
        'controls.desktop.selectAll': 'Ctrl + A → 전체 선택',
        'controls.desktop.escape': 'Esc → 선택 해제',
        
        // 컨트롤 - 데스크톱 편집
        'controls.desktop.delete': 'Delete / Backspace → 선택 삭제',
        'controls.desktop.undo': 'Ctrl + Z → 실행취소',
        'controls.desktop.redo': 'Ctrl + Y (또는 Ctrl + Shift + Z) → 다시실행',
        
        // 컨트롤 - 모바일 기본 조작
        'controls.mobile.create': '더블탭 (빈 공간) → 노드 생성',
        'controls.mobile.edit': '더블탭 (노드) → 노드 편집',
        'controls.mobile.move': '드래그 (노드) → 이동',
        'controls.mobile.connect': '길게 누른 후 드래그 (노드) → 연결선 생성',
        'controls.mobile.pan': '한 손가락 드래그 (빈 공간) → 화면 이동',
        'controls.mobile.zoom': '두 손가락 핀치 → 확대/축소',
        
        // 컨트롤 - 모바일 다중 선택
        'controls.mobile.multiSelect': '두 손가락 드래그 (빈 공간) → 영역 선택',
        'controls.mobile.multiSelectToggle': '탭 (노드, 선택 모드) → 개별 선택/해제',
        'controls.mobile.clearSelection': '탭 (빈 공간, 선택 모드) → 선택 해제',
        
        // 노드 스타일
        'style.color': '색상',
        'style.shape': '모양',
        'style.shape.rectangle': '사각형',
        'style.shape.circle': '원형',
        'style.shape.diamond': '마름모',
        
        // 내보내기
        'export.png': 'PNG로 내보내기',
        'export.pdf': 'PDF로 내보내기',
        
        // 파일
        'file.save': '저장',
        'file.saveAs': '다른 이름으로 저장',
        'file.saveLocal': '로컬 저장',
        'file.loadLocal': '로컬 불러오기',
        'file.cloudSave': '클라우드 저장',
        'file.cloudLoad': '클라우드 불러오기',
        'file.recent': '최근 파일',
        'file.noRecent': '최근 파일이 없습니다',
        'file.cloud': '클라우드 파일',
        'file.noCloud': '클라우드 파일이 없습니다',
        
        // 컨텍스트 메뉴
        'context.edit': '편집',
        'context.delete': '삭제',
        'context.deleteConnection': '🔗 연결 삭제',
        'context.refreshAI': 'AI 추천 업데이트',
        
        // 모달
        'modal.edit.title': '노드 편집',
        'modal.edit.nodeTitle': '제목',
        'modal.edit.content': '내용',
        'modal.edit.link': '링크 (선택사항)',
        'modal.edit.link2': '링크 2 (선택사항)',
        'modal.edit.color': '노드 색상',
        'modal.edit.textColor': '텍스트 색상',
        'modal.edit.searchDomains': 'AI 검색 도메인 (선택사항)',
        'modal.edit.searchDomains.placeholder': '예: github.com, stackoverflow.com, medium.com',
        'modal.edit.searchDomains.help': '쉼표로 구분하여 입력하세요. 비워두면 모든 도메인에서 검색합니다.',
        'modal.edit.save': '저장',
        'modal.edit.cancel': '취소',
        'modal.edit.deleteNode': '노드 삭제',
        'modal.edit.deleteConnections': '연결 삭제',
        'modal.edit.confirmDelete': '이 노드를 삭제하시겠습니까?',
        
        'modal.cloudSave.title': '클라우드 저장',
        'modal.cloudSave.name': '마인드맵 이름',
        'modal.cloudSave.save': '저장',
        'modal.cloudSave.cancel': '취소',
        
        // 기본 노드
        'default.welcome.title': '마인드맵에 오신 것을 환영합니다! 👋',
        'default.welcome.content': '빈 공간을 더블클릭하여 새 노드를 만들어보세요. 노드를 우클릭 후 드래그하면 연결할 수 있습니다.',
        'default.howto.title': '사용 방법',
        'default.howto.content': '더블클릭으로 편집 | 드래그로 이동 | 우클릭 드래그로 연결 | 마우스 휠로 확대/축소',
        'default.save.title': '저장하기 💾',
        'default.save.content': '사이드바의 저장 버튼을 클릭하여 마인드맵을 클라우드에 저장하세요!',
        'default.delete.title': '여기서 시작하세요 ✨',
        'default.delete.content': '이 노드들을 삭제하고 당신만의 마인드맵을 만들어보세요!',
        
        // 메시지
        'msg.loginRequired': '로그인이 필요합니다.',
        'msg.saveSuccess': '저장되었습니다.',
        'msg.loadSuccess': '불러왔습니다.',
        'msg.deleteSuccess': '삭제되었습니다.',
        'msg.error': '오류가 발생했습니다.',
        
        // 상태 메시지
        'status.nodeDeleted': '노드가 삭제되었습니다!',
        'status.connectionsDeleted': '연결이 삭제되었습니다!',
        'status.noConnections': '삭제할 연결이 없습니다',
        
        // AI 추천
        'ai.settings': 'AI 설정',
        'ai.settings_title': 'AI 추천 설정',
        'ai.enable': 'AI 추천 활성화',
        'ai.provider': 'AI 제공자',
        'ai.provider.tavily': 'Tavily (무료 1,000건/월)',
        'ai.api_key': 'API 키',
        'ai.settings_note': '참고: API 키는 브라우저에 로컬로 저장됩니다.',
        'ai.recommendations_title': 'AI 추천 정보',
        'ai.no_recommendations': '아직 추천 정보가 없습니다.',
        'ai.loading': 'AI가 정보를 검색하는 중...',
        'ai.error': 'AI 추천을 가져오는 중 오류가 발생했습니다.',
        'ai.fetch_error': 'API 요청 실패',
        'ai.guide_title': '사용 가이드',
        'ai.guide_api_title': '1. API 키 발급 (무료)',
        'ai.guide_api_signup': 'tavily.com에서 회원가입',
        'ai.guide_api_plan': '무료 플랜: 월 1,000건 검색 가능',
        'ai.guide_api_copy': 'API 키를 복사하여 아래에 입력',
        'ai.guide_security_title': '2. 보안 주의사항',
        'ai.guide_security_local': 'API 키는 브라우저에만 저장됩니다',
        'ai.guide_security_public': '공용 컴퓨터에서는 사용 후 삭제하세요',
        'ai.guide_security_usage': '사용량 확인',
        'ai.delete_button': '삭제',
        'common.close': '닫기',
        'common.cancel': '취소',
        'common.save': '저장',
        
        // Theme
        'theme.toggle': '다크모드 토글',
        'theme.dark': '다크모드',
        'theme.light': '라이트모드'
    },
    en: {
        // Header
        'app.title': 'Mindmap',
        
        // Theme
        'theme.toggle': 'Toggle Dark Mode',
        'theme.dark': 'Dark Mode',
        'theme.light': 'Light Mode',
        
        // Auth
        'auth.login': 'Login / Sign up',
        'auth.logout': 'Logout',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.signup': 'Sign up',
        'auth.signin': 'Sign in',
        'auth.cancel': 'Cancel',
        'auth.signup.title': 'Sign Up',
        'auth.signin.title': 'Sign In',
        
        // Quick Actions
        'action.addNode': 'Add Node (Random)',
        'action.newPage': 'New Page',
        'action.undo': 'Undo',
        'action.redo': 'Redo',
        'action.fit': 'Fit to Screen',
        'action.snap': 'Snap to Grid',
        
        // Sections
        'section.controls': 'Controls',
        'section.nodeStyle': 'Node Style',
        'section.fileManagement': 'File Management',
        'section.files': 'Files',
        
        // Control Categories
        'controls.category.basic': 'Basic Controls',
        'controls.category.multiSelect': 'Multi-Selection',
        'controls.category.editing': 'Editing',
        
        // Controls - Desktop Basic
        'controls.desktop.create': 'Double-click (empty space) → Create node',
        'controls.desktop.edit': 'Double-click (node) → Edit node',
        'controls.desktop.move': 'Left-click drag (node) → Move',
        'controls.desktop.connect': 'Right-click drag (node) → Create connection',
        'controls.desktop.context': 'Right-click (node) → Menu',
        'controls.desktop.pan': 'Middle-click drag → Pan canvas',
        'controls.desktop.zoom': 'Mouse wheel → Zoom in/out',
        
        // Controls - Desktop Multi-Selection
        'controls.desktop.multiSelect': 'Shift + Drag → Area select',
        'controls.desktop.multiSelectCtrl': 'Ctrl + Click → Toggle selection',
        'controls.desktop.selectAll': 'Ctrl + A → Select all',
        'controls.desktop.escape': 'Esc → Clear selection',
        
        // Controls - Desktop Editing
        'controls.desktop.delete': 'Delete / Backspace → Delete selected',
        'controls.desktop.undo': 'Ctrl + Z → Undo',
        'controls.desktop.redo': 'Ctrl + Y (or Ctrl + Shift + Z) → Redo',
        
        // Controls - Mobile Basic
        'controls.mobile.create': 'Double-tap (empty space) → Create node',
        'controls.mobile.edit': 'Double-tap (node) → Edit node',
        'controls.mobile.move': 'Drag (node) → Move',
        'controls.mobile.connect': 'Long press & drag (node) → Create connection',
        'controls.mobile.pan': 'One finger drag (empty space) → Pan canvas',
        'controls.mobile.zoom': 'Two finger pinch → Zoom in/out',
        
        // Controls - Mobile Multi-Selection
        'controls.mobile.multiSelect': 'Two finger drag (empty space) → Area select',
        'controls.mobile.multiSelectToggle': 'Tap (node, selection mode) → Toggle selection',
        'controls.mobile.clearSelection': 'Tap (empty space, selection mode) → Clear selection',
        
        // Node Style
        'style.color': 'Color',
        'style.shape': 'Shape',
        'style.shape.rectangle': 'Rectangle',
        'style.shape.circle': 'Circle',
        'style.shape.diamond': 'Diamond',
        
        // Export
        'export.png': 'Export as PNG',
        'export.pdf': 'Export as PDF',
        
        // Files
        'file.save': 'Save',
        'file.saveAs': 'Save As',
        'file.saveLocal': 'Save Locally',
        'file.loadLocal': 'Load Locally',
        'file.cloudSave': 'Save to Cloud',
        'file.cloudLoad': 'Load from Cloud',
        'file.recent': 'Recent Files',
        'file.noRecent': 'No recent files',
        'file.cloud': 'Cloud Files',
        'file.noCloud': 'No cloud files',
        
        // Context Menu
        'context.edit': 'Edit',
        'context.delete': 'Delete',
        'context.deleteConnection': '🔗 Delete Connection',
        'context.refreshAI': 'Refresh AI Recommendations',
        
        // Modals
        'modal.edit.title': 'Edit Node',
        'modal.edit.nodeTitle': 'Title',
        'modal.edit.content': 'Content',
        'modal.edit.link': 'Link (Optional)',
        'modal.edit.link2': 'Link 2 (Optional)',
        'modal.edit.color': 'Node Color',
        'modal.edit.textColor': 'Text Color',
        'modal.edit.searchDomains': 'AI Search Domains (Optional)',
        'modal.edit.searchDomains.placeholder': 'e.g., github.com, stackoverflow.com, medium.com',
        'modal.edit.searchDomains.help': 'Separate with commas. Leave empty to search all domains.',
        'modal.edit.save': 'Save',
        'modal.edit.cancel': 'Cancel',
        'modal.edit.deleteNode': 'Delete Node',
        'modal.edit.deleteConnections': 'Delete Connections',
        'modal.edit.confirmDelete': 'Are you sure you want to delete this node?',
        
        'modal.cloudSave.title': 'Save to Cloud',
        'modal.cloudSave.name': 'Mindmap Name',
        'modal.cloudSave.save': 'Save',
        'modal.cloudSave.cancel': 'Cancel',
        
        // Default Nodes
        'default.welcome.title': 'Welcome to Mindmap! 👋',
        'default.welcome.content': 'Double-click empty space to create a new node. Right-click and drag to connect nodes.',
        'default.howto.title': 'How to Use',
        'default.howto.content': 'Double-click to edit | Drag to move | Right-drag to connect | Mouse wheel to zoom',
        'default.save.title': 'Save Your Work 💾',
        'default.save.content': 'Click the save button in the sidebar to store your mindmap in the cloud!',
        'default.delete.title': 'Delete This ✨',
        'default.delete.content': 'Delete these welcome nodes and start creating your own mindmap!',
        
        // Messages
        'msg.loginRequired': 'Login required.',
        'msg.saveSuccess': 'Saved successfully.',
        'msg.loadSuccess': 'Loaded successfully.',
        'msg.deleteSuccess': 'Deleted successfully.',
        'msg.error': 'An error occurred.',
        
        // Status Messages
        'status.nodeDeleted': 'Node deleted!',
        'status.connectionsDeleted': 'Connections deleted!',
        'status.noConnections': 'No connections to delete',
        
        // AI Recommendations
        'ai.settings': 'AI Settings',
        'ai.settings_title': 'AI Recommendation Settings',
        'ai.enable': 'Enable AI Recommendations',
        'ai.provider': 'Provider',
        'ai.provider.tavily': 'Tavily (Free 1,000/month)',
        'ai.api_key': 'API Key',
        'ai.settings_note': 'Note: API key is stored locally in your browser.',
        'ai.recommendations_title': 'AI Recommendations',
        'ai.no_recommendations': 'No recommendations yet.',
        'ai.loading': 'AI is searching for information...',
        'ai.error': 'Error fetching AI recommendations.',
        'ai.fetch_error': 'API request failed',
        'ai.guide_title': 'User Guide',
        'ai.guide_api_title': '1. Get API Key (Free)',
        'ai.guide_api_signup': 'Sign up at tavily.com',
        'ai.guide_api_plan': 'Free plan: 1,000 searches/month',
        'ai.guide_api_copy': 'Copy API key and paste below',
        'ai.guide_security_title': '2. Security Notice',
        'ai.guide_security_local': 'API key is stored in browser only',
        'ai.guide_security_public': 'Delete after use on public computers',
        'ai.guide_security_usage': 'Check usage',
        'ai.delete_button': 'Delete',
        'common.close': 'Close',
        'common.cancel': 'Cancel',
        'common.save': 'Save'
    }
};

// 번역 가져오기
function t(key) {
    return translations[currentLanguage][key] || key;
}

// 현재 언어 가져오기
function getCurrentLanguage() {
    return currentLanguage;
}

// 언어 변경
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // 1. 먼저 노드 텍스트 업데이트
    updateDefaultNodes();
    
    // 2. 그 다음 UI 텍스트 업데이트 (drawCanvas 포함)
    updateUILanguage();
}

// 기본 노드 텍스트 가져오기
function getDefaultNodeTexts(lang) {
    return lang === 'ko' ? {
        welcome: {
            title: '마인드맵에 오신 것을 환영합니다!',
            content: '빈 공간을 더블클릭하여 새 노드를 만들어보세요. 우클릭 후 드래그하면 노드를 연결할 수 있습니다.'
        },
        save: {
            title: '작업 저장하기',
            content: '사이드바의 저장 버튼을 클릭하여 마인드맵을 클라우드에 저장할 수 있습니다!'
        },
        delete: {
            title: '여기서 시작하세요',
            content: '이 노드를 우클릭하여 "삭제"를 선택하면 예제 노드들을 지우고 새로 시작할 수 있습니다!'
        }
    } : {
        welcome: {
            title: 'Welcome to Mindmap!',
            content: 'Double-click empty space to create a new node. Right-click and drag to connect nodes.'
        },
        save: {
            title: 'Save Your Work',
            content: 'Click the save button in the sidebar to store your mindmap in the cloud!'
        },
        delete: {
            title: 'Delete This',
            content: 'Right-click this node and select "Delete" to remove these example nodes and start fresh!'
        }
    };
}

// 기본 환영 노드 업데이트
function updateDefaultNodes() {
    // 기본 노드 ID 목록
    const defaultNodeIds = ['welcome', 'save', 'delete'];
    
    // 언어별 노드 텍스트
    const nodeTexts = getDefaultNodeTexts(currentLanguage);
    
    // 기본 노드들만 업데이트 (사용자가 만든 노드는 변경하지 않음)
    if (typeof nodes !== 'undefined') {
        defaultNodeIds.forEach(id => {
            const node = nodes.find(n => n.id === id);
            if (node && nodeTexts[id]) {
                node.title = nodeTexts[id].title;
                node.content = nodeTexts[id].content;
                // 노드 캐시 무효화
                if (typeof invalidateNodeCache === 'function') {
                    invalidateNodeCache(node);
                }
            }
        });
    }
}

// UI 언어 업데이트
function updateUILanguage() {
    // data-i18n 속성을 가진 모든 요소 업데이트
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        // 버튼, 입력 필드 등의 플레이스홀더나 텍스트 업데이트
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else {
                element.value = translation;
            }
        } else if (element.hasAttribute('title')) {
            element.title = translation;
        } else {
            element.textContent = translation;
        }
    });
    
    // 언어 토글 버튼 텍스트 업데이트 (현재 언어 표시)
    const langText = document.getElementById('langText');
    if (langText) {
        langText.textContent = currentLanguage === 'ko' ? 'KO' : 'EN';
    }
    
    // HTML lang 속성 업데이트
    document.documentElement.lang = currentLanguage;
    
    // 캔버스 다시 그리기 (노드의 텍스트가 변경되었으므로)
    if (typeof drawCanvas === 'function') {
        drawCanvas();
    }
}

// 언어 토글
function toggleLanguage() {
    const newLang = currentLanguage === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
}

// 페이지 로드 시 언어 초기화
function initializeLanguage() {
    updateUILanguage();
}
