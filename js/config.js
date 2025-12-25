// 전역 변수 (DOM 요소는 나중에 초기화됨)
let canvas = null;
let ctx = null;

// 데이터 저장소
let nodes = [];
let connections = [];
let history = [];
let historyIndex = -1;

// 상태 변수
let isDragging = false;
let isRightDragging = false;
let isMiddleDragging = false;
let selectedNode = null;
let selectedNodes = []; // 다중 선택된 노드들
let isSelecting = false; // 영역 선택 중
let selectionStart = { x: 0, y: 0 }; // 선택 영역 시작점
let selectionEnd = { x: 0, y: 0 }; // 선택 영역 끝점
let isMultiSelectMode = false; // 모바일 다중 선택 모드
let dragOffset = { x: 0, y: 0 };
let middleDragStart = { x: 0, y: 0 };
let cameraStart = { x: 0, y: 0 };
let mousePos = { x: 0, y: 0 };
let connectingFromNode = null;
let rightClickedNode = null;
let rightClickedConnection = null;
let editingNode = null;

// 검색 상태
let searchResults = [];
let currentSearchIndex = -1;
let searchQuery = '';

// 현재 파일 추적
let currentMindmapId = null;
let currentMindmapName = null;

// 카메라 및 줌
let camera = { x: 0, y: 0 };
let zoom = 1;
let gridSize = 20;
let showGrid = true;
let snapToGrid = true;

// 노드 스타일
let currentNodeStyle = {
    color: '#ffffff',
    size: 50,
    shape: 'rectangle'
};

// 설정
const CONFIG = {
    // Grid & Canvas
    gridSize: 20,
    minZoom: 0.1,
    maxZoom: 3,
    zoomFactor: 0.9,
    
    // History
    maxHistory: 50,
    
    // Node defaults
    defaultNodeColor: '#ffffff',
    defaultNodeSize: 50,
    defaultNodeShape: 'rectangle',
    
    // Connection
    connectionThreshold: 5,
    connectionColor: '#bbbbbb',
    connectionWidth: 2,
    
    // Visual effects
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowBlur: 4,
    gridColor: '#f5f5f5',
    
    // UI sizing
    fitPadding: 80,
    mobileHeaderPadding: 60,
    sidebarWidth: 300,
    quickActionBarWidth: 52,
    
    // Touch & Gestures
    doubleTapDelay: 400,
    longPressDelay: 500,
    touchMoveThreshold: 10,
    
    // Timing
    resizeDebounce: 250,
    sidebarTransition: 350
};
