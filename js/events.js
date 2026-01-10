// 이벤트 핸들러들

// 터치 상태 변수
let touches = [];
let lastTouchDistance = 0;
let lastTouchCenter = { x: 0, y: 0 };
let touchStartTime = 0;
let lastTap = 0;
let tapTimeout = null;
let longPressTimeout = null;
let touchStartPos = { x: 0, y: 0 };
let isLongPress = false;
let isPinching = false;
let renderScheduled = false;

// 캔버스 이벤트 리스너 등록
function initializeEvents() {
    if (!canvas) {
        console.error('Canvas element not found - cannot initialize events');
        return;
    }
    
    // 마우스 이벤트
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('wheel', handleWheel);
    
    // 터치 이벤트
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    // 컨텍스트 메뉴 숨기기
    document.addEventListener('click', hideContextMenus);
    document.addEventListener('touchstart', hideContextMenus);
    
    // 키보드 이벤트
    document.addEventListener('keydown', handleKeyDown);
}

// 마우스 다운 이벤트
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldCoords = screenToWorld(screenX, screenY);
    
    // 링크 아이콘 클릭 확인 (좌클릭일 때만)
    if (e.button === 0) {
        const linkNode = checkLinkIconClick(worldCoords.x, worldCoords.y);
        if (linkNode) {
            e.preventDefault();
            openLink(linkNode.link);
            return;
        }
        
        const link2Node = checkLink2IconClick(worldCoords.x, worldCoords.y);
        if (link2Node) {
            e.preventDefault();
            openLink(link2Node.link2);
            return;
        }
        
        const link3Node = checkLink3IconClick(worldCoords.x, worldCoords.y);
        if (link3Node) {
            e.preventDefault();
            openLocalFolder(link3Node.link3);
            return;
        }
    }
    
    const clickedNode = getNodeAt(worldCoords.x, worldCoords.y);
    
    if (e.button === 0) { // 좌클릭
        if (e.shiftKey && !clickedNode) {
            // Shift + 드래그로 영역 선택 시작
            isSelecting = true;
            selectionStart.x = worldCoords.x;
            selectionStart.y = worldCoords.y;
            selectionEnd.x = worldCoords.x;
            selectionEnd.y = worldCoords.y;
            canvas.style.cursor = 'crosshair';
        } else if (clickedNode) {
            if (e.ctrlKey || e.metaKey) {
                // Ctrl/Cmd + 클릭: 다중 선택 토글
                const index = selectedNodes.indexOf(clickedNode);
                if (index > -1) {
                    selectedNodes.splice(index, 1);
                } else {
                    selectedNodes.push(clickedNode);
                }
                selectedNode = clickedNode;
                drawCanvas();
            } else {
                // 일반 클릭
                if (!selectedNodes.includes(clickedNode)) {
                    selectedNodes = [clickedNode];
                }
                selectedNode = clickedNode;
                isDragging = true;
                dragOffset.x = worldCoords.x - clickedNode.x;
                dragOffset.y = worldCoords.y - clickedNode.y;
                canvas.style.cursor = 'grabbing';
            }
        } else {
            // 빈 공간 클릭: 캔버스 팬 시작 또는 선택 해제
            if (e.spaceKey) {
                isMiddleDragging = true;
                middleDragStart.x = screenX;
                middleDragStart.y = screenY;
                cameraStart.x = camera.x;
                cameraStart.y = camera.y;
                canvas.style.cursor = 'grabbing';
            } else {
                selectedNodes = [];
                selectedNode = null;
                drawCanvas();
            }
        }
    } else if (e.button === 1) { // 휠 클릭 (가운데 버튼)
        e.preventDefault();
        isMiddleDragging = true;
        middleDragStart.x = screenX;
        middleDragStart.y = screenY;
        cameraStart.x = camera.x;
        cameraStart.y = camera.y;
        canvas.style.cursor = 'grabbing';
    } else if (e.button === 2) { // 우클릭
        e.preventDefault();
        
        // 연결선 우클릭 확인
        const clickedConnection = getConnectionAt(worldCoords.x, worldCoords.y);
        if (clickedConnection) {
            rightClickedConnection = clickedConnection;
            showConnectionContextMenu(e.clientX, e.clientY);
            return;
        }
        
        if (clickedNode) {
            connectingFromNode = clickedNode;
            isRightDragging = true;
            canvas.style.cursor = 'crosshair';
        }
    }
}

