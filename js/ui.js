// UI 관련 함수들

// 색상 형식 검증 (XSS 방지)
function isValidColor(color) {
    return typeof color === 'string' && /^#[0-9a-fA-F]{3,6}$/.test(color);
}

// 색상 팔레트 관리
function loadFavoriteColors() {
    try {
        const saved = localStorage.getItem('mindmap_favorite_colors');
        if (saved) {
            const parsed = JSON.parse(saved);
            // 유효한 색상 형식만 필터링 (XSS 방지)
            favoriteColors = Array.isArray(parsed) ? parsed.filter(isValidColor) : [];
        }
    } catch (error) {
        console.error('Failed to load favorite colors:', error);
        favoriteColors = [];
    }
}

function saveFavoriteColors() {
    try {
        localStorage.setItem('mindmap_favorite_colors', JSON.stringify(favoriteColors));
    } catch (error) {
        console.error('Failed to save favorite colors:', error);
    }
}

function addColorToPalette(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const color = input.value.toLowerCase();
    
    // 색상 형식 검증
    if (!isValidColor(color)) {
        updateStatus('⚠️ Invalid color format');
        return;
    }
    
    // 이미 있는 색상이면 무시
    if (favoriteColors.includes(color)) {
        updateStatus('⚠️ Already in palette');
        return;
    }
    
    // 최대 개수 체크
    if (favoriteColors.length >= MAX_FAVORITE_COLORS) {
        updateStatus('⚠️ Palette is full (max 12)');
        return;
    }
    
    favoriteColors.push(color);
    saveFavoriteColors();
    renderColorPalettes();
    updateStatus('✓ Color added to palette');
}

function removeColorFromPalette(color) {
    favoriteColors = favoriteColors.filter(c => c !== color);
    saveFavoriteColors();
    renderColorPalettes();
    updateStatus('✓ Color removed from palette');
}

function applyPaletteColor(color, inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = color;
    }
}

function renderColorPalettes() {
    const colorPalette = document.getElementById('colorPalette');
    const borderColorPalette = document.getElementById('borderColorPalette');
    const textColorPalette = document.getElementById('textColorPalette');
    
    if (!colorPalette || !textColorPalette) return;
    
    const renderPalette = (container, inputId) => {
        if (!container) return;
        if (favoriteColors.length === 0) {
            container.innerHTML = '<span style="font-size: 11px; color: #999;" data-i18n="palette.empty">자주 쓰는 색상을 추가하세요</span>';
            return;
        }
        
        container.innerHTML = favoriteColors.map(color => `
            <div class="palette-color" style="position: relative; display: inline-block;">
                <div class="palette-color-swatch" 
                     style="width: 28px; height: 28px; background-color: ${color}; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;"
                     onclick="applyPaletteColor('${color}', '${inputId}')"
                     title="${color}">
                </div>
                <button class="palette-color-remove" 
                        style="position: absolute; top: -6px; right: -6px; width: 16px; height: 16px; border-radius: 50%; background: #ff4444; color: white; border: none; font-size: 10px; line-height: 1; cursor: pointer; padding: 0;"
                        onclick="removeColorFromPalette('${color}'); event.stopPropagation();"
                        title="Remove">×</button>
            </div>
        `).join('');
    };
    
    renderPalette(colorPalette, 'editColor');
    renderPalette(borderColorPalette, 'editBorderColor');
    renderPalette(textColorPalette, 'editTextColor');
}

