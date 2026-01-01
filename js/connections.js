// 연결선 관련 함수들

// 연결선 그리기
function drawConnection(fromNode, toNode) {
    const startPoint = getConnectionPoint(fromNode, toNode, true);
    const endPoint = getConnectionPoint(toNode, fromNode, false);
    
    // 다크모드 감지 및 연결선 색상 설정
    const isDarkMode = document.body.classList.contains('dark-mode');
    const connectionColor = isDarkMode ? '#666666' : CONFIG.connectionColor;
    
    ctx.strokeStyle = connectionColor;
    ctx.lineWidth = CONFIG.connectionWidth;
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
}

// 연결점 계산
function getConnectionPoint(node, targetNode, isStart) {
    const dx = targetNode.x - node.x;
    const dy = targetNode.y - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { x: node.x, y: node.y };
    
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    let radius;
    if (node.shape === 'circle') {
        radius = Math.min(node.width, node.height) / 2;
    } else {
        radius = Math.min(node.width, node.height) / 2;
    }
    
    return {
        x: node.x + unitX * radius,
        y: node.y + unitY * radius
    };
}

// 연결선 위치 확인
function getConnectionAt(x, y) {
    const threshold = CONFIG.connectionThreshold;
    
    for (let conn of connections) {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        
        if (!fromNode || !toNode) continue;
        
        const startPoint = getConnectionPoint(fromNode, toNode, true);
        const endPoint = getConnectionPoint(toNode, fromNode, false);
        
        const distance = distanceToLine(x, y, startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        
        if (distance <= threshold) {
            return conn;
        }
    }
    return null;
}

// 연결선 삭제 (노드의 모든 연결)
function deleteConnection() {
    if (rightClickedNode) {
        connections = connections.filter(conn => 
            conn.from !== rightClickedNode.id && conn.to !== rightClickedNode.id
        );
        saveState();
        drawCanvas();
        updateStatus('✅ Connections deleted!');
    }
    document.getElementById('contextMenu').style.display = 'none';
}

// 특정 연결선만 삭제
function deleteConnectionOnly() {
    if (rightClickedConnection) {
        connections = connections.filter(conn => conn !== rightClickedConnection);
        saveState();
        drawCanvas();
        updateStatus('✅ Connection deleted!');
    }
    document.getElementById('connectionContextMenu').style.display = 'none';
}
