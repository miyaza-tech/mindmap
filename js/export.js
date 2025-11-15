// PNG/PDF 내보내기 함수들

// PNG 내보내기
function exportPNG() {
    if (nodes.length === 0) {
        updateStatus('❌ No nodes to export');
        return;
    }
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
        minX = Math.min(minX, node.x - node.width/2);
        minY = Math.min(minY, node.y - node.height/2);
        maxX = Math.max(maxX, node.x + node.width/2);
        maxY = Math.max(maxY, node.y + node.height/2);
    });
    
    const padding = 50;
    tempCanvas.width = maxX - minX + padding * 2;
    tempCanvas.height = maxY - minY + padding * 2;
    
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;
    
    // 연결선 그리기
    connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (fromNode && toNode) {
            const fromWithOffset = {...fromNode, x: fromNode.x + offsetX, y: fromNode.y + offsetY};
            const toWithOffset = {...toNode, x: toNode.x + offsetX, y: toNode.y + offsetY};
            
            const start = getConnectionPoint(fromWithOffset, toWithOffset, true);
            const end = getConnectionPoint(toWithOffset, fromWithOffset, false);
            
            tempCtx.strokeStyle = '#bbbbbb';
            tempCtx.lineWidth = 2;
            tempCtx.beginPath();
            tempCtx.moveTo(start.x, start.y);
            tempCtx.lineTo(end.x, end.y);
            tempCtx.stroke();
        }
    });
    
    // 노드 그리기 (캔버스와 동일한 방식으로)
    nodes.forEach(node => {
        const nodeWithOffset = {
            ...node,
            x: node.x + offsetX,
            y: node.y + offsetY
        };
        
        // 노드 배경
        tempCtx.save();
        tempCtx.shadowColor = 'rgba(0,0,0,0.15)';
        tempCtx.shadowBlur = 4;
        tempCtx.shadowOffsetX = 1;
        tempCtx.shadowOffsetY = 2;
        
        tempCtx.fillStyle = node.color || '#ffffff';
        tempCtx.strokeStyle = '#e0e0e0';
        tempCtx.lineWidth = 1;
        
        const x = nodeWithOffset.x;
        const y = nodeWithOffset.y;
        const width = nodeWithOffset.width;
        const height = nodeWithOffset.height;
        
        if (nodeWithOffset.shape === 'circle') {
            const radius = Math.min(width, height) / 2;
            tempCtx.beginPath();
            tempCtx.arc(x, y, radius, 0, Math.PI * 2);
            tempCtx.fill();
            tempCtx.stroke();
        } else if (nodeWithOffset.shape === 'diamond') {
            tempCtx.beginPath();
            tempCtx.moveTo(x, y - height/2);
            tempCtx.lineTo(x + width/2, y);
            tempCtx.lineTo(x, y + height/2);
            tempCtx.lineTo(x - width/2, y);
            tempCtx.closePath();
            tempCtx.fill();
            tempCtx.stroke();
        } else {
            tempCtx.beginPath();
            if (tempCtx.roundRect) {
                tempCtx.roundRect(x - width/2, y - height/2, width, height, 6);
            } else {
                tempCtx.rect(x - width/2, y - height/2, width, height);
            }
            tempCtx.fill();
            tempCtx.stroke();
        }
        
        tempCtx.restore();
        
        // 텍스트 영역 계산 (도형에 따라 다르게)
        const padding = 20;
        let textAreaWidth;
        
        if (nodeWithOffset.shape === 'circle') {
            // 원형: 내접 정사각형의 너비 사용 (지름 * 0.7)
            textAreaWidth = width * 0.7 - padding * 2;
        } else if (nodeWithOffset.shape === 'diamond') {
            // 다이아몬드: 중앙 너비의 약 70%
            textAreaWidth = width * 0.7 - padding * 2;
        } else {
            // 사각형: 전체 너비 사용
            textAreaWidth = width - padding * 2;
        }
        
        // 제목 그리기 (캔버스와 동일)
        const title = node.title || 'Node';
        const titleFont = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        
        // wrapText 함수 사용
        tempCtx.save();
        tempCtx.font = titleFont;
        const words = title.split(' ');
        const titleLines = [];
        let currentLine = '';
        
        for (let word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = tempCtx.measureText(testLine);
            const linkSpace = (node.link && node.link.trim()) ? 20 : 0;
            
            if (metrics.width > textAreaWidth - linkSpace && currentLine) {
                titleLines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            titleLines.push(currentLine);
        }
        tempCtx.restore();
        
        tempCtx.fillStyle = '#333';
        tempCtx.font = titleFont;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'top';
        
        const lineHeight = 18;
        const contentLineHeight = 16;
        const titleHeight = titleLines.length * lineHeight;
        
        // 내용 줄바꿈 계산
        tempCtx.save();
        tempCtx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const contentWords = (node.content && node.content.trim()) ? node.content.split(' ') : [];
        const contentLines = [];
        let contentLine = '';
        
        for (let word of contentWords) {
            const testLine = contentLine + (contentLine ? ' ' : '') + word;
            const metrics = tempCtx.measureText(testLine);
            
            if (metrics.width > textAreaWidth && contentLine) {
                contentLines.push(contentLine);
                contentLine = word;
            } else {
                contentLine = testLine;
            }
        }
        if (contentLine) {
            contentLines.push(contentLine);
        }
        tempCtx.restore();
        
        const contentHeight = contentLines.length * contentLineHeight;
        const spacing = contentLines.length > 0 ? 4 : 0;
        const totalTextHeight = titleHeight + spacing + contentHeight;
        
        let currentY = y - totalTextHeight / 2;
        
        // 제목 렌더링
        titleLines.forEach((line, index) => {
            tempCtx.fillText(line, x, currentY);
            
            // 링크 아이콘을 첫 번째 라인 끝에 추가
            if (index === 0 && node.link && node.link.trim()) {
                const iconSize = 12;
                const lineWidth = tempCtx.measureText(line).width;
                const iconX = x + lineWidth / 2 + 8;
                const iconY = currentY + 3;
                
                // 링크 아이콘 배경
                tempCtx.fillStyle = '#007bff';
                tempCtx.beginPath();
                if (tempCtx.roundRect) {
                    tempCtx.roundRect(iconX, iconY, iconSize, iconSize, 2);
                } else {
                    tempCtx.rect(iconX, iconY, iconSize, iconSize);
                }
                tempCtx.fill();
                
                // 링크 아이콘 (체인 모양)
                tempCtx.strokeStyle = 'white';
                tempCtx.lineWidth = 1.2;
                const centerX = iconX + iconSize/2;
                const centerY = iconY + iconSize/2;
                
                tempCtx.beginPath();
                tempCtx.arc(centerX - 2, centerY - 2, 1.5, 0, Math.PI * 2);
                tempCtx.stroke();
                tempCtx.beginPath();
                tempCtx.arc(centerX + 2, centerY + 2, 1.5, 0, Math.PI * 2);
                tempCtx.stroke();
                tempCtx.beginPath();
                tempCtx.moveTo(centerX - 1, centerY - 1);
                tempCtx.lineTo(centerX + 1, centerY + 1);
                tempCtx.stroke();
            }
            
            currentY += lineHeight;
        });
        
        // 내용 그리기
        if (contentLines.length > 0) {
            currentY += spacing;
            
            const contentFont = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            
            tempCtx.fillStyle = '#666';
            tempCtx.font = contentFont;
            
            contentLines.forEach(line => {
                tempCtx.fillText(line, x, currentY);
                currentY += contentLineHeight;
            });
        }
    });
    
    // 다운로드
    const link = document.createElement('a');
    link.download = 'mindmap.png';
    link.href = tempCanvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    updateStatus('📸 PNG exported!');
}

