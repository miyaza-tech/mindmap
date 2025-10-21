// 노드 관련 함수들

// 노드 크기 캐시
const nodeSizeCache = new Map();

// 캐시 키 생성
function getNodeCacheKey(node) {
    return `${node.id}_${node.title}_${node.content}_${node.link}_${node.shape}`;
}

// 노드 크기 캐시 무효화
function invalidateNodeCache(node) {
    if (node && node.id) {
        // 해당 노드의 모든 캐시 키 삭제
        for (const key of nodeSizeCache.keys()) {
            if (key.startsWith(`${node.id}_`)) {
                nodeSizeCache.delete(key);
            }
        }
    }
}

// 전체 캐시 초기화
function clearNodeCache() {
    nodeSizeCache.clear();
}

// 노드 그리기
function drawNode(node) {
    // 노드 크기 캐시 확인
    const cacheKey = getNodeCacheKey(node);
    let size = nodeSizeCache.get(cacheKey);
    
    // 캐시에 없으면 계산하고 저장
    if (!size) {
        size = calculateNodeSize(node);
        nodeSizeCache.set(cacheKey, size);
    }
    
    node.width = size.width;
    node.height = size.height;
    
    const x = node.x;
    const y = node.y;
    const width = node.width;
    const height = node.height;
    
    ctx.save();
    
    // 그림자
    ctx.shadowColor = CONFIG.shadowColor;
    ctx.shadowBlur = CONFIG.shadowBlur;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    
    // 노드 배경
    ctx.fillStyle = node.color || '#ffffff';
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    if (node.shape === 'circle') {
        const radius = Math.min(width, height) / 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else if (node.shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(x, y - height/2);
        ctx.lineTo(x + width/2, y);
        ctx.lineTo(x, y + height/2);
        ctx.lineTo(x - width/2, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else {
        // rectangle
        ctx.beginPath();
        ctx.roundRect(x - width/2, y - height/2, width, height, 6);
        ctx.fill();
        ctx.stroke();
    }
    
    ctx.restore();
    
    // 텍스트 영역 계산 (도형에 따라 다르게)
    const padding = 20;
    let textAreaWidth;
    
    if (node.shape === 'circle') {
        // 원형: 내접 정사각형의 너비 사용 (지름 * 0.7)
        textAreaWidth = width * 0.7 - padding * 2;
    } else if (node.shape === 'diamond') {
        // 다이아몬드: 중앙 너비의 약 70%
        textAreaWidth = width * 0.7 - padding * 2;
    } else {
        // 사각형: 전체 너비 사용
        textAreaWidth = width - padding * 2;
    }
    
    // 제목 그리기
    const title = node.title || 'Node';
    const titleFont = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const titleLines = wrapText(title, textAreaWidth - (node.link ? 20 : 0), titleFont);
    
    ctx.fillStyle = '#333';
    ctx.font = titleFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const lineHeight = 18;
    const titleHeight = titleLines.length * lineHeight;
    const contentLines = node.content && node.content.trim() ? 
        wrapText(node.content, textAreaWidth, '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif') : [];
    const contentLineHeight = 16;
    const contentHeight = contentLines.length * contentLineHeight;
    const spacing = contentLines.length > 0 ? 4 : 0;
    const totalTextHeight = titleHeight + spacing + contentHeight;
    
    let currentY = y - totalTextHeight / 2;
    
    // 제목 렌더링
    titleLines.forEach((line, index) => {
        ctx.fillText(line, x, currentY);
        
        // 링크 아이콘을 첫 번째 라인 끝에 추가
        if (index === 0) {
            const iconSize = 12;
            const lineWidth = measureText(line, titleFont).width;
            let iconX = x + lineWidth / 2 + 6;
            const iconY = currentY + 1;
            
            // 첫 번째 링크 아이콘 (파란색)
            if (node.link && node.link.trim()) {
                // 링크 아이콘 배경
                ctx.fillStyle = '#007bff';
                ctx.beginPath();
                ctx.roundRect(iconX, iconY, iconSize, iconSize, 2);
                ctx.fill();
                
                // 링크 아이콘 (체인 모양)
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1.2;
                const centerX = iconX + iconSize/2;
                const centerY = iconY + iconSize/2;
                
                ctx.beginPath();
                ctx.arc(centerX - 2, centerY - 2, 1.5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(centerX + 2, centerY + 2, 1.5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(centerX - 1, centerY - 1);
                ctx.lineTo(centerX + 1, centerY + 1);
                ctx.stroke();
                
                // 링크 아이콘 바운딩 박스 저장
                node.linkIconBounds = {
                    x: iconX,
                    y: iconY,
                    width: iconSize,
                    height: iconSize
                };
                
                iconX += iconSize + 8; // 다음 아이콘 위치 (간격 증가)
            }
            
            // 두 번째 링크 아이콘 (초록색)
            if (node.link2 && node.link2.trim()) {
                // 링크2 아이콘 배경
                ctx.fillStyle = '#28a745';
                ctx.beginPath();
                ctx.roundRect(iconX, iconY, iconSize, iconSize, 2);
                ctx.fill();
                
                // 링크 아이콘 (체인 모양)
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1.2;
                const centerX = iconX + iconSize/2;
                const centerY = iconY + iconSize/2;
                
                ctx.beginPath();
                ctx.arc(centerX - 2, centerY - 2, 1.5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(centerX + 2, centerY + 2, 1.5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(centerX - 1, centerY - 1);
                ctx.lineTo(centerX + 1, centerY + 1);
                ctx.stroke();
                
                // 링크2 아이콘 바운딩 박스 저장
                node.link2IconBounds = {
                    x: iconX,
                    y: iconY,
                    width: iconSize,
                    height: iconSize
                };
            }
        }
        
        currentY += lineHeight;
    });
    
    // 내용 그리기
    if (contentLines.length > 0) {
        currentY += spacing;
        
        const contentFont = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        
        ctx.fillStyle = '#666';
        ctx.font = contentFont;
        
        contentLines.forEach(line => {
            ctx.fillText(line, x, currentY);
            currentY += contentLineHeight;
        });
    }
    
    // 링크 아이콘이 없다면 bounds 제거
    if (!node.link || !node.link.trim()) {
        node.linkIconBounds = null;
    }
    
    // 링크2 아이콘이 없다면 bounds 제거
    if (!node.link2 || !node.link2.trim()) {
        node.link2IconBounds = null;
    }
    
    // AI 추천 알림 아이콘 그리기
    if (node.hasNewRecommendations && node.aiRecommendations && node.aiRecommendations.length > 0) {
        const badgeSize = 20;
        const badgeX = x + width/2 - badgeSize/2;
        const badgeY = y - height/2 - badgeSize/2;
        
        // 배경 원
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 아이콘 텍스트 (AI)
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AI', badgeX + badgeSize/2, badgeY + badgeSize/2);
        
        ctx.restore();
        
        // 클릭 영역 저장
        node.notificationIconBounds = {
            x: badgeX,
            y: badgeY,
            width: badgeSize,
            height: badgeSize
        };
    } else {
        node.notificationIconBounds = null;
    }
}

// 노드 크기 계산
function calculateNodeSize(node) {
    const padding = 20;
    const minWidth = 80;
    const minHeight = 40;
    const maxWidth = 300;
    
    // 원형과 다이아몬드는 텍스트 영역이 70%이므로, 실제 필요한 너비를 역산
    const textWidthMultiplier = (node.shape === 'circle' || node.shape === 'diamond') ? 1.43 : 1; // 1 / 0.7 ≈ 1.43
    
    // 제목 크기 계산
    const titleFont = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const availableTitleWidth = (maxWidth - padding * 2) / textWidthMultiplier;
    const linkSpace = (node.link && node.link.trim()) ? 20 : 0;
    const titleLines = wrapText(node.title || 'Node', availableTitleWidth - linkSpace, titleFont);
    
    const lineHeight = 18;
    const titleHeight = titleLines.length * lineHeight;
    const maxTitleWidth = Math.max(...titleLines.map(line => 
        measureText(line, titleFont).width
    )) + linkSpace;
    
    let totalWidth = Math.max(maxTitleWidth, minWidth);
    let totalHeight = titleHeight;
    
    // 내용이 있으면 크기 추가
    if (node.content && node.content.trim()) {
        const contentFont = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const availableWidth = (maxWidth - padding * 2) / textWidthMultiplier;
        const contentLines = wrapText(node.content, availableWidth, contentFont);
        
        const contentLineHeight = 16; // 렌더링과 동일한 값 사용
        const contentHeight = contentLines.length * contentLineHeight;
        const spacing = 4;
        const maxContentWidth = Math.max(...contentLines.map(line => 
            measureText(line, contentFont).width
        ));
        
        totalWidth = Math.max(totalWidth, maxContentWidth);
        totalHeight += contentHeight + spacing; // 제목과 내용 간격
    }
    
    // 패딩 추가
    totalWidth += padding * 2;
    totalHeight += padding * 2;
    
    // 다이아몬드는 텍스트 영역 비율을 고려하여 노드 크기 증가
    if (node.shape === 'diamond') {
        totalWidth *= textWidthMultiplier;
        totalHeight *= textWidthMultiplier;
    }
    
    // 원형은 정원이어야 하므로 너비와 높이 중 큰 값으로 통일하고, 약간만 증가
    if (node.shape === 'circle') {
        const diameter = Math.max(totalWidth, totalHeight);
        // 원형은 1.1배만 증가
        totalWidth = diameter * 1.1;
        totalHeight = diameter * 1.1;
    }
    
    // 최대/최소 크기 제한
    totalWidth = Math.min(Math.max(totalWidth, minWidth), maxWidth * 1.5);
    totalHeight = Math.max(totalHeight, minHeight);
    
    return { width: totalWidth, height: totalHeight };
}

// 노드 위치 확인
function getNodeAt(x, y) {
    for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const dx = x - node.x;
        const dy = y - node.y;
        
        if (node.shape === 'circle') {
            const radius = Math.min(node.width, node.height) / 2;
            if (dx * dx + dy * dy <= radius * radius) {
                return node;
            }
        } else if (node.shape === 'diamond') {
            if (Math.abs(dx) / (node.width/2) + Math.abs(dy) / (node.height/2) <= 1) {
                return node;
            }
        } else {
            if (Math.abs(dx) <= node.width/2 && Math.abs(dy) <= node.height/2) {
                return node;
            }
        }
    }
    return null;
}

// 링크 아이콘 클릭 확인
function checkLinkIconClick(worldX, worldY) {
    for (let node of nodes) {
        if (node.linkIconBounds && node.link && node.link.trim()) {
            const bounds = node.linkIconBounds;
            if (worldX >= bounds.x && worldX <= bounds.x + bounds.width &&
                worldY >= bounds.y && worldY <= bounds.y + bounds.height) {
                return node;
            }
        }
    }
    return null;
}

// 링크2 아이콘 클릭 확인
function checkLink2IconClick(worldX, worldY) {
    for (let node of nodes) {
        if (node.link2IconBounds && node.link2 && node.link2.trim()) {
            const bounds = node.link2IconBounds;
            if (worldX >= bounds.x && worldX <= bounds.x + bounds.width &&
                worldY >= bounds.y && worldY <= bounds.y + bounds.height) {
                return node;
            }
        }
    }
    return null;
}

// AI 알림 아이콘 클릭 확인
function checkNotificationIconClick(worldX, worldY) {
    for (let node of nodes) {
        if (node.notificationIconBounds && node.hasNewRecommendations) {
            const bounds = node.notificationIconBounds;
            if (worldX >= bounds.x && worldX <= bounds.x + bounds.width &&
                worldY >= bounds.y && worldY <= bounds.y + bounds.height) {
                return node;
            }
        }
    }
    return null;
}

// 링크 열기
function openLink(url) {
    if (url && url.trim()) {
        // http:// 또는 https://가 없으면 추가
        let fullUrl = url.trim();
        if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
            fullUrl = 'https://' + fullUrl;
        }
        
        try {
            window.open(fullUrl, '_blank', 'noopener,noreferrer');
            updateStatus('🔗 Link opened!');
        } catch (error) {
            console.error('Error opening link:', error);
            updateStatus('❌ Error opening link');
        }
    }
}

// 특정 위치에 노드 생성
function createNodeAt(x, y) {
    try {
        const title = prompt('Node title:');
        if (!title) return;
        
        const validatedTitle = validateInput(title, {
            minLength: 1,
            maxLength: 100,
            allowSpecialChars: true,
            fieldName: '제목'
        });
        
        const snappedPos = snapToGridPoint(x, y);
        const node = {
            id: Date.now().toString(),
            x: snappedPos.x,
            y: snappedPos.y,
            title: validatedTitle,
            content: '',
            width: 0,
            height: 0,
            color: currentNodeStyle.color,
            shape: currentNodeStyle.shape,
            link: '',
            linkIconBounds: null,
            aiRecommendations: [],
            hasNewRecommendations: false,
            notificationIconBounds: null,
            searchDomains: [] // AI 검색에 사용할 특정 도메인 목록
        };
        nodes.push(node);
        saveState();
        drawCanvas();
        updateStatus('✅ Node created!');
    } catch (error) {
        updateStatus(`❌ ${error.message}`);
    }
}

// 랜덤 위치에 노드 추가
function addRandomNode() {
    try {
        const x = Math.random() * (canvas.width / zoom - 200) + 100 - camera.x / zoom;
        const y = Math.random() * (canvas.height / zoom - 200) + 100 - camera.y / zoom;
        
        const title = prompt('Node title:');
        if (!title) return;
        
        const validatedTitle = validateInput(title, {
            minLength: 1,
            maxLength: 100,
            allowSpecialChars: true,
            fieldName: '제목'
        });
        
        const snappedPos = snapToGridPoint(x, y);
        const node = {
            id: Date.now().toString(),
            x: snappedPos.x,
            y: snappedPos.y,
            title: validatedTitle,
            content: '',
            width: 0,
            height: 0,
            color: currentNodeStyle.color,
            shape: currentNodeStyle.shape,
            link: '',
            linkIconBounds: null
        };
        nodes.push(node);
        saveState();
        drawCanvas();
        updateStatus('✅ Node created!');
    } catch (error) {
        updateStatus(`❌ ${error.message}`);
    }
}

// 노드 복제
function duplicateNode() {
    try {
        // 다중 선택된 노드가 있으면 모두 복제, 없으면 우클릭 노드만 복제
        const nodesToDuplicate = selectedNodes.length > 0 ? selectedNodes : (rightClickedNode ? [rightClickedNode] : []);
        
        if (nodesToDuplicate.length === 0) return;
        
        const newNodes = [];
        nodesToDuplicate.forEach((node, index) => {
            const snappedPos = snapToGridPoint(
                node.x + 50 + (index * 20),
                node.y + 50 + (index * 20)
            );
            
            const newNode = deepClone(node);
            if (!newNode) {
                throw new Error('복제 실패');
            }
            
            newNode.id = (Date.now() + index).toString();
            newNode.x = snappedPos.x;
            newNode.y = snappedPos.y;
            newNode.linkIconBounds = null;
            
            nodes.push(newNode);
            newNodes.push(newNode);
        });
        
        // 새로 복제된 노드들을 선택
        selectedNodes = newNodes;
        
        saveState();
        drawCanvas();
        
        const count = nodesToDuplicate.length;
        updateStatus(`✅ ${count} node${count > 1 ? 's' : ''} duplicated!`);
    } catch (error) {
        logError('Duplicate Node', error, true);
        updateStatus('❌ 복제 실패');
    }
    document.getElementById('contextMenu').style.display = 'none';
}


// 노드 삭제
function deleteNode(node) {
    // 매개변수로 전달된 노드가 있으면 그것을 사용, 없으면 다중 선택 또는 우클릭 노드 사용
    const nodesToDelete = node ? [node] : (selectedNodes.length > 0 ? selectedNodes : (rightClickedNode ? [rightClickedNode] : []));
    
    if (nodesToDelete.length > 0) {
        // 삭제할 노드들의 ID 배열
        const nodeIdsToDelete = nodesToDelete.map(n => n.id);
        
        // 연결된 모든 연결선 제거
        connections = connections.filter(conn => 
            !nodeIdsToDelete.includes(conn.from) && !nodeIdsToDelete.includes(conn.to)
        );
        
        // 노드 제거
        nodes = nodes.filter(n => !nodeIdsToDelete.includes(n.id));
        
        // 선택 초기화
        selectedNodes = [];
        selectedNode = null;
        rightClickedNode = null;
        
        saveState();
        drawCanvas();
        
        const count = nodesToDelete.length;
        updateStatus(`✅ ${count} node${count > 1 ? 's' : ''} deleted!`);
    }
    document.getElementById('contextMenu').style.display = 'none';
}

