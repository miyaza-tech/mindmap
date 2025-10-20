// UI 관련 함수들

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
    
    // 검색 도메인 로드
    const currentDomains = editingNode.searchDomains || [];
    if (currentDomains && currentDomains.length > 0) {
        document.getElementById('editSearchDomains').value = currentDomains.join(', ');
    } else {
        document.getElementById('editSearchDomains').value = '';
    }
    
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
            
            // 검색 도메인 처리 - 완전히 새로운 배열 생성
            const domainsInput = document.getElementById('editSearchDomains').value.trim();
            
            // 💡 CRITICAL: Create completely new array for each node
            const newSearchDomains = [];
            if (domainsInput) {
                // 쉼표로 분리하고 공백 제거
                const domainStrings = domainsInput.split(',');
                for (let i = 0; i < domainStrings.length; i++) {
                    const domain = domainStrings[i].trim();
                    if (domain.length > 0) {
                        newSearchDomains.push(domain);
                    }
                }
            }
            
            // 노드 업데이트
            editingNode.title = validatedTitle;
            editingNode.content = validatedContent;
            editingNode.link = validatedLink;
            editingNode.searchDomains = newSearchDomains;
            
            // 노드 크기 캐시 무효화
            invalidateNodeCache(editingNode);
            
            // AI 추천 자동 가져오기 (검색 도메인이 설정된 경우만)
            const nodeToAnalyze = editingNode;
            const hasSearchDomains = newSearchDomains && newSearchDomains.length > 0;
            
            console.log('🎯 Checking AI trigger - hasSearchDomains:', hasSearchDomains, 'domains:', newSearchDomains);
            if (hasSearchDomains && typeof window.fetchRecommendationsForNode === 'function') {
                // AI 설정 확인
                const aiEnabled = localStorage.getItem('ai_recommendations_enabled') === 'true';
                const apiKey = localStorage.getItem('ai_api_key');
                console.log('⚙️ AI Settings - enabled:', aiEnabled, 'hasApiKey:', !!apiKey);
                
                if (aiEnabled && apiKey && apiKey.trim().length > 0) {
                    console.log('🤖 Triggering AI recommendations for:', nodeToAnalyze.title);
                    // 비동기로 실행 (UI 블로킹 방지)
                    setTimeout(() => {
                        window.fetchRecommendationsForNode(nodeToAnalyze.id);
                    }, 100);
                } else {
                    console.log('⏭️ AI skipped - disabled or no API key');
                }
            } else {
                console.log('⏭️ AI skipped - no search domains or function not available');
            }
            
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

// 리사이즈 이벤트 디바운싱
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resetSidebarState();
        resizeCanvas();
    }, 250);
});

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