// 컨텍스트 메뉴 표시
function showContextMenu(x, y) {
    const menu = document.getElementById('contextMenu');
    const deleteConnectionItem = document.getElementById('deleteConnectionItem');
    const deleteItem = document.getElementById('deleteNodeItem');
    const editItem = menu.querySelector('[onclick="editNode()"]');
    
    // 다중 선택된 노드가 있는지 확인
    if (selectedNodes.length > 1) {
        // 다중 선택 시 편집 버튼 숨김
        if (editItem) {
            editItem.style.display = 'none';
        }
        
        // 다중 선택 시 텍스트 변경
        if (deleteItem) {
            const originalText = deleteItem.getAttribute('data-original-text') || deleteItem.textContent;
            if (!deleteItem.getAttribute('data-original-text')) {
                deleteItem.setAttribute('data-original-text', originalText);
            }
            deleteItem.textContent = `Delete ${selectedNodes.length} nodes`;
        }
    } else {
        // 단일 선택 시 편집 버튼 표시
        if (editItem) {
            editItem.style.display = 'block';
        }
        
        // 단일 선택 시 원래 텍스트로 복원
        if (deleteItem && deleteItem.getAttribute('data-original-text')) {
            deleteItem.textContent = deleteItem.getAttribute('data-original-text');
        }
    }
    
    // 연결이 있는지 확인
    const hasConnections = rightClickedNode && connections.some(conn => 
        conn.from === rightClickedNode.id || conn.to === rightClickedNode.id
    );
    
    deleteConnectionItem.style.display = hasConnections ? 'block' : 'none';
    
    menu.style.display = 'block';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
}

// 연결선 컨텍스트 메뉴 표시
function showConnectionContextMenu(x, y) {
    const menu = document.getElementById('connectionContextMenu');
    menu.style.display = 'block';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
}

// 모달 배경 클릭 핸들러
function handleModalBackdropClick(event, modalId) {
    // 이벤트 타겟이 모달 자체(배경)일 때만 닫기
    if (event.target.id === modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
        
        // 편집 모달인 경우 editingNode 초기화
        if (modalId === 'editModal') {
            editingNode = null;
        }
    }
}

// 편집 모달 열기
function openEditModal() {
    if (!editingNode) return;
    
    document.getElementById('editTitle').value = editingNode.title || '';
    document.getElementById('editContent').value = editingNode.content || '';
    document.getElementById('editLink').value = editingNode.link || '';
    document.getElementById('editLink2').value = editingNode.link2 || '';
    document.getElementById('editLink3').value = editingNode.link3 || '';
    document.getElementById('editColor').value = editingNode.color || '#ffffff';
    
    // 다크모드 감지하여 기본 테두리/텍스트 색상 설정
    const isDarkMode = document.body.classList.contains('dark-mode');
    const defaultBorderColor = isDarkMode ? '#555555' : '#e0e0e0';
    document.getElementById('editBorderColor').value = editingNode.borderColor || defaultBorderColor;
    
    const defaultTextColor = isDarkMode ? '#ffffff' : '#333333';
    document.getElementById('editTextColor').value = editingNode.textColor || defaultTextColor;
    
    // 색상 팔레트 렌더링
    renderColorPalettes();
    
    // 연결이 있는지 확인하여 연결 삭제 버튼 표시/숨김
    const hasConnections = connections.some(conn => 
        conn.from === editingNode.id || conn.to === editingNode.id
    );
    const deleteConnectionsBtn = document.getElementById('deleteConnectionsBtn');
    if (deleteConnectionsBtn) {
        deleteConnectionsBtn.style.display = hasConnections ? 'inline-block' : 'none';
        if (hasConnections) {
            const connectionCount = connections.filter(conn => 
                conn.from === editingNode.id || conn.to === editingNode.id
            ).length;
            const lang = getCurrentLanguage();
            const text = lang === 'ko' 
                ? `연결 삭제 (${connectionCount}개)` 
                : `Delete Connections (${connectionCount})`;
            deleteConnectionsBtn.textContent = text;
        }
    }
    
    document.getElementById('editModal').style.display = 'flex';
}

// 편집 모달 닫기
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingNode = null;
}

