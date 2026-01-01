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
        'action.search': '검색',
        'action.searchPlaceholder': '노드 검색...',
        'action.clearSearch': '검색 지우기',
        'action.nextResult': '다음',
        'action.prevResult': '이전',
        
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
        
        // 파일
        'file.save': '로컬 저장',
        'file.import': '불러오기',
        'file.export': '내보내기',
        'file.saveAs': '다른 이름으로 저장',
        'file.saveLocal': '로컬 저장',
        'file.loadLocal': '로컬 불러오기',
        'file.cloudSave': 'Cloud Save',
        'file.cloudLoad': '클라우드 불러오기',
        'file.recent': '최근 파일',
        'file.noRecent': '최근 파일이 없습니다',
        'file.cloud': '클라우드 파일',
        'file.noCloud': '클라우드 파일이 없습니다',
        
        // Import/Export
        'import.json': 'Import JSON',
        'export.png': 'Export PNG',
        'export.json': 'Export as JSON',
        
        // 컨텍스트 메뉴
        'context.edit': '편집',
        'context.delete': '삭제',
        'context.deleteConnection': '🔗 연결 삭제',
        
        // 모달
        'modal.edit.title': '노드 편집',
        'modal.edit.nodeTitle': '제목',
        'modal.edit.content': '내용',
        'modal.edit.link': '링크 (선택사항)',
        'modal.edit.link2': '링크 2 (선택사항)',
        'modal.edit.color': '노드 색상',
        'modal.edit.textColor': '텍스트 색상',
        'modal.edit.save': '저장',
        'modal.edit.cancel': '취소',
        'modal.edit.deleteNode': '노드 삭제',
        'modal.edit.deleteConnections': '연결 삭제',
        'modal.edit.confirmDelete': '이 노드를 삭제하시겠습니까?',
        
        // 색상 팔레트
        'palette.add': '★ 추가',
        'palette.empty': '자주 쓰는 색상을 추가하세요',
        
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
        'action.search': 'Search',
        'action.searchPlaceholder': 'Search nodes...',
        'action.clearSearch': 'Clear search',
        'action.nextResult': 'Next',
        'action.prevResult': 'Previous',
        
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
        
        // Files
        'file.save': 'Save Locally',
        'file.import': 'Import',
        'file.export': 'Export',
        'file.saveAs': 'Save As',
        'file.saveLocal': 'Save Locally',
        'file.loadLocal': 'Load Locally',
        'file.cloudSave': 'Cloud Save',
        'file.cloudLoad': 'Load from Cloud',
        'file.recent': 'Recent Files',
        'file.noRecent': 'No recent files',
        'file.cloud': 'Cloud Files',
        'file.noCloud': 'No cloud files',
        
        // Import/Export
        'import.json': 'Import JSON',
        'export.png': 'Export PNG',
        'export.json': 'Export as JSON',
        'export.pdf': 'Export as PDF',
        
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
        'modal.edit.save': 'Save',
        'modal.edit.cancel': 'Cancel',
        'modal.edit.deleteNode': 'Delete Node',
        'modal.edit.deleteConnections': 'Delete Connections',
        'modal.edit.confirmDelete': 'Are you sure you want to delete this node?',
        
        // Color Palette
        'palette.add': '★ Add',
        'palette.empty': 'Add frequently used colors',
        
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
    
    // data-i18n-placeholder 속성을 가진 요소 업데이트 (placeholder만 변경)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = t(key);
        element.placeholder = translation;
    });
    
    // data-i18n-title 속성을 가진 요소 업데이트 (title만 변경)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        const translation = t(key);
        element.title = translation;
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