// 마우스 이동 이벤트
function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldCoords = screenToWorld(screenX, screenY);
    
    // mousePos 업데이트 (연결선 그리기용)
    mousePos.x = screenX;
    mousePos.y = screenY;
    
    if (isSelecting) {
        // 영역 선택 중
        selectionEnd.x = worldCoords.x;
        selectionEnd.y = worldCoords.y;
        drawCanvas();
    } else if (isDragging && selectedNodes.length > 0) {
        // 선택된 모든 노드 드래그 이동
        const newX = worldCoords.x - dragOffset.x;
        const newY = worldCoords.y - dragOffset.y;
        const deltaX = newX - selectedNode.x;
        const deltaY = newY - selectedNode.y;
        
        selectedNodes.forEach(node => {
            if (snapToGrid) {
                const snapped = snapToGridPoint(node.x + deltaX, node.y + deltaY);
                node.x = snapped.x;
                node.y = snapped.y;
            } else {
                node.x += deltaX;
                node.y += deltaY;
            }
        });
        drawCanvas();
    } else if (isMiddleDragging) {
        const dx = screenX - middleDragStart.x;
        const dy = screenY - middleDragStart.y;
        camera.x = cameraStart.x + dx;
        camera.y = cameraStart.y + dy;
        drawCanvas();
    } else if (isRightDragging) {
        drawCanvas();
    } else if (!isDragging && !isMiddleDragging && !isRightDragging) {
        // 마우스 호버 시 커서 변경
        const hoveredNode = getNodeAt(worldCoords.x, worldCoords.y);
        if (hoveredNode) {
            canvas.style.cursor = 'grab';
        } else {
            canvas.style.cursor = 'default';
        }
    }
}

// 마우스 업 이벤트
function handleMouseUp(e) {
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldCoords = screenToWorld(screenX, screenY);
    
    if (isSelecting) {
        // 영역 선택 종료
        isSelecting = false;
        const minX = Math.min(selectionStart.x, selectionEnd.x);
        const maxX = Math.max(selectionStart.x, selectionEnd.x);
        const minY = Math.min(selectionStart.y, selectionEnd.y);
        const maxY = Math.max(selectionStart.y, selectionEnd.y);
        
        selectedNodes = nodes.filter(node => {
            return node.x >= minX && node.x <= maxX && 
                   node.y >= minY && node.y <= maxY;
        });
        
        canvas.style.cursor = 'default';
        drawCanvas();
    } else if (isDragging) {
        isDragging = false;
        selectedNode = null;
        canvas.style.cursor = 'default';
        saveState();
    } else if (isMiddleDragging) {
        isMiddleDragging = false;
        canvas.style.cursor = 'default';
    } else if (isRightDragging) {
        const targetNode = getNodeAt(worldCoords.x, worldCoords.y);
        
        if (targetNode && targetNode !== connectingFromNode) {
            // 중복 연결 확인
            const existingConnection = connections.find(c => 
                (c.from === connectingFromNode.id && c.to === targetNode.id) ||
                (c.from === targetNode.id && c.to === connectingFromNode.id)
            );
            
            if (!existingConnection) {
                connections.push({
                    from: connectingFromNode.id,
                    to: targetNode.id
                });
                saveState();
                updateStatus('🔗 Connection created!');
            } else {
                updateStatus('⚠️ Connection already exists');
            }
        }
        
        isRightDragging = false;
        connectingFromNode = null;
        canvas.style.cursor = 'default';
        drawCanvas();
    }
}

// 더블클릭 이벤트
function handleDoubleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldCoords = screenToWorld(screenX, screenY);
    const clickedNode = getNodeAt(worldCoords.x, worldCoords.y);
    
    if (clickedNode) {
        editingNode = clickedNode;
        openEditModal();
    } else {
        createNodeAt(worldCoords.x, worldCoords.y);
    }
}

// 컨텍스트 메뉴 이벤트
function handleContextMenu(e) {
    e.preventDefault();
    
    if (isRightDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldCoords = screenToWorld(screenX, screenY);
    const clickedNode = getNodeAt(worldCoords.x, worldCoords.y);
    
    if (clickedNode) {
        // 클릭한 노드가 이미 선택된 노드 중 하나가 아니면 새로 선택
        if (!selectedNodes.includes(clickedNode)) {
            selectedNodes = [clickedNode];
        }
        rightClickedNode = clickedNode;
        showContextMenu(e.clientX, e.clientY);
    }
}

// 마우스 휠 이벤트 (줌)
function handleWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? CONFIG.zoomFactor : 1 / CONFIG.zoomFactor;
    zoom *= zoomFactor;
    zoom = Math.max(CONFIG.minZoom, Math.min(CONFIG.maxZoom, zoom));
    drawCanvas();
}

