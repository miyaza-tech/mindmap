// 저장/불러오기 함수들

let recentFiles = [];
let selectedFileItem = null;
const MAX_RECENT_FILES = 10;

// 최근 파일 목록 로드
function loadRecentFiles() {
    try {
        const data = localStorage.getItem('mindmap_recent_files');
        if (data) {
            const parsed = safeJsonParse(data, []);
            if (Array.isArray(parsed)) {
                recentFiles = parsed;
            } else {
                logError('Load Recent Files', new Error('Invalid data format'), true);
                recentFiles = [];
            }
        }
    } catch (error) {
        logError('Load Recent Files', error, true);
        recentFiles = [];
    }
    renderRecentFiles();
}

// 최근 파일 목록 렌더링
function renderRecentFiles() {
    const container = document.getElementById('recentItems');
    if (!container) return;
    
    if (recentFiles.length === 0) {
        container.innerHTML = '<div class="recent-items-empty">저장된 파일이 없습니다</div>';
        return;
    }
    
    // 즐겨찾기가 먼저, 그 다음 최신순
    const sortedFiles = [...recentFiles].sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // XSS 방지: HTML 이스케이프 처리
    container.innerHTML = sortedFiles.map(file => {
        const escapedName = escapeHtml(file.name);
        const escapedDate = escapeHtml(formatDate(file.timestamp));
        const escapedId = escapeHtml(file.id);
        const favoriteClass = file.favorite ? 'favorite' : '';
        
        return `
            <div class="recent-item ${favoriteClass}" 
                 data-id="${escapedId}"
                 onclick="loadFileItem('${escapedId}', event)">
                <div class="recent-item-content">
                    <div class="recent-item-title">${escapedName} · ${escapedDate}</div>
                </div>
                <div class="recent-item-menu" onclick="showFileItemMenu(event, '${escapedId}')">⋯</div>
            </div>
        `;
    }).join('');
}

