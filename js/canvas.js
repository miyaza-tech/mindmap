// 캔버스 관련 함수들

// 캔버스 크기 조정
function resizeCanvas() {
    if (!canvas || !ctx) {
        console.warn('Canvas not initialized yet');
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // 캔버스 크기가 실제로 변경된 경우에만 캐시 무효화
    if (oldWidth !== canvas.width || oldHeight !== canvas.height) {
        clearNodeCache();
    }
    
    drawCanvas();
}

// 캔버스 그리기
function drawCanvas() {
    if (!canvas || !ctx) {
        console.warn('Canvas not initialized yet');
        return;
    }
    
    // 다크모드에 따라 캔버스 배경색 설정
    const isDarkMode = document.body.classList.contains('dark-mode');
    const canvasBgColor = isDarkMode ? '#252525' : '#ffffff';
    
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(zoom, zoom);
    
    // 그리드 그리기
    if (showGrid) {
        drawGrid();
    }
    
    // 연결선 그리기
    connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (fromNode && toNode) {
            drawConnection(fromNode, toNode);
        }
    });
    
    // 우클릭 드래그 중인 임시 연결선
    if (isRightDragging && connectingFromNode) {
        drawTempConnection();
    }
    
    // 노드 그리기
    nodes.forEach(node => {
        drawNode(node);
    });
    
    // 선택된 노드 하이라이트
    if (selectedNodes.length > 0) {
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        
        selectedNodes.forEach(node => {
            const width = node.width;
            const height = node.height;
            
            if (node.shape === 'circle') {
                const radius = Math.min(width, height) / 2;
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius + 3, 0, Math.PI * 2);
                ctx.stroke();
            } else if (node.shape === 'diamond') {
                ctx.beginPath();
                ctx.moveTo(node.x, node.y - height/2 - 3);
                ctx.lineTo(node.x + width/2 + 3, node.y);
                ctx.lineTo(node.x, node.y + height/2 + 3);
                ctx.lineTo(node.x - width/2 - 3, node.y);
                ctx.closePath();
                ctx.stroke();
            } else {
                // rectangle
                ctx.strokeRect(
                    node.x - width/2 - 3,
                    node.y - height/2 - 3,
                    width + 6,
                    height + 6
                );
            }
        });
    }
    
    // 선택 영역 그리기 (Shift+드래그 중)
    if (isSelecting && selectionStart && selectionEnd) {
        const minX = Math.min(selectionStart.x, selectionEnd.x);
        const minY = Math.min(selectionStart.y, selectionEnd.y);
        const width = Math.abs(selectionEnd.x - selectionStart.x);
        const height = Math.abs(selectionEnd.y - selectionStart.y);
        
        ctx.strokeStyle = '#007bff';
        ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        ctx.fillRect(minX, minY, width, height);
        ctx.strokeRect(minX, minY, width, height);
        ctx.setLineDash([]);
    }
    
    ctx.restore();
}

// 그리드 그리기
function drawGrid() {
    // 다크모드 감지 및 그리드 색상 설정
    const isDarkMode = document.body.classList.contains('dark-mode');
    const gridColor = isDarkMode ? '#333333' : '#f5f5f5';
    const gridDotColor = isDarkMode ? '#404040' : '#e5e5e5';
    
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1 / zoom;
    
    const viewWidth = canvas.width / zoom;
    const viewHeight = canvas.height / zoom;
    const startX = Math.floor(-camera.x / zoom / gridSize) * gridSize;
    const startY = Math.floor(-camera.y / zoom / gridSize) * gridSize;
    const endX = startX + viewWidth + gridSize;
    const endY = startY + viewHeight + gridSize;
    
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
        ctx.moveTo(x, startY - gridSize);
        ctx.lineTo(x, endY + gridSize);
    }
    for (let y = startY; y <= endY; y += gridSize) {
        ctx.moveTo(startX - gridSize, y);
        ctx.lineTo(endX + gridSize, y);
    }
    ctx.stroke();
    
    // 스냅이 활성화되면 주요 그리드 포인트 표시
    if (snapToGrid) {
        ctx.fillStyle = gridDotColor;
        for (let x = startX; x <= endX; x += gridSize) {
            for (let y = startY; y <= endY; y += gridSize) {
                ctx.beginPath();
                ctx.arc(x, y, 1.5 / zoom, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// 임시 연결선 그리기
function drawTempConnection() {
    if (!connectingFromNode) return;
    
    // mousePos는 이미 스크린 좌표로 저장되어 있음
    const worldCoords = screenToWorld(mousePos.x, mousePos.y);
    
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(connectingFromNode.x, connectingFromNode.y);
    ctx.lineTo(worldCoords.x, worldCoords.y);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Fit to Screen
function fitToScreen() {
    if (nodes.length === 0) return;
    
    // 최신 캔버스 크기로 강제 업데이트
    resizeCanvas();
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
        // 노드 크기가 없으면 계산
        if (!node.width || !node.height) {
            const size = calculateNodeSize(node);
            node.width = size.width;
            node.height = size.height;
        }
        
        minX = Math.min(minX, node.x - node.width/2);
        minY = Math.min(minY, node.y - node.height/2);
        maxX = Math.max(maxX, node.x + node.width/2);
        maxY = Math.max(maxY, node.y + node.height/2);
    });
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const padding = 80;
    
    // 실제 사용 가능한 캔버스 크기
    const availableWidth = canvas.width - padding * 2;
    const availableHeight = canvas.height - padding * 2;
    
    // 콘텐츠가 너무 작으면 최소 크기 보장
    if (contentWidth < 10 || contentHeight < 10) {
        zoom = 1;
        camera.x = canvas.width / 2;
        camera.y = canvas.height / 2;
        drawCanvas();
        updateStatus('🔍 Fitted to screen');
        return;
    }
    
    // 캔버스 크기에 맞춰 줌 계산
    const scaleX = availableWidth / contentWidth;
    const scaleY = availableHeight / contentHeight;
    
    // 적절한 크기로 65% 축소
    const fitZoom = Math.min(scaleX, scaleY) * 0.65;
    
    // 최소/최대 줌 제한 적용
    zoom = Math.max(CONFIG.minZoom, Math.min(fitZoom, CONFIG.maxZoom));
    
    // 콘텐츠의 중심점 계산 (world coordinates)
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;
    
    // 캔버스 중심에 콘텐츠 중심을 배치
    camera.x = canvas.width / 2 - contentCenterX * zoom;
    camera.y = canvas.height / 2 - contentCenterY * zoom;
    
    drawCanvas();
    updateStatus('🔍 Fitted to screen');
}
