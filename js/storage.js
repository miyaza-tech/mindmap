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
    
    // 1분마다 시간 표시 업데이트
    if (typeof window.recentFilesUpdateInterval !== 'undefined') {
        clearInterval(window.recentFilesUpdateInterval);
    }
    window.recentFilesUpdateInterval = setInterval(() => {
        if (recentFiles.length > 0) {
            renderRecentFiles();
        }
    }, 60000); // 60초마다 업데이트
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
        const activeClass = (String(currentMindmapId) === String(file.id)) ? 'active' : '';
        
        return `
            <div class="recent-item ${favoriteClass} ${activeClass}" 
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
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (seconds < 10) return '지금';
    if (seconds < 60) return `${seconds}초 전`;
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hourStr = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    
    if (now.getFullYear() === year) {
        return `${month}/${day} ${hourStr}:${mins}`;
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
        
        // 같은 이름의 파일이 있는지 확인
        const existingFile = recentFiles.find(f => f.name === validatedName);
        
        let fileId;
        if (existingFile) {
            // 기존 파일 업데이트
            fileId = existingFile.id;
            existingFile.timestamp = data.timestamp;
            
            // 목록 맨 앞으로 이동 (즐겨찾기 유지)
            recentFiles = recentFiles.filter(f => f.id !== fileId);
            recentFiles.unshift(existingFile);
        } else {
            // 새 파일 생성
            fileId = Date.now().toString();
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
        }
        
        // 파일 데이터 저장
        localStorage.setItem(`mindmap_file_${fileId}`, JSON.stringify(data));
        
        // 최근 파일 목록 저장
        localStorage.setItem('mindmap_recent_files', JSON.stringify(recentFiles));
        
        // 현재 파일 이름 저장 (Export 시 사용)
        currentMindmapName = validatedName;
        
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
        });
        
        history = [];
        historyIndex = -1;
        saveState();
        
        // 노드 캐시 초기화
        clearNodeCache();
        
        // 화면 맞춤
        fitToScreen();
        
        drawCanvas();
        
        const file = recentFiles.find(f => f.id === fileId);
        const fileName = file ? file.name : '파일';
        
        // 현재 파일 ID/이름 저장 (Export 시 사용)
        currentMindmapId = fileId;
        console.log('✅ 파일 로드됨 - currentMindmapId:', currentMindmapId);
        if (file) {
            currentMindmapName = file.name;
        }
        
        // 최근 파일 목록 다시 렌더링 (선택 표시 업데이트)
        renderRecentFiles();
        
        updateStatus(`📂 "${escapeHtml(fileName)}" 로드 완료!`);
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
