// Supabase 클라우드 저장소 함수들

// 클라우드에서 마인드맵 목록 로드
async function loadCloudMindmaps() {
    if (!currentUser) {
        updateStatus('❌ 로그인이 필요합니다');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('mindmaps')
            .select('*')
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        renderCloudMindmaps(data || []);
    } catch (error) {
        console.error('Load cloud mindmaps error:', error);
        updateStatus('❌ 파일 목록 로드 실패');
    }
}

// 클라우드 마인드맵 목록 렌더링
function renderCloudMindmaps(mindmaps) {
    const container = document.getElementById('recentItems');
    
    if (!container) return;
    
    if (mindmaps.length === 0) {
        container.innerHTML = '<div class="recent-items-empty">저장된 파일이 없습니다</div>';
        return;
    }
    
    // 즐겨찾기가 먼저, 그 다음 최신순
    const sortedMindmaps = [...mindmaps].sort((a, b) => {
        if (a.is_favorite && !b.is_favorite) return -1;
        if (!a.is_favorite && b.is_favorite) return 1;
        return new Date(b.updated_at) - new Date(a.updated_at);
    });
    
    const html = sortedMindmaps.map(mindmap => {
        const escapedName = escapeHtml(mindmap.name);
        const escapedDate = escapeHtml(formatDate(mindmap.updated_at));
        const escapedId = escapeHtml(mindmap.id);
        const favoriteClass = mindmap.is_favorite ? 'favorite' : '';
        
        return `
            <div class="recent-item ${favoriteClass}" 
                 data-id="${escapedId}"
                 onclick="loadCloudMindmap('${escapedId}', event)">
                <div class="recent-item-content">
                    <div class="recent-item-title">${escapedName} · ${escapedDate}</div>
                </div>
                <div class="recent-item-menu" onclick="showCloudFileMenu(event, '${escapedId}')">⋯</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// 클라우드에 마인드맵 저장
async function saveToCloud() {
    if (!currentUser) {
        updateStatus('❌ 로그인이 필요합니다');
        openAuthModal();
        return;
    }
    
    try {
        const data = {
            nodes: deepClone(nodes),
            connections: deepClone(connections)
        };
        
        // 현재 파일이 있으면 덮어쓰기
        if (currentMindmapId) {
            const { error } = await supabase
                .from('mindmaps')
                .update({
                    data: data,
                    updated_at: new Date().toISOString()
                })
                .eq('id', currentMindmapId);
            
            if (error) throw error;
            
            updateStatus(`💾 "${currentMindmapName}" 저장 완료!`);
            await loadCloudMindmaps();
        } else {
            // 새 파일이면 이름 입력받기
            const name = prompt('파일 이름을 입력하세요:', '새 마인드맵');
            
            if (!name) {
                updateStatus('❌ 저장 취소됨');
                return;
            }
            
            // 입력값 검증
            const validatedName = validateInput(name, {
                minLength: 1,
                maxLength: 50,
                allowSpecialChars: true,
                fieldName: '파일 이름'
            });
            
            const { data: insertedData, error } = await supabase
                .from('mindmaps')
                .insert([
                    {
                        user_id: currentUser.id,
                        name: validatedName,
                        data: data,
                        is_favorite: false
                    }
                ])
                .select()
                .single();
            
            if (error) throw error;
            
            // 새로 생성된 파일 정보 저장
            currentMindmapId = insertedData.id;
            currentMindmapName = validatedName;
            
            // localStorage에도 저장
            localStorage.setItem('currentMindmapId', currentMindmapId);
            localStorage.setItem('currentMindmapName', currentMindmapName);
            
            updateStatus(`💾 "${validatedName}" 클라우드에 저장 완료!`);
            await loadCloudMindmaps();
        }
    } catch (error) {
        console.error('Save to cloud error:', error);
        updateStatus('❌ 저장 실패: ' + error.message);
    }
}

// 클라우드에 마인드맵 다른 이름으로 저장
async function saveAsToCloud() {
    if (!currentUser) {
        updateStatus('❌ 로그인이 필요합니다');
        openAuthModal();
        return;
    }
    
    try {
        const name = prompt('파일 이름을 입력하세요:', '새 마인드맵');
        
        if (!name) {
            updateStatus('❌ 저장 취소됨');
            return;
        }
        
        // 입력값 검증
        const validatedName = validateInput(name, {
            minLength: 1,
            maxLength: 50,
            allowSpecialChars: true,
            fieldName: '파일 이름'
        });
        
        const data = {
            nodes: deepClone(nodes),
            connections: deepClone(connections)
        };
        
        const { data: insertedData, error } = await supabase
            .from('mindmaps')
            .insert([
                {
                    user_id: currentUser.id,
                    name: validatedName,
                    data: data,
                    is_favorite: false
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        
        // 새로 생성된 파일 정보 저장
        currentMindmapId = insertedData.id;
        currentMindmapName = validatedName;
        
        // localStorage에도 저장
        localStorage.setItem('currentMindmapId', currentMindmapId);
        localStorage.setItem('currentMindmapName', currentMindmapName);
        
        updateStatus(`💾 "${validatedName}" 다른 이름으로 저장 완료!`);
        await loadCloudMindmaps();
    } catch (error) {
        console.error('Save as to cloud error:', error);
        updateStatus('❌ 저장 실패: ' + error.message);
    }
}

// 클라우드에서 마인드맵 로드
async function loadCloudMindmap(mindmapId, event) {
    if (event) {
        // 메뉴 버튼 클릭 시 로드하지 않음
        if (event.target.classList.contains('recent-item-menu')) {
            return;
        }
    }
    
    if (!currentUser) {
        updateStatus('❌ 로그인이 필요합니다');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('mindmaps')
            .select('*')
            .eq('id', mindmapId)
            .single();
        
        if (error) throw error;
        
        if (!data) {
            updateStatus('❌ 파일을 찾을 수 없습니다');
            return;
        }
        
        nodes = data.data.nodes || [];
        connections = data.data.connections || [];
        
        // 현재 파일 정보 저장
        currentMindmapId = data.id;
        currentMindmapName = data.name;
        
        // localStorage에도 저장
        localStorage.setItem('currentMindmapId', currentMindmapId);
        localStorage.setItem('currentMindmapName', currentMindmapName);
        
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
        
        clearNodeCache();
        drawCanvas();
        
        const escapedName = escapeHtml(data.name);
        updateStatus(`📂 "${escapedName}" 로드 완료!`);
    } catch (error) {
        console.error('Load cloud mindmap error:', error);
        updateStatus('❌ 파일 로드 실패: ' + error.message);
    }
}

// 클라우드 파일 삭제
async function deleteCloudMindmap(mindmapId) {
    if (!currentUser) {
        updateStatus('❌ 로그인이 필요합니다');
        return;
    }
    
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('mindmaps')
            .delete()
            .eq('id', mindmapId);
        
        if (error) throw error;
        
        updateStatus('🗑️ 파일 삭제 완료');
        await loadCloudMindmaps();
    } catch (error) {
        console.error('Delete cloud mindmap error:', error);
        updateStatus('❌ 삭제 실패: ' + error.message);
    }
}

// 즐겨찾기 토글
async function toggleCloudFavorite(mindmapId) {
    if (!currentUser) {
        updateStatus('❌ 로그인이 필요합니다');
        return;
    }
    
    try {
        // 현재 상태 가져오기
        const { data: current, error: fetchError } = await supabase
            .from('mindmaps')
            .select('is_favorite')
            .eq('id', mindmapId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // 토글
        const { error: updateError } = await supabase
            .from('mindmaps')
            .update({ is_favorite: !current.is_favorite })
            .eq('id', mindmapId);
        
        if (updateError) throw updateError;
        
        updateStatus(current.is_favorite ? '⭐ 즐겨찾기 해제' : '⭐ 즐겨찾기 추가');
        await loadCloudMindmaps();
    } catch (error) {
        console.error('Toggle favorite error:', error);
        updateStatus('❌ 즐겨찾기 변경 실패');
    }
}

// 클라우드 파일 메뉴 표시
function showCloudFileMenu(event, mindmapId) {
    event.stopPropagation();
    
    selectedFileItem = mindmapId;
    
    const menu = document.getElementById('fileItemMenu');
    menu.style.display = 'block';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    
    // 즐겨찾기 버튼 텍스트 업데이트는 비동기로 처리
    updateFavoriteButtonText(mindmapId);
}

// 즐겨찾기 버튼 텍스트 업데이트
async function updateFavoriteButtonText(mindmapId) {
    try {
        const { data, error } = await supabase
            .from('mindmaps')
            .select('is_favorite')
            .eq('id', mindmapId)
            .single();
        
        if (error) throw error;
        
        const favoriteItem = document.querySelector('#fileItemMenu .context-menu-item:first-child');
        if (favoriteItem) {
            favoriteItem.textContent = data.is_favorite ? '⭐ 즐겨찾기 해제' : '⭐ 즐겨찾기';
        }
    } catch (error) {
        console.error('Update favorite button text error:', error);
    }
}

// 선택된 클라우드 파일 삭제
function deleteSelectedCloudFile() {
    if (selectedFileItem) {
        deleteCloudMindmap(selectedFileItem);
        document.getElementById('fileItemMenu').style.display = 'none';
    }
}

// 선택된 클라우드 파일 즐겨찾기 토글
function toggleSelectedCloudFavorite() {
    if (selectedFileItem) {
        toggleCloudFavorite(selectedFileItem);
        document.getElementById('fileItemMenu').style.display = 'none';
    }
}

// 기존 storage.js 함수들과 호환성 유지
function toggleFileFavorite() {
    toggleSelectedCloudFavorite();
}

function deleteFileItem() {
    deleteSelectedCloudFile();
}

function renameFileItem() {
    // TODO: 구현 예정
    updateStatus('🚧 이름 변경 기능은 곧 추가됩니다');
    document.getElementById('fileItemMenu').style.display = 'none';
}