// 노드 편집 저장
function saveNodeEdit(event) {
    event.preventDefault();
    
    if (editingNode) {
        // ⚠️ IMPORTANT: saveState() FIRST - before modifying any node!
        saveState();
        
        try {
            const title = document.getElementById('editTitle').value;
            const content = document.getElementById('editContent').value;
            const link = document.getElementById('editLink').value;
            const link2 = document.getElementById('editLink2').value;
            const link3 = document.getElementById('editLink3').value;
            
            // 제목 검증 (필수)
            const validatedTitle = validateInput(title, {
                minLength: 1,
                maxLength: 100,
                allowSpecialChars: true,
                fieldName: '제목'
            });
            
            // 내용 검증 (선택)
            let validatedContent = '';
            if (content && content.trim()) {
                validatedContent = validateInput(content, {
                    minLength: 0,
                    maxLength: 500,
                    allowSpecialChars: true,
                    fieldName: '내용'
                });
            }
            
            // URL 검증 (선택)
            let validatedLink = '';
            if (link && link.trim()) {
                try {
                    new URL(link.trim());
                    validatedLink = link.trim();
                } catch (error) {
                    updateStatus('❌ 유효하지 않은 URL입니다');
                    return;
                }
            }
            
            // URL2 검증 (선택)
            let validatedLink2 = '';
            if (link2 && link2.trim()) {
                try {
                    new URL(link2.trim());
                    validatedLink2 = link2.trim();
                } catch (error) {
                    updateStatus('❌ 유효하지 않은 URL입니다 (Link 2)');
                    return;
                }
            }
            
            // 로컬 폴더 경로 검증 (선택)
            let validatedLink3 = '';
            if (link3 && link3.trim()) {
                validatedLink3 = link3.trim();
            }
            
            // 노드 업데이트
            editingNode.title = validatedTitle;
            editingNode.content = validatedContent;
            editingNode.link = validatedLink;
            editingNode.link2 = validatedLink2;
            editingNode.link3 = validatedLink3;
            editingNode.color = document.getElementById('editColor').value;
            editingNode.borderColor = document.getElementById('editBorderColor').value;
            editingNode.textColor = document.getElementById('editTextColor').value;
            
            // 노드 크기 캐시 무효화
            invalidateNodeCache(editingNode);
            
            // saveState는 이미 위에서 호출됨 (수정 전에)
            drawCanvas();
            closeEditModal();
            updateStatus('✅ Node updated!');
        } catch (error) {
            updateStatus(`❌ ${error.message}`);
        }
    }
}

// 노드 편집 (컨텍스트 메뉴에서)
function editNode() {
    if (rightClickedNode) {
        editingNode = rightClickedNode;
        openEditModal();
    }
    document.getElementById('contextMenu').style.display = 'none';
}

// 편집 모달에서 노드 삭제
function deleteNodeFromModal() {
    if (!editingNode) return;
    
    if (confirm(t('modal.edit.confirmDelete') || '이 노드를 삭제하시겠습니까?')) {
        // 연결된 모든 연결선 제거
        connections = connections.filter(conn => 
            conn.from !== editingNode.id && conn.to !== editingNode.id
        );
        
        // 노드 제거
        nodes = nodes.filter(node => node.id !== editingNode.id);
        
        saveState();
        drawCanvas();
        closeEditModal();
        updateStatus('✅ ' + (t('status.nodeDeleted') || 'Node deleted!'));
    }
}

// 편집 모달에서 연결 삭제
function deleteConnectionsFromModal() {
    if (!editingNode) return;
    
    const nodeConnections = connections.filter(conn => 
        conn.from === editingNode.id || conn.to === editingNode.id
    );
    
    if (nodeConnections.length === 0) {
        updateStatus('❌ ' + (t('status.noConnections') || 'No connections to delete'));
        return;
    }
    
    const lang = getCurrentLanguage();
    const confirmMsg = lang === 'ko' 
        ? `이 노드의 연결 ${nodeConnections.length}개를 삭제하시겠습니까?`
        : `Delete ${nodeConnections.length} connection(s) of this node?`;
    
    if (confirm(confirmMsg)) {
        connections = connections.filter(conn => 
            conn.from !== editingNode.id && conn.to !== editingNode.id
        );
        
        saveState();
        drawCanvas();
        
        // 연결이 없어졌으므로 버튼 숨김
        document.getElementById('deleteConnectionsBtn').style.display = 'none';
        
        updateStatus('✅ ' + (t('status.connectionsDeleted') || 'Connections deleted!'));
    }
}

