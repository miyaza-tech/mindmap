// 유틸리티 함수들

// HTML 이스케이프 처리 (XSS 방지)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 에러 로깅 및 사용자 알림
function logError(context, error, showUser = false) {
    console.error(`[Mindmap Error - ${context}]`, error);
    if (showUser) {
        updateStatus(`❌ 오류: ${context}`);
    }
}

// 입력값 검증
function validateInput(input, options = {}) {
    const {
        minLength = 0,
        maxLength = 100,
        allowSpecialChars = true,
        fieldName = '입력값'
    } = options;
    
    if (!input || typeof input !== 'string') {
        throw new Error(`${fieldName}을(를) 입력해주세요.`);
    }
    
    const trimmed = input.trim();
    
    if (trimmed.length < minLength) {
        throw new Error(`${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다.`);
    }
    
    if (trimmed.length > maxLength) {
        throw new Error(`${fieldName}은(는) 최대 ${maxLength}자까지 입력 가능합니다.`);
    }
    
    if (!allowSpecialChars) {
        const specialChars = /[<>"'&]/;
        if (specialChars.test(trimmed)) {
            throw new Error(`${fieldName}에 특수문자(<, >, ", ', &)를 사용할 수 없습니다.`);
        }
    }
    
    return trimmed;
}

// JSON 안전하게 파싱
function safeJsonParse(jsonString, defaultValue = null) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        logError('JSON Parse', error);
        return defaultValue;
    }
}

// 깊은 복사 (순환 참조 방지)
function deepClone(obj) {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        logError('Deep Clone', error);
        return null;
    }
}

// 마우스 좌표를 월드 좌표로 변환
function screenToWorld(screenX, screenY) {
    return {
        x: (screenX - camera.x) / zoom,
        y: (screenY - camera.y) / zoom
    };
}

// 월드 좌표를 마우스 좌표로 변환
function worldToScreen(worldX, worldY) {
    return {
        x: worldX * zoom + camera.x,
        y: worldY * zoom + camera.y
    };
}

// 텍스트 크기 측정
function measureText(text, font) {
    ctx.save();
    ctx.font = font;
    const metrics = ctx.measureText(text);
    ctx.restore();
    return {
        width: metrics.width,
        height: parseInt(font.match(/\d+/)[0])
    };
}

// 텍스트를 여러 줄로 나누기
function wrapText(text, maxWidth, font) {
    if (!text) return [];
    
    ctx.save();
    ctx.font = font;
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let word of words) {
        // 단어 자체가 maxWidth보다 긴 경우 강제로 자르기
        if (ctx.measureText(word).width > maxWidth) {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = '';
            }
            
            // 긴 단어를 문자 단위로 자르기
            let chunk = '';
            for (let char of word) {
                const testChunk = chunk + char;
                if (ctx.measureText(testChunk).width > maxWidth) {
                    if (chunk) lines.push(chunk);
                    chunk = char;
                } else {
                    chunk = testChunk;
                }
            }
            if (chunk) currentLine = chunk;
            continue;
        }
        
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    ctx.restore();
    return lines;
}

// 점과 선분 사이의 거리 계산
function distanceToLine(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    
    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// 상태 메시지 업데이트 (토스트)
const STATUS_DURATION = 3000;
let statusHideTimer = null;

function updateStatus(message) {
    const el = document.getElementById('status');
    if (!el || !message) return;

    // 연속 호출 시 이전 타이머가 새 메시지를 먼저 지우지 않도록 초기화
    if (statusHideTimer) clearTimeout(statusHideTimer);

    el.textContent = message;
    el.classList.add('visible');

    statusHideTimer = setTimeout(() => {
        el.classList.remove('visible');
        statusHideTimer = null;
    }, STATUS_DURATION);
}

// 노드 스타일 업데이트
// 그리드 스냅 함수
function snapToGridPoint(x, y) {
    if (!snapToGrid) return { x, y };
    
    // 가장 가까운 그리드 포인트로 스냅
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    return {
        x: snappedX,
        y: snappedY
    };
}

// 그리드 스냅 토글
function toggleSnapToGrid() {
    snapToGrid = !snapToGrid;
    
    // 버튼 활성화 표시 업데이트
    const snapToggle = document.getElementById('snapToggle');
    const snapToggleCollapsed = document.getElementById('snapToggleCollapsed');
    
    if (snapToggle) {
        snapToggle.classList.toggle('active', snapToGrid);
    }
    if (snapToggleCollapsed) {
        snapToggleCollapsed.classList.toggle('active', snapToGrid);
    }
    
    // localStorage에 상태 저장
    localStorage.setItem('snapToGrid', snapToGrid);
    
    updateStatus(snapToGrid ? '🧲 Snap to grid enabled' : '🧲 Snap to grid disabled');
    drawCanvas();
}

// Hex 색상을 RGB로 변환
function hexToRgb(hex) {
    // #을 제거하고 처리
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