// PDF 내보내기
function exportPDF() {
    if (nodes.length === 0) {
        updateStatus('❌ No nodes to export');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        
        // 임시 캔버스 생성
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        nodes.forEach(node => {
            minX = Math.min(minX, node.x - node.width/2);
            minY = Math.min(minY, node.y - node.height/2);
            maxX = Math.max(maxX, node.x + node.width/2);
            maxY = Math.max(maxY, node.y + node.height/2);
        });
        
        const padding = 50;
        tempCanvas.width = maxX - minX + padding * 2;
        tempCanvas.height = maxY - minY + padding * 2;
        
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        const offsetX = -minX + padding;
        const offsetY = -minY + padding;
        
        // 연결선 그리기
        connections.forEach(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (fromNode && toNode) {
                const fromWithOffset = {...fromNode, x: fromNode.x + offsetX, y: fromNode.y + offsetY};
                const toWithOffset = {...toNode, x: toNode.x + offsetX, y: toNode.y + offsetY};
                
                const start = getConnectionPoint(fromWithOffset, toWithOffset, true);
                const end = getConnectionPoint(toWithOffset, fromWithOffset, false);
                
                tempCtx.strokeStyle = '#bbbbbb';
                tempCtx.lineWidth = 2;
                tempCtx.beginPath();
                tempCtx.moveTo(start.x, start.y);
                tempCtx.lineTo(end.x, end.y);
                tempCtx.stroke();
            }
        });
        
        // 노드 그리기 (캔버스와 동일한 방식으로)
        nodes.forEach(node => {
            const x = node.x + offsetX;
            const y = node.y + offsetY;
            const width = node.width;
            const height = node.height;
            
            // 노드 배경
            tempCtx.save();
            tempCtx.shadowColor = 'rgba(0,0,0,0.15)';
            tempCtx.shadowBlur = 4;
            tempCtx.shadowOffsetX = 1;
            tempCtx.shadowOffsetY = 2;
            
            tempCtx.fillStyle = node.color || '#ffffff';
            tempCtx.strokeStyle = '#e0e0e0';
            tempCtx.lineWidth = 1;
            
            if (node.shape === 'circle') {
                const radius = Math.min(width, height) / 2;
                tempCtx.beginPath();
                tempCtx.arc(x, y, radius, 0, Math.PI * 2);
                tempCtx.fill();
                tempCtx.stroke();
            } else if (node.shape === 'diamond') {
                tempCtx.beginPath();
                tempCtx.moveTo(x, y - height/2);
                tempCtx.lineTo(x + width/2, y);
                tempCtx.lineTo(x, y + height/2);
                tempCtx.lineTo(x - width/2, y);
                tempCtx.closePath();
                tempCtx.fill();
                tempCtx.stroke();
            } else {
                tempCtx.beginPath();
                if (tempCtx.roundRect) {
                    tempCtx.roundRect(x - width/2, y - height/2, width, height, 6);
                } else {
                    tempCtx.rect(x - width/2, y - height/2, width, height);
                }
                tempCtx.fill();
                tempCtx.stroke();
            }
            
            tempCtx.restore();
            
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
            const titleFont = 'bold 14px Arial, sans-serif';
            
            // wrapText 함수 사용
            tempCtx.save();
            tempCtx.font = titleFont;
            const words = title.split(' ');
            const titleLines = [];
            let currentLine = '';
            
            for (let word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const metrics = tempCtx.measureText(testLine);
                const linkSpace = (node.link && node.link.trim()) ? 20 : 0;
                
                if (metrics.width > textAreaWidth - linkSpace && currentLine) {
                    titleLines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) {
                titleLines.push(currentLine);
            }
            tempCtx.restore();
            
            tempCtx.fillStyle = '#333';
            tempCtx.font = titleFont;
            tempCtx.textAlign = 'center';
            tempCtx.textBaseline = 'top';
            
            const lineHeight = 18;
            const contentLineHeight = 16;
            const titleHeight = titleLines.length * lineHeight;
            
            // 내용 줄바꿈 계산
            tempCtx.save();
            tempCtx.font = '12px Arial, sans-serif';
            const contentWords = (node.content && node.content.trim()) ? node.content.split(' ') : [];
            const contentLines = [];
            let contentLine = '';
            
            for (let word of contentWords) {
                const testLine = contentLine + (contentLine ? ' ' : '') + word;
                const metrics = tempCtx.measureText(testLine);
                
                if (metrics.width > textAreaWidth && contentLine) {
                    contentLines.push(contentLine);
                    contentLine = word;
                } else {
                    contentLine = testLine;
                }
            }
            if (contentLine) {
                contentLines.push(contentLine);
            }
            tempCtx.restore();
            
            const contentHeight = contentLines.length * contentLineHeight;
            const spacing = contentLines.length > 0 ? 4 : 0;
            const totalTextHeight = titleHeight + spacing + contentHeight;
            
            let currentY = y - totalTextHeight / 2;
            
            // 제목 렌더링
            titleLines.forEach((line, index) => {
                tempCtx.fillText(line, x, currentY);
                
                // 링크 아이콘을 첫 번째 라인 끝에 추가
                if (index === 0 && node.link && node.link.trim()) {
                    const iconSize = 12;
                    const lineWidth = tempCtx.measureText(line).width;
                    const iconX = x + lineWidth / 2 + 8;
                    const iconY = currentY + 3;
                    
                    // 링크 아이콘 배경
                    tempCtx.fillStyle = '#007bff';
                    tempCtx.fillRect(iconX, iconY, iconSize, iconSize);
                    
                    // 링크 아이콘 (체인 모양)
                    tempCtx.strokeStyle = 'white';
                    tempCtx.lineWidth = 1.2;
                    const centerX = iconX + iconSize/2;
                    const centerY = iconY + iconSize/2;
                    
                    tempCtx.beginPath();
                    tempCtx.arc(centerX - 2, centerY - 2, 1.5, 0, Math.PI * 2);
                    tempCtx.stroke();
                    tempCtx.beginPath();
                    tempCtx.arc(centerX + 2, centerY + 2, 1.5, 0, Math.PI * 2);
                    tempCtx.stroke();
                    tempCtx.beginPath();
                    tempCtx.moveTo(centerX - 1, centerY - 1);
                    tempCtx.lineTo(centerX + 1, centerY + 1);
                    tempCtx.stroke();
                }
                
                currentY += lineHeight;
            });
            
            // 내용 그리기
            if (contentLines.length > 0) {
                currentY += spacing;
                
                const contentFont = '12px Arial, sans-serif';
                
                tempCtx.fillStyle = '#666';
                tempCtx.font = contentFont;
                
                contentLines.forEach(line => {
                    tempCtx.fillText(line, x, currentY);
                    currentY += contentLineHeight;
                });
            }
        });
        
        // PDF 생성
        const pdf = new jsPDF('landscape');
        const imgData = tempCanvas.toDataURL('image/jpeg', 1.0);
        
        // PDF 크기에 맞게 이미지 크기 계산
        const pdfWidth = 297; // A4 landscape width in mm
        const pdfHeight = 210; // A4 landscape height in mm
        const imgAspect = tempCanvas.width / tempCanvas.height;
        const pdfAspect = pdfWidth / pdfHeight;
        
        let finalWidth, finalHeight;
        if (imgAspect > pdfAspect) {
            // 이미지가 더 넓음 - 너비 기준으로 맞춤
            finalWidth = pdfWidth;
            finalHeight = pdfWidth / imgAspect;
        } else {
            // 이미지가 더 높음 - 높이 기준으로 맞춤
            finalHeight = pdfHeight;
            finalWidth = pdfHeight * imgAspect;
        }
        
        // 중앙 정렬
        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;
        
        pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
        pdf.save('mindmap.pdf');
        
        updateStatus('📄 PDF exported!');
    } catch (error) {
        console.error('PDF export error:', error);
        updateStatus('❌ PDF export failed');
    }
}

