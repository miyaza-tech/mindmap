// 히스토리 관리 (Undo/Redo)

// 상태 저장
function saveState() {
    try {
        if (historyIndex < history.length - 1) {
            history.splice(historyIndex + 1);
        }
        
        const stateCopy = {
            nodes: deepClone(nodes),
            connections: deepClone(connections)
        };
        
        if (!stateCopy.nodes || !stateCopy.connections) {
            throw new Error('Failed to clone state');
        }
        
        history.push(stateCopy);
        
        if (history.length > CONFIG.maxHistory) {
            history.shift();
        } else {
            historyIndex++;
        }
    } catch (error) {
        logError('Save State', error);
    }
}

// Undo
function undo() {
    try {
        if (historyIndex > 0) {
            historyIndex--;
            const state = history[historyIndex];
            nodes = deepClone(state.nodes);
            connections = deepClone(state.connections);
            
            if (!nodes || !connections) {
                throw new Error('Failed to restore state');
            }
            
            drawCanvas();
            updateStatus('↶ Undo');
        }
    } catch (error) {
        logError('Undo', error, true);
        updateStatus('❌ Undo 실패');
    }
}

// Redo
function redo() {
    try {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            const state = history[historyIndex];
            nodes = deepClone(state.nodes);
            connections = deepClone(state.connections);
            
            if (!nodes || !connections) {
                throw new Error('Failed to restore state');
            }
            
            drawCanvas();
            updateStatus('↷ Redo');
        }
    } catch (error) {
        logError('Redo', error, true);
        updateStatus('❌ Redo 실패');
    }
}