// 컨텍스트 메뉴 숨기기
function hideContextMenus() {
    document.getElementById('contextMenu').style.display = 'none';
    document.getElementById('connectionContextMenu').style.display = 'none';
    const fileMenu = document.getElementById('fileItemMenu');
    if (fileMenu) {
        fileMenu.style.display = 'none';
    }
}

// 터치 이벤트 핸들러
function handleTouchStart(e) {
    e.preventDefault();
    touches = Array.from(e.touches);
    touchStartTime = Date.now();
    
    if (touches.length === 1) {
        const touch = touches[0];
        const rect = canvas.getBoundingClientRect();
        touchStartPos.x = touch.clientX - rect.left;
        touchStartPos.y = touch.clientY - rect.top;
        
        // 더블탭 감지
        const now = Date.now();
        const timeSinceLastTap = now - lastTap;
        
        if (timeSinceLastTap < 400 && timeSinceLastTap > 0) {
            // 더블탭 감지됨
            if (longPressTimeout) {
                clearTimeout(longPressTimeout);
                longPressTimeout = null;
            }
            handleDoubleTap(touch);
            lastTap = 0;
            return;
        } else {
            lastTap = now;
        }
        
        // 롱 프레스 타이머 시작 (연결선 생성용)
        isLongPress = false;
        longPressTimeout = setTimeout(() => {
            const worldCoords = screenToWorld(touchStartPos.x, touchStartPos.y);
            const node = getNodeAt(worldCoords.x, worldCoords.y);
            
            if (node) {
                isLongPress = true;
                
                // 진동 피드백 (지원되는 경우)
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                
                // 연결 모드 시작 - 드래그 중지
                isDragging = false;
                selectedNode = null;
                connectingFromNode = node;
                isRightDragging = true;
                canvas.style.cursor = 'crosshair';
                updateStatus('🔗 ' + (getCurrentLanguage() === 'ko' ? '연결할 노드로 드래그하세요...' : 'Drag to connect...'));
                scheduleRender();
            }
        }, 500);
        
        // 싱글 터치 시작
        handleSingleTouchStart(touch);
    } else if (touches.length === 2) {
        // 두 손가락: 영역 선택 또는 핀치 줌
        const touch1 = touches[0];
        const touch2 = touches[1];
        const rect = canvas.getBoundingClientRect();
        const screenX1 = touch1.clientX - rect.left;
        const screenY1 = touch1.clientY - rect.top;
        const screenX2 = touch2.clientX - rect.left;
        const screenY2 = touch2.clientY - rect.top;
        const worldCoords1 = screenToWorld(screenX1, screenY1);
        const worldCoords2 = screenToWorld(screenX2, screenY2);
        
        // 두 손가락이 노드 없는 곳에 있으면 영역 선택 모드
        const node1 = getNodeAt(worldCoords1.x, worldCoords1.y);
        const node2 = getNodeAt(worldCoords2.x, worldCoords2.y);
        
        if (!node1 && !node2) {
            // 영역 선택 모드
            isSelecting = true;
            selectionStart = worldCoords1;
            selectionEnd = worldCoords2;
            isPinching = false;
            
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        } else {
            // 핀치 줌 시작
            isPinching = true;
            isSelecting = false;
        }
        
        lastTouchDistance = getTouchDistance(touches[0], touches[1]);
        lastTouchCenter = getTouchCenter(touches[0], touches[1]);
        
        // 모든 드래그 상태 초기화
        if (longPressTimeout) {
            clearTimeout(longPressTimeout);
            longPressTimeout = null;
        }
        isDragging = false;
        isRightDragging = false;
        isLongPress = false;
        selectedNode = null;
        connectingFromNode = null;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    touches = Array.from(e.touches);
    
    // 이동 거리 감지 (땑 프레스 취소용)
    if (touches.length === 1 && longPressTimeout) {
        const touch = touches[0];
        const rect = canvas.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        const distance = Math.sqrt(
            Math.pow(currentX - touchStartPos.x, 2) + 
            Math.pow(currentY - touchStartPos.y, 2)
        );
        
        // 10px 이상 이동하면 렁 프레스 취소
        if (distance > 10) {
            clearTimeout(longPressTimeout);
            longPressTimeout = null;
        }
    }
    
    if (touches.length === 1 && !isPinching) {
        // 싱글 터치 이동
        handleSingleTouchMove(touches[0]);
    } else if (touches.length === 2) {
        if (isSelecting) {
            // 영역 선택 업데이트
            const touch1 = touches[0];
            const touch2 = touches[1];
            const rect = canvas.getBoundingClientRect();
            const screenX1 = touch1.clientX - rect.left;
            const screenY1 = touch1.clientY - rect.top;
            const screenX2 = touch2.clientX - rect.left;
            const screenY2 = touch2.clientY - rect.top;
            const worldCoords1 = screenToWorld(screenX1, screenY1);
            const worldCoords2 = screenToWorld(screenX2, screenY2);
            
            selectionStart = worldCoords1;
            selectionEnd = worldCoords2;
            scheduleRender();
        } else if (isPinching) {
            // 핀치 줌
            handlePinchZoom(touches[0], touches[1]);
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    
    // 렁 프레스 타이머 정리
    if (longPressTimeout) {
        clearTimeout(longPressTimeout);
        longPressTimeout = null;
    }
    
    if (e.touches.length === 0) {
        // 모든 터치 종료
        const touchDuration = Date.now() - touchStartTime;
        
        // 영역 선택 완료
        if (isSelecting) {
            const minX = Math.min(selectionStart.x, selectionEnd.x);
            const maxX = Math.max(selectionStart.x, selectionEnd.x);
            const minY = Math.min(selectionStart.y, selectionEnd.y);
            const maxY = Math.max(selectionStart.y, selectionEnd.y);
            
            selectedNodes = nodes.filter(node => 
                node.x >= minX && node.x <= maxX && 
                node.y >= minY && node.y <= maxY
            );
            
            isSelecting = false;
            isMultiSelectMode = selectedNodes.length > 0;
            
            if (navigator.vibrate && selectedNodes.length > 0) {
                navigator.vibrate(50);
            }
            
            const lang = getCurrentLanguage();
            if (selectedNodes.length > 0) {
                updateStatus(`✅ ${selectedNodes.length} ${lang === 'ko' ? '개 노드 선택됨' : 'nodes selected'}`);
            }
            
            drawCanvas();
            return;
        }
        
        // 연결선 생성 완료
        if (isRightDragging && connectingFromNode) {
            const touch = touches[0] || e.changedTouches[0];
            if (touch) {
                const rect = canvas.getBoundingClientRect();
                const screenX = touch.clientX - rect.left;
                const screenY = touch.clientY - rect.top;
                const worldCoords = screenToWorld(screenX, screenY);
                const targetNode = getNodeAt(worldCoords.x, worldCoords.y);
                
                if (targetNode && targetNode !== connectingFromNode) {
                    const existingConnection = connections.find(conn => 
                        (conn.from === connectingFromNode.id && conn.to === targetNode.id) ||
                        (conn.from === targetNode.id && conn.to === connectingFromNode.id)
                    );
                    
                    if (!existingConnection) {
                        saveState();
                        connections.push({
                            from: connectingFromNode.id,
                            to: targetNode.id
                        });
                        const lang = getCurrentLanguage();
                        updateStatus('✅ ' + (lang === 'ko' ? '연결되었습니다!' : 'Connected!'));
                    } else {
                        const lang = getCurrentLanguage();
                        updateStatus('⚠️ ' + (lang === 'ko' ? '이미 연결되어 있습니다' : 'Already connected'));
                    }
                } else if (!targetNode) {
                    const lang = getCurrentLanguage();
                    updateStatus('❌ ' + (lang === 'ko' ? '연결 취소됨' : 'Connection cancelled'));
                }
            }
        }
        
        // 드래그 종료 시 상태 저장
        if (isDragging && selectedNode) {
            saveState();
        }
        
        // 모든 상태 초기화
        isDragging = false;
        isRightDragging = false;
        isMiddleDragging = false;
        isLongPress = false;
        isPinching = false;
        selectedNode = null;
        connectingFromNode = null;
        canvas.style.cursor = 'default';
        drawCanvas();
    } else {
        // 한 손가락만 떨어진 경우 (핀치 종료)
        isPinching = false;
    }
    
    touches = Array.from(e.touches);
}

// 싱글 터치 시작
function handleSingleTouchStart(touch) {
    const rect = canvas.getBoundingClientRect();
    const screenX = touch.clientX - rect.left;
    const screenY = touch.clientY - rect.top;
    const worldCoords = screenToWorld(screenX, screenY);
    
    // 링크 아이콘 클릭 확인
    const linkNode = checkLinkIconClick(worldCoords.x, worldCoords.y);
    if (linkNode) {
        openLink(linkNode.link);
        return;
    }
    
    const link2Node = checkLink2IconClick(worldCoords.x, worldCoords.y);
    if (link2Node) {
        openLink(link2Node.link2);
        return;
    }
    
    const link3Node = checkLink3IconClick(worldCoords.x, worldCoords.y);
    if (link3Node) {
        openLocalFolder(link3Node.link3);
        return;
    }
    
    const clickedNode = getNodeAt(worldCoords.x, worldCoords.y);
    
    if (clickedNode) {
        // 다중 선택 모드에서 노드 탭: 선택 토글
        if (isMultiSelectMode) {
            const index = selectedNodes.indexOf(clickedNode);
            if (index > -1) {
                selectedNodes.splice(index, 1);
            } else {
                selectedNodes.push(clickedNode);
            }
            
            if (selectedNodes.length === 0) {
                isMultiSelectMode = false;
            }
            
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
            
            drawCanvas();
            return;
        }
        
        // 선택된 노드 중 하나를 터치한 경우
        if (!selectedNodes.includes(clickedNode)) {
            selectedNodes = [clickedNode];
        }
        
        selectedNode = clickedNode;
        isDragging = true;
        dragOffset.x = worldCoords.x - clickedNode.x;
        dragOffset.y = worldCoords.y - clickedNode.y;
    } else {
        // 빈 공간 터치 - 선택 해제 또는 팬 시작
        if (isMultiSelectMode) {
            selectedNodes = [];
            isMultiSelectMode = false;
            drawCanvas();
        } else {
            isMiddleDragging = true;
            middleDragStart.x = screenX;
            middleDragStart.y = screenY;
            cameraStart.x = camera.x;
            cameraStart.y = camera.y;
        }
    }
}

// 싱글 터치 이동
function handleSingleTouchMove(touch) {
    const rect = canvas.getBoundingClientRect();
    const screenX = touch.clientX - rect.left;
    const screenY = touch.clientY - rect.top;
    const worldCoords = screenToWorld(screenX, screenY);
    
    if (isRightDragging && connectingFromNode && !isPinching) {
        // 연결선 그리는 중 - 롱프레스 후 드래그
        mousePos.x = screenX;
        mousePos.y = screenY;
        scheduleRender();
    } else if (isDragging && selectedNode && !isPinching && !isLongPress) {
        // 노드 드래그 이동 (롱프레스가 아닐 때만)
        const newX = worldCoords.x - dragOffset.x;
        const newY = worldCoords.y - dragOffset.y;
        const deltaX = newX - selectedNode.x;
        const deltaY = newY - selectedNode.y;
        
        // 선택된 모든 노드를 함께 이동
        if (selectedNodes.length > 0) {
            selectedNodes.forEach(node => {
                if (snapToGrid) {
                    const snapped = snapToGridPoint(node.x + deltaX, node.y + deltaY);
                    node.x = snapped.x;
                    node.y = snapped.y;
                } else {
                    node.x += deltaX;
                    node.y += deltaY;
                }
            });
        } else {
            if (snapToGrid) {
                const snapped = snapToGridPoint(newX, newY);
                selectedNode.x = snapped.x;
                selectedNode.y = snapped.y;
            } else {
                selectedNode.x = newX;
                selectedNode.y = newY;
            }
        }
        scheduleRender();
    } else if (isMiddleDragging && !isPinching) {
        const dx = screenX - middleDragStart.x;
        const dy = screenY - middleDragStart.y;
        camera.x = cameraStart.x + dx;
        camera.y = cameraStart.y + dy;
        scheduleRender();
    }
}

// 더블탭 처리
function handleDoubleTap(touch) {
    // 탭 타임아웃 정리
    if (tapTimeout) {
        clearTimeout(tapTimeout);
        tapTimeout = null;
    }
    
    const rect = canvas.getBoundingClientRect();
    const screenX = touch.clientX - rect.left;
    const screenY = touch.clientY - rect.top;
    const worldCoords = screenToWorld(screenX, screenY);
    
    // AI 알림 아이콘 클릭 확인
    const notificationNode = checkNotificationIconClick(worldCoords.x, worldCoords.y);
    if (notificationNode) {
        if (typeof showRecommendationsModal === 'function') {
            showRecommendationsModal(notificationNode);
        }
        return;
    }
    
    // 링크 아이콘 클릭 확인
    const linkNode = checkLinkIconClick(worldCoords.x, worldCoords.y);
    if (linkNode) {
        openLink(linkNode.link);
        return;
    }
    
    const link2Node = checkLink2IconClick(worldCoords.x, worldCoords.y);
    if (link2Node) {
        openLink(link2Node.link2);
        return;
    }
    
    const link3Node = checkLink3IconClick(worldCoords.x, worldCoords.y);
    if (link3Node) {
        openLocalFolder(link3Node.link3);
        return;
    }
    
    const clickedNode = getNodeAt(worldCoords.x, worldCoords.y);
    
    if (clickedNode) {
        // 노드 편집
        editingNode = clickedNode;
        openEditModal();
    } else {
        // 새 노드 생성
        saveState();
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newNode = {
            id: 'node_' + Date.now(),
            x: snapToGrid ? snapToGridPoint(worldCoords.x, worldCoords.y).x : worldCoords.x,
            y: snapToGrid ? snapToGridPoint(worldCoords.x, worldCoords.y).y : worldCoords.y,
            title: 'New Node',
            content: '',
            width: 0,
            height: 0,
            color: currentNodeStyle.color,
            textColor: isDarkMode ? '#ffffff' : '#333333',
            shape: currentNodeStyle.shape,
            link: '',
            link2: '',
            link3: '',
            linkIconBounds: null,
            link2IconBounds: null,
            link3IconBounds: null
        };
        nodes.push(newNode);
        scheduleRender();
        updateStatus('✓ Node created');
    }
}

// 핀치 줌 처리
function handlePinchZoom(touch1, touch2) {
    const currentDistance = getTouchDistance(touch1, touch2);
    const currentCenter = getTouchCenter(touch1, touch2);
    
    // 줌 계산
    if (lastTouchDistance > 0) {
        const zoomFactor = currentDistance / lastTouchDistance;
        const newZoom = zoom * zoomFactor;
        
        if (newZoom >= CONFIG.minZoom && newZoom <= CONFIG.maxZoom) {
            // 중심점 기준으로 줌
            const rect = canvas.getBoundingClientRect();
            const screenX = currentCenter.x - rect.left;
            const screenY = currentCenter.y - rect.top;
            const worldBefore = screenToWorld(screenX, screenY);
            
            zoom = newZoom;
            
            const worldAfter = screenToWorld(screenX, screenY);
            camera.x += (worldAfter.x - worldBefore.x) * zoom;
            camera.y += (worldAfter.y - worldBefore.y) * zoom;
            
            scheduleRender();
        }
    }
    
    lastTouchDistance = currentDistance;
    lastTouchCenter = currentCenter;
}

// 두 터치 포인트 간 거리 계산
function getTouchDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// 두 터치 포인트의 중심점 계산
function getTouchCenter(touch1, touch2) {
    return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
    };
}

// 성능 최적화: requestAnimationFrame을 사용한 렌더링 스케줄링
function scheduleRender() {
    if (!renderScheduled) {
        renderScheduled = true;
        requestAnimationFrame(() => {
            drawCanvas();
            renderScheduled = false;
        });
    }
}

// 키보드 이벤트 핸들러
function handleKeyDown(e) {
    // 입력 필드나 텍스트 영역에서는 무시
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Ctrl+Z: 실행취소
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
    }
    
    // Ctrl+Y 또는 Ctrl+Shift+Z: 다시실행
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
        return;
    }
    
    // Delete 또는 Backspace: 선택된 노드 삭제
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodes.length > 0) {
        e.preventDefault();
        
        // 선택된 노드들 삭제
        selectedNodes.forEach(node => {
            const index = nodes.indexOf(node);
            if (index > -1) {
                deleteNode(node);
            }
        });
        
        // 선택 초기화
        selectedNodes = [];
        
        // 히스토리 저장 및 재렌더링
        saveHistory();
        drawCanvas();
    }
    
    // Escape: 선택 해제
    if (e.key === 'Escape' && selectedNodes.length > 0) {
        e.preventDefault();
        selectedNodes = [];
        drawCanvas();
    }
    
    // Ctrl+A: 모든 노드 선택
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        selectedNodes = [...nodes];
        drawCanvas();
    }
}