// 섹션 토글
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId + 'Content');
    const icon = document.getElementById(sectionId + 'Icon');
    
    if (content && icon) {
        const isCollapsed = content.classList.contains('collapsed');
        
        if (isCollapsed) {
            // 열기
            content.classList.remove('collapsed');
            
            // 실제 내용의 높이만 계산 (margin 제외)
            const tempHeight = content.style.height;
            const tempMargin = content.style.marginTop;
            content.style.height = 'auto';
            content.style.marginTop = '0';
            const height = content.scrollHeight;
            content.style.height = tempHeight;
            content.style.marginTop = tempMargin;
            
            content.style.height = '0px';
            
            requestAnimationFrame(function() {
                content.style.height = height + 'px';
            });
            
            setTimeout(function() {
                if (!content.classList.contains('collapsed')) {
                    content.style.height = 'auto';
                }
            }, 300);
        } else {
            // 닫기
            // margin 제외한 실제 내용 높이만 사용
            const tempMargin = content.style.marginTop;
            content.style.marginTop = '0';
            const height = content.scrollHeight;
            content.style.marginTop = tempMargin;
            
            content.style.height = height + 'px';
            content.offsetHeight;
            
            content.style.height = '0px';
            content.classList.add('collapsed');
        }
        
        icon.classList.toggle('collapsed');
    }
}

// 토글 섹션 초기화
function initializeToggleSections() {
    const sections = ['controls', 'nodeStyle', 'export', 'fileManagement'];
    sections.forEach(function(sectionId) {
        const content = document.getElementById(sectionId + 'Content');
        if (content && !content.classList.contains('collapsed')) {
            // 열려있는 섹션은 height: auto로 설정
            content.style.height = 'auto';
        }
    });
}

// 모바일 사이드바 토글
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const quickActionBar = document.querySelector('.quick-action-bar');
    
    // 오버레이 생성 또는 토글
    let overlay = document.querySelector('.mobile-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.onclick = toggleMobileSidebar;
        document.body.appendChild(overlay);
    }
    
    const isActive = sidebar.classList.toggle('active');
    menuToggle.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // 사이드바가 열렸을 때 Quick Action Bar와 햄버거 버튼 숨김
    if (isActive) {
        if (quickActionBar) quickActionBar.style.opacity = '0';
        menuToggle.style.opacity = '0';
        if (quickActionBar) quickActionBar.style.pointerEvents = 'none';
        menuToggle.style.pointerEvents = 'none';
    } else {
        if (quickActionBar) quickActionBar.style.opacity = '1';
        menuToggle.style.opacity = '1';
        if (quickActionBar) quickActionBar.style.pointerEvents = 'all';
        menuToggle.style.pointerEvents = 'all';
    }
}

// 데스크톱 사이드바 토글
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    
    // 사이드바 토글 후 캔버스 리사이즈
    // transition 완료 후 리사이즈
    setTimeout(() => {
        resizeCanvas();
    }, 350);
}

// 반응형 전환 시 상태 초기화
function resetSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const quickActionBar = document.querySelector('.quick-action-bar');
    const overlay = document.querySelector('.mobile-overlay');
    
    const isMobile = window.innerWidth <= 1024;
    
    if (isMobile) {
        // 모바일로 전환: 데스크톱 collapsed 상태 제거
        sidebar.classList.remove('collapsed');
        sidebar.classList.remove('active');
        
        // 인라인 스타일 제거
        if (quickActionBar) {
            quickActionBar.style.opacity = '';
            quickActionBar.style.pointerEvents = '';
        }
        if (menuToggle) {
            menuToggle.style.opacity = '';
            menuToggle.style.pointerEvents = '';
            menuToggle.classList.remove('active');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
    } else {
        // 데스크톱으로 전환: 모바일 active 상태 제거
        sidebar.classList.remove('active');
        
        // 인라인 스타일 제거
        if (quickActionBar) {
            quickActionBar.style.opacity = '';
            quickActionBar.style.pointerEvents = '';
        }
        if (menuToggle) {
            menuToggle.style.opacity = '';
            menuToggle.style.pointerEvents = '';
            menuToggle.classList.remove('active');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
}

// 새 페이지 생성
function createNewPage() {
    if (nodes.length > 0) {
        const confirmClear = confirm('현재 작업 중인 내용을 모두 지우고 새 페이지를 만드시겠습니까?\n\n저장하지 않은 내용은 사라집니다.');
        if (!confirmClear) {
            return;
        }
    }
    
    // 상태 초기화
    saveState();
    nodes = [];
    connections = [];
    history = [];
    historyIndex = -1;
    
    // 현재 파일 정보 초기화
    currentMindmapId = null;
    currentMindmapName = null;
    localStorage.removeItem('currentMindmapId');
    localStorage.removeItem('currentMindmapName');
    
    // 카메라 초기화
    camera = { x: 0, y: 0 };
    zoom = 1;
    
    // 캔버스 다시 그리기
    drawCanvas();
    updateStatus('📄 새 페이지가 생성되었습니다');
}

// 사용자 메뉴 토글
function toggleUserMenu() {
    const menu = document.getElementById('userDropdownMenu');
    if (menu) {
        const isVisible = menu.style.display === 'block';
        menu.style.display = isVisible ? 'none' : 'block';
    }
}

// 메뉴 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('userSection');
    const dropdownMenu = document.getElementById('userDropdownMenu');
    
    if (userMenu && dropdownMenu && !userMenu.contains(event.target)) {
        dropdownMenu.style.display = 'none';
    }
});

