// 초기화 및 시작 함수

// 초기화
function init() {
    // Canvas 요소 초기화
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    
    // 기본 노드들 생성 (그리드에 스냅된 위치)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 언어별 기본 노드 텍스트
    const lang = getCurrentLanguage();
    
    const nodeTexts = getDefaultNodeTexts(lang);
    
    const deletePos = snapToGridPoint(centerX / zoom - camera.x / zoom, (centerY - 200) / zoom - camera.y / zoom);
    nodes.push({
        id: 'delete',
        x: deletePos.x,
        y: deletePos.y,
        title: nodeTexts.delete.title,
        content: nodeTexts.delete.content,
        width: 0,
        height: 0,
        color: '#ffffff',
        shape: 'circle',
        link: '',
        linkIconBounds: null
    });
    
    const centralPos = snapToGridPoint(centerX / zoom - camera.x / zoom, centerY / zoom - camera.y / zoom);
    nodes.push({
        id: 'welcome',
        x: centralPos.x,
        y: centralPos.y,
        title: nodeTexts.welcome.title,
        content: nodeTexts.welcome.content,
        width: 0,
        height: 0,
        color: '#ffffff',
        shape: 'rectangle',
        link: '',
        linkIconBounds: null
    });
    
    const savePos = snapToGridPoint(centerX / zoom - camera.x / zoom, (centerY + 200) / zoom - camera.y / zoom);
    nodes.push({
        id: 'save',
        x: savePos.x,
        y: savePos.y,
        title: nodeTexts.save.title,
        content: nodeTexts.save.content,
        width: 0,
        height: 0,
        color: '#ffffff',
        shape: 'rectangle',
        link: '',
        linkIconBounds: null
    });
    
    // 연결 생성
    connections.push({ from: 'welcome', to: 'delete' });
    connections.push({ from: 'welcome', to: 'save' });
    
    saveState();
    drawCanvas();
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    // 언어 초기화
    initializeLanguage();
    
    // 다크모드 초기화
    initializeDarkMode();
    
    init();
    initializeEvents();
    
    // 리사이즈 이벤트 디바운싱
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (typeof resetSidebarState === 'function') resetSidebarState();
            resizeCanvas();
        }, 250);
    });
    
    // 최근 파일 목록 로드
    loadRecentFiles();
    
    // 토글 섹션 초기 높이 설정
    initializeToggleSections();
    
    // 스냅 아이콘 초기 상태 설정
    const snapIcon = document.getElementById('snapIcon');
    if (snapIcon && snapToGrid) {
        snapIcon.src = 'assets/snap.png';
    }
});
