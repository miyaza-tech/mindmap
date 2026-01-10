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
        // 파일 이름 입력받기
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        // currentMindmapName이 있으면 그것을 기본값으로 사용
        const defaultName = currentMindmapName 
            ? `${currentMindmapName}(${year}-${month}-${day})` 
            : `mindmap(${year}-${month}-${day})`;
        
        const fileName = prompt('파일 이름을 입력하세요:', defaultName);
        
        if (!fileName) {
            updateStatus('❌ 저장 취소됨');
            return;
        }
        
        // 입력값 검증
        let validatedName;
        try {
            validatedName = validateInput(fileName, {
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
        a.download = `${validatedName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        updateStatus(`💾 ${validatedName}.json 저장 완료!`);
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
// JSON 불러오기 (다중 파일 지원 + 최근항목 자동 등록)
function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = true; // 다중 파일 선택 가능
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        let loadedCount = 0;
        let firstFileData = null;
        let firstFileName = null;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                const text = await readFileAsText(file);
                const data = JSON.parse(text);
                
                // 데이터 검증
                if (!data.nodes || !Array.isArray(data.nodes)) {
                    console.warn(`Invalid JSON format: ${file.name}`);
                    continue;
                }
                
                const fileName = file.name.replace(/\.json$/i, '');
                
                // 첫 번째 유효한 파일은 캔버스에 로드할 준비
                if (loadedCount === 0) {
                    firstFileData = data;
                    firstFileName = fileName;
                }
                
                // 모든 파일을 최근항목에 자동 저장
                saveImportedToRecent(fileName, data);
                loadedCount++;
                
            } catch (error) {
                console.error(`JSON import error for ${file.name}:`, error);
            }
        }
        
        if (loadedCount === 0) {
            updateStatus('❌ 유효한 JSON 파일이 없습니다');
            return;
        }
        
        // 첫 번째 파일을 캔버스에 로드
        if (firstFileData) {
            const confirmed = files.length === 1 
                ? confirm('현재 마인드맵을 불러온 데이터로 교체하시겠습니까?')
                : confirm(`${loadedCount}개 파일이 최근항목에 추가되었습니다.\n첫 번째 파일(${firstFileName})을 캔버스에 로드하시겠습니까?`);
            
            if (confirmed) {
                saveState();
                
                nodes.length = 0;
                nodes.push(...firstFileData.nodes);
                
                connections.length = 0;
                if (firstFileData.connections && Array.isArray(firstFileData.connections)) {
                    connections.push(...firstFileData.connections);
                }
                
                nodes.forEach(node => {
                    invalidateNodeCache(node);
                });
                
                currentMindmapName = firstFileName;
                
                fitToScreen();
                drawCanvas();
            }
        }
        
        if (loadedCount === 1) {
            updateStatus(`✅ "${firstFileName}" 불러옴 (최근항목에 저장됨)`);
        } else {
            updateStatus(`✅ ${loadedCount}개 파일 최근항목에 추가됨`);
        }
        
        renderRecentFiles();
    };
    
    input.click();
}

// 파일을 텍스트로 읽는 Promise 래퍼
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

// 불러온 파일을 최근항목에 저장
function saveImportedToRecent(fileName, data) {
    try {
        // 같은 이름의 파일이 있는지 확인
        const existingFile = recentFiles.find(f => f.name === fileName);
        
        let fileId;
        const timestamp = new Date().toISOString();
        
        if (existingFile) {
            // 기존 파일 업데이트
            fileId = existingFile.id;
            existingFile.timestamp = timestamp;
            
            // 목록 맨 앞으로 이동
            recentFiles = recentFiles.filter(f => f.id !== fileId);
            recentFiles.unshift(existingFile);
        } else {
            // 새 파일 생성
            fileId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
            recentFiles.unshift({
                id: fileId,
                name: fileName,
                timestamp: timestamp,
                favorite: false
            });
            
            // 최대 개수 제한
            if (recentFiles.length > MAX_RECENT_FILES) {
                const removed = recentFiles.pop();
                localStorage.removeItem(`mindmap_file_${removed.id}`);
            }
        }
        
        // 파일 데이터 저장
        const saveData = {
            nodes: deepClone(data.nodes),
            connections: deepClone(data.connections || []),
            timestamp: timestamp
        };
        localStorage.setItem(`mindmap_file_${fileId}`, JSON.stringify(saveData));
        
        // 최근 파일 목록 저장
        localStorage.setItem('mindmap_recent_files', JSON.stringify(recentFiles));
        
    } catch (error) {
        console.error('Save imported file error:', error);
    }
}

// URL 불러오기 모달 열기
function openImportURLModal() {
    const modal = document.getElementById('importURLModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('importURLInput').value = '';
        document.getElementById('importURLInput').focus();
    }
}

// URL 불러오기 모달 닫기
function closeImportURLModal() {
    const modal = document.getElementById('importURLModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// URL에서 JSON 불러오기 제출
function submitImportURL(event) {
    event.preventDefault();
    
    const urlInput = document.getElementById('importURLInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        updateStatus('❌ URL을 입력하세요');
        return;
    }
    
    importFromURL(url);
}

// URL에서 JSON 불러오기
async function importFromURL(url) {
    try {
        updateStatus('⏳ URL에서 불러오는 중...');
        
        // 지원하지 않는 URL 패턴 체크 (인증이 필요한 서비스들)
        const unsupportedPatterns = [
            { pattern: 'file.notion.so', name: 'Notion' },
            { pattern: 'notion.so/signed/', name: 'Notion' },
            { pattern: 'drive.google.com', name: 'Google Drive' },
            { pattern: 'dropbox.com', name: 'Dropbox' },
            { pattern: 'onedrive.live.com', name: 'OneDrive' },
            { pattern: '1drv.ms', name: 'OneDrive' }
        ];
        
        for (const { pattern, name } of unsupportedPatterns) {
            if (url.includes(pattern)) {
                closeImportURLModal();
                alert(`⚠️ ${name} URL은 보안 정책으로 직접 불러올 수 없습니다.\n\n해결 방법:\n1. ${name}에서 파일을 다운로드하세요\n2. "불러오기" 버튼을 클릭하세요\n3. 다운로드한 JSON 파일을 선택하세요`);
                updateStatus(`❌ ${name} URL은 직접 접근 불가 - 파일 다운로드 후 로컬 불러오기 사용`);
                return;
            }
        }
        
        // GitHub URL을 raw URL로 변환
        let fetchUrl = url;
        if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
            fetchUrl = url
                .replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/');
        }
        
        // Gist URL 처리
        if (url.includes('gist.github.com') && !url.includes('gist.githubusercontent.com')) {
            fetchUrl = url
                .replace('gist.github.com', 'gist.githubusercontent.com')
                .replace(/\/([^\/]+)$/, '/raw/$1');
        }
        
        let response;
        let data;
        
        // 먼저 직접 fetch 시도
        try {
            response = await fetch(fetchUrl);
            if (response.ok) {
                data = await response.json();
            } else {
                throw new Error('Direct fetch failed');
            }
        } catch (directError) {
            // CORS 문제일 경우 프록시 사용
            console.log('Direct fetch failed, trying CORS proxy...');
            updateStatus('⏳ CORS 프록시 통해 불러오는 중...');
            
            // CORS 프록시 목록 (하나가 실패하면 다음 시도)
            const corsProxies = [
                `https://corsproxy.io/?${encodeURIComponent(fetchUrl)}`,
                `https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`
            ];
            
            let proxySuccess = false;
            for (const proxyUrl of corsProxies) {
                try {
                    response = await fetch(proxyUrl);
                    if (response.ok) {
                        const text = await response.text();
                        data = JSON.parse(text);
                        proxySuccess = true;
                        break;
                    }
                } catch (proxyError) {
                    console.log(`Proxy failed: ${proxyUrl}`, proxyError);
                }
            }
            
            if (!proxySuccess) {
                throw new Error('CORS 제한으로 URL에 접근할 수 없습니다.\n해당 파일을 다운로드 후 "불러오기" 버튼으로 로컬 파일을 선택하세요.');
            }
        }
        
        // 데이터 검증
        if (!data.nodes || !Array.isArray(data.nodes)) {
            throw new Error('Invalid JSON format: nodes array required');
        }
        
        // URL에서 파일명 추출
        let fileName = 'mindmap';
        try {
            // downloadName 파라미터에서 파일명 추출 시도 (Notion 등)
            const urlObj = new URL(url);
            const downloadName = urlObj.searchParams.get('downloadName');
            if (downloadName) {
                fileName = decodeURIComponent(downloadName).replace(/\.json$/i, '');
            } else {
                const urlPath = urlObj.pathname;
                const pathParts = urlPath.split('/').filter(p => p);
                const lastPart = pathParts[pathParts.length - 1];
                if (lastPart && lastPart.endsWith('.json')) {
                    fileName = decodeURIComponent(lastPart).replace(/\.json$/i, '');
                }
            }
        } catch (e) {
            // URL 파싱 실패해도 기본 이름 사용
        }
        
        // 최근항목에 저장
        saveImportedToRecent(fileName, data);
        
        // 캔버스에 로드 확인
        const confirmed = confirm(`"${fileName}" 파일을 캔버스에 로드하시겠습니까?`);
        
        if (confirmed) {
            saveState();
            
            nodes.length = 0;
            nodes.push(...data.nodes);
            
            connections.length = 0;
            if (data.connections && Array.isArray(data.connections)) {
                connections.push(...data.connections);
            }
            
            nodes.forEach(node => {
                invalidateNodeCache(node);
            });
            
            currentMindmapName = fileName;
            
            fitToScreen();
            drawCanvas();
        }
        
        renderRecentFiles();
        closeImportURLModal();
        updateStatus(`✅ "${fileName}" URL에서 불러옴`);
        
    } catch (error) {
        console.error('URL import error:', error);
        updateStatus(`❌ URL 불러오기 실패: ${error.message}`);
    }
}
