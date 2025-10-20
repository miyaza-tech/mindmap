// 초기화 및 시작 함수

// 초기화
function init() {
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
        linkIconBounds: null,
        aiRecommendations: [],
        hasNewRecommendations: false,
        notificationIconBounds: null,
        searchDomains: [] // 각 노드마다 독립적인 배열
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
        linkIconBounds: null,
        aiRecommendations: [],
        hasNewRecommendations: false,
        notificationIconBounds: null,
        searchDomains: []
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
        linkIconBounds: null,
        aiRecommendations: [],
        hasNewRecommendations: false,
        notificationIconBounds: null,
        searchDomains: []
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
    
    initializeEvents();
    init();
    
    // localStorage에서 현재 파일 정보 복원
    const savedMindmapId = localStorage.getItem('currentMindmapId');
    const savedMindmapName = localStorage.getItem('currentMindmapName');
    if (savedMindmapId && savedMindmapName) {
        currentMindmapId = savedMindmapId;
        currentMindmapName = savedMindmapName;
    }
    
    // Supabase 초기화
    const supabaseInitialized = initSupabase();
    
    // 최근 파일 목록 로드 (로컬 스토리지는 폴백으로 유지)
    if (!supabaseInitialized) {
        loadRecentFiles();
    }
    
    // 토글 섹션 초기 높이 설정
    initializeToggleSections();
    
    // 스냅 아이콘 초기 상태 설정
    const snapIcon = document.getElementById('snapIcon');
    if (snapIcon && snapToGrid) {
        snapIcon.src = 'assets/snap.png';
    }
});