// 날짜 포맷팅
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '지금';
    if (minutes < 60) return `${minutes}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    
    if (now.getFullYear() === year) {
        return `${month}/${day} ${hours}:${mins}`;
    }
    return `${year}/${month}/${day}`;
}

// 마인드맵 저장
function saveMindmap() {
    try {
        const name = prompt('파일 이름을 입력하세요:', '새 마인드맵');
        
        if (!name) {
            updateStatus('❌ 저장 취소됨');
            return;
        }
        
        // 입력값 검증
        let validatedName;
        try {
            validatedName = validateInput(name, {
                minLength: 1,
                maxLength: 50,
                allowSpecialChars: true,
                fieldName: '파일 이름'
            });
        } catch (error) {
            updateStatus(`❌ ${error.message}`);
            return;
        }
        
        const data = {
            nodes: deepClone(nodes),
            connections: deepClone(connections),
            timestamp: new Date().toISOString()
        };
        
        const fileId = Date.now().toString();
        
        // 파일 데이터 저장
        localStorage.setItem(`mindmap_file_${fileId}`, JSON.stringify(data));
        
        // 최근 파일 목록에 추가
        recentFiles.unshift({
            id: fileId,
            name: validatedName,
            timestamp: data.timestamp,
            favorite: false
        });
        
        // 최대 개수 제한
        if (recentFiles.length > MAX_RECENT_FILES) {
            const removed = recentFiles.pop();
            localStorage.removeItem(`mindmap_file_${removed.id}`);
        }
        
        // 최근 파일 목록 저장
        localStorage.setItem('mindmap_recent_files', JSON.stringify(recentFiles));
        
        renderRecentFiles();
        updateStatus(`💾 "${validatedName}" 저장 완료!`);
    } catch (error) {
        logError('Save Mindmap', error, true);
        updateStatus('❌ 저장 실패');
    }
}

// 파일 항목 로드
function loadFileItem(fileId, event) {
    if (event) {
        // 메뉴 버튼 클릭 시 로드하지 않음
        if (event.target.classList.contains('recent-item-menu')) {
            return;
        }
    }
    
    try {
        const data = localStorage.getItem(`mindmap_file_${fileId}`);
        if (!data) {
            updateStatus('❌ 파일을 찾을 수 없습니다');
            return;
        }
        
        const parsed = safeJsonParse(data);
        if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.connections)) {
            throw new Error('Invalid file format');
        }
        
        // ⚠️ IMPORTANT: Deep clone to avoid reference sharing!
        nodes = deepClone(parsed.nodes) || [];
        connections = deepClone(parsed.connections) || [];
        
        // ID가 없는 노드들에 ID 추가 및 링크 속성 초기화
        nodes.forEach(node => {
            if (!node.id) {
                node.id = Date.now() + Math.random();
            }
            if (!node.hasOwnProperty('link')) {
                node.link = '';
            }
            if (!node.hasOwnProperty('linkIconBounds')) {
                node.linkIconBounds = null;
            }
            // searchDomains 배열도 명시적으로 복사
            if (node.searchDomains && Array.isArray(node.searchDomains)) {
                node.searchDomains = [...node.searchDomains];
            } else {
                node.searchDomains = [];
            }
        });
        
        history = [];
        historyIndex = -1;
        saveState();
        
        // 노드 캐시 초기화
        clearNodeCache();
        
        drawCanvas();
        
        const file = recentFiles.find(f => f.id === fileId);
        const fileName = file ? escapeHtml(file.name) : '파일';
        updateStatus(`📂 "${fileName}" 로드 완료!`);
    } catch (error) {
        logError('Load File Item', error, true);
        updateStatus('❌ 파일 로드 오류');
    }
}

// 파일 항목 메뉴 표시
function showFileItemMenu(event, fileId) {
    event.stopPropagation();
    
    selectedFileItem = fileId;
    
    const menu = document.getElementById('fileItemMenu');
    menu.style.display = 'block';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    
    // 즐겨찾기 상태에 따라 텍스트 변경
    const file = recentFiles.find(f => f.id === fileId);
    const favoriteItem = menu.querySelector('.context-menu-item:first-child');
    if (file && file.favorite) {
        favoriteItem.textContent = '⭐ 즐겨찾기 해제';
    } else {
        favoriteItem.textContent = '⭐ 즐겨찾기';
    }
}

// 즐겨찾기 토글
function toggleFileFavorite() {
    if (!selectedFileItem) return;
    
    const file = recentFiles.find(f => f.id === selectedFileItem);
    if (file) {
        file.favorite = !file.favorite;
        localStorage.setItem('mindmap_recent_files', JSON.stringify(recentFiles));
        renderRecentFiles();
        updateStatus(file.favorite ? '⭐ 즐겨찾기 추가됨' : '☆ 즐겨찾기 해제됨');
    }
    
    hideContextMenus();
}

// 파일 이름 변경
function renameFileItem() {
    if (!selectedFileItem) return;
    
    const file = recentFiles.find(f => f.id === selectedFileItem);
    if (!file) return;
    
    try {
        const newName = prompt('새 이름을 입력하세요:', file.name);
        
        if (!newName) {
            hideContextMenus();
            return;
        }
        
        const validatedName = validateInput(newName, {
            minLength: 1,
            maxLength: 50,
            allowSpecialChars: true,
            fieldName: '파일 이름'
        });
        
        file.name = validatedName;
        localStorage.setItem('mindmap_recent_files', JSON.stringify(recentFiles));
        renderRecentFiles();
        updateStatus('✏️ 이름 변경됨');
    } catch (error) {
        updateStatus(`❌ ${error.message}`);
    }
    
    hideContextMenus();
}

// 파일 삭제
function deleteFileItem() {
    if (!selectedFileItem) return;
    
    const file = recentFiles.find(f => f.id === selectedFileItem);
    if (!file) return;
    
    if (confirm(`"${file.name}" 파일을 삭제하시겠습니까?`)) {
        // 파일 데이터 삭제
        localStorage.removeItem(`mindmap_file_${selectedFileItem}`);
        
        // 최근 파일 목록에서 제거
        recentFiles = recentFiles.filter(f => f.id !== selectedFileItem);
        localStorage.setItem('mindmap_recent_files', JSON.stringify(recentFiles));
        
        renderRecentFiles();
        updateStatus('🗑️ 파일 삭제됨');
    }
    
    hideContextMenus();
}

// 마인드맵 초기화
function clearMindmap() {
    if (confirm('정말로 모든 노드와 연결을 삭제하시겠습니까?')) {
        nodes = [];
        connections = [];
        history = [];
        historyIndex = -1;
        saveState();
        drawCanvas();
        updateStatus('🗑️ Mindmap cleared');
    }
}