// 다크모드 토글
function toggleDarkMode() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    
    // 아이콘 변경
    themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
    
    // localStorage에 저장
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
    
    // 기존 노드들의 기본 텍스트 색상 자동 업데이트
    nodes.forEach(node => {
        // 기본 색상(#ffffff 또는 #333333)을 사용하는 노드만 업데이트
        if (node.textColor === '#ffffff' || node.textColor === '#333333') {
            node.textColor = isDarkMode ? '#ffffff' : '#333333';
        }
    });
    
    // Canvas 다시 그리기 (그리드/연결선 색상 업데이트)
    drawCanvas();
    
    const statusMsg = isDarkMode ? '🌙 다크모드 활성화' : '☀️ 라이트모드 활성화';
    updateStatus(statusMsg);
}

// 다크모드 초기화 (main.js에서 호출됨)
function initializeDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    const themeIcon = document.getElementById('themeIcon');
    
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        if (themeIcon) {
            themeIcon.textContent = '☀️';
        }
    } else {
        if (themeIcon) {
            themeIcon.textContent = '🌙';
        }
    }
}

// 검색 기능
function handleSearchInput(event) {
    const query = event.target.value.trim().toLowerCase();
    searchQuery = query;
    
    if (query === '') {
        clearSearch();
        return;
    }
    
    // 노드 검색 (제목과 내용에서)
    searchResults = nodes.filter(node => {
        const title = (node.title || '').toLowerCase();
        const content = (node.content || '').toLowerCase();
        return title.includes(query) || content.includes(query);
    });
    
    // 검색 결과 표시
    const resultsDiv = document.getElementById('searchResults');
    const resultText = document.getElementById('searchResultText');
    
    if (searchResults.length > 0) {
        currentSearchIndex = 0;
        resultsDiv.style.display = 'flex';
        updateSearchResultText();
        navigateToSearchResult();
    } else {
        resultsDiv.style.display = 'none';
        currentSearchIndex = -1;
        drawCanvas();
    }
}

function updateSearchResultText() {
    const resultText = document.getElementById('searchResultText');
    if (searchResults.length > 0) {
        resultText.textContent = `${currentSearchIndex + 1} / ${searchResults.length}`;
    }
}

function navigateSearch(direction) {
    if (searchResults.length === 0) return;
    
    currentSearchIndex += direction;
    
    // 순환
    if (currentSearchIndex < 0) {
        currentSearchIndex = searchResults.length - 1;
    } else if (currentSearchIndex >= searchResults.length) {
        currentSearchIndex = 0;
    }
    
    updateSearchResultText();
    navigateToSearchResult();
}

function navigateToSearchResult() {
    if (searchResults.length === 0 || currentSearchIndex < 0) return;
    
    const targetNode = searchResults[currentSearchIndex];
    
    // 노드 선택
    selectedNode = targetNode;
    selectedNodes = [targetNode];
    
    // 카메라를 노드 중앙으로 이동
    const targetX = -targetNode.x * zoom + canvas.width / 2;
    const targetY = -targetNode.y * zoom + canvas.height / 2;
    
    camera.x = targetX;
    camera.y = targetY;
    
    drawCanvas();
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('searchResults');
    
    searchInput.value = '';
    searchQuery = '';
    searchResults = [];
    currentSearchIndex = -1;
    resultsDiv.style.display = 'none';
    
    drawCanvas();
}