// JSON 내보내기
// 자동 번호 증가 JSON 저장
function autoSaveJSON() {
    if (nodes.length === 0) {
        updateStatus('❌ 저장할 노드가 없습니다');
        return;
    }
    
    try {
        // 현재 날짜를 YYYY-MM-DD 형식으로 포맷
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const data = {
            nodes: nodes,
            connections: connections,
            version: '1.0',
            exportDate: now.toISOString()
        };
        
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindmap(${dateStr}).json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        updateStatus(`💾 mindmap(${dateStr}).json 저장 완료!`);
    } catch (error) {
        console.error('Auto save error:', error);
        updateStatus('❌ 저장 실패');
    }
}

function exportJSON() {
    if (nodes.length === 0) {
        updateStatus('❌ No nodes to export');
        return;
    }
    
    try {
        const data = {
            nodes: nodes,
            connections: connections,
            version: '1.0',
            exportDate: new Date().toISOString()
        };
        
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindmap_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        updateStatus('💾 JSON exported!');
    } catch (error) {
        console.error('JSON export error:', error);
        updateStatus('❌ JSON export failed');
    }
}

// JSON 불러오기
function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                // 데이터 검증
                if (!data.nodes || !Array.isArray(data.nodes)) {
                    updateStatus('❌ Invalid JSON format');
                    return;
                }
                
                // 확인 대화상자
                const confirmed = confirm('현재 마인드맵을 불러온 데이터로 교체하시겠습니까?');
                if (!confirmed) return;
                
                // 상태 저장 (실행취소 가능하도록)
                saveState();
                
                // 데이터 로드
                nodes.length = 0;
                nodes.push(...data.nodes);
                
                connections.length = 0;
                if (data.connections && Array.isArray(data.connections)) {
                    connections.push(...data.connections);
                }
                
                // 노드 크기 재계산
                nodes.forEach(node => {
                    invalidateNodeCache(node);
                });
                
                // 화면에 맞추기
                fitToScreen();
                drawCanvas();
                
                updateStatus('✅ JSON imported!');
            } catch (error) {
                console.error('JSON import error:', error);
                updateStatus('❌ JSON import failed: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}
