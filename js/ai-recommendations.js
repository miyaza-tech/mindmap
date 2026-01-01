// AI 추천 시스템

// AI 추천 데이터 구조
// node.aiRecommendations = [
//   {
//     title: string,
//     url: string,
//     description: string,
//     timestamp: number,
//     read: boolean
//   }
// ]

// API 설정 (환경변수나 설정 파일에서 가져와야 함)
const AI_CONFIG = {
    // 실제 사용시 환경변수나 설정에서 가져오기
    apiKey: localStorage.getItem('ai_api_key') || '',
    provider: 'tavily', // Tavily만 지원
    enabled: true // 기본값은 true
};

// localStorage에서 설정 읽기
const storedEnabled = localStorage.getItem('ai_recommendations_enabled');
if (storedEnabled === null) {
    // 처음 사용 - 기본값 true로 저장
    localStorage.setItem('ai_recommendations_enabled', 'true');
    AI_CONFIG.enabled = true;
} else {
    // 저장된 값 사용
    AI_CONFIG.enabled = storedEnabled === 'true';
}

// AI API를 사용하여 관련 정보 검색
async function getAIRecommendations(nodeTitle, nodeContent, searchDomains = []) {
    if (!AI_CONFIG.enabled || !AI_CONFIG.apiKey) {
        return [];
    }
    
    // 콘텐츠를 50자로 제한 (API 요청 최적화)
    const content50 = nodeContent ? nodeContent.substring(0, 50) : '';
    
    try {
        const query = getAIRecommendations.query || `${nodeTitle} ${content50} latest news update announcement release`;
        console.log('🔍 AI Search Query:', query);
        const results = await searchWithTavily(query, searchDomains);
        return results;
    } catch (error) {
        console.error('AI recommendations error:', error);
        return [];
    }
}

// Tavily API로 검색 (추천 - 가장 간단하고 효과적)
async function searchWithTavily(query, searchDomains = []) {
    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            api_key: AI_CONFIG.apiKey,
            query: query,
            search_depth: 'advanced', // 'basic': 빠른 검색, 'advanced': 더 깊은 검색
            topic: 'news', // 뉴스 전용 검색 모드
            days: 7, // 최근 7일 이내 뉴스
            include_answer: false, // AI 생성 답변은 제외하고 실제 웹 결과만
            include_raw_content: false, // 원본 콘텐츠는 제외 (용량 절약)
            max_results: 10, // 최대 10개 결과 (필터링 후 5개 남도록)
            include_images: false, // 이미지는 제외
            include_domains: searchDomains.length > 0 ? searchDomains : [], // 노드별 설정 사용
            exclude_domains: ['ads.example.com', 'spam.com'] // 광고/스팸 도메인 제외
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Tavily API error response:', errorText);
        throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();    // 1주일 전 날짜 계산
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoTimestamp = oneWeekAgo.getTime();
    
    // Tavily는 이미 구조화된 결과를 제공
    const allResults = data.results.map(result => {
        // published_date가 있으면 사용, 없으면 현재 시간
        let resultDate = Date.now();
        if (result.published_date) {
            resultDate = new Date(result.published_date).getTime();
        }
        
        return {
            title: result.title,
            url: result.url,
            description: result.content || result.snippet || '',
            timestamp: resultDate,
            publishedDate: result.published_date || null,
            read: false
        };
    });
    
    // 날짜순 정렬 (최신순) 후 상위 5개만 반환
    const sortedResults = allResults
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
    
    console.log(`📅 Returning ${sortedResults.length} results (sorted by date)`);
    
    return sortedResults;
}

// 특정 노드에 대한 AI 추천 가져오기
async function fetchRecommendationsForNode(nodeId) {
    console.log('🔍 fetchRecommendationsForNode called:', nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.title) {
        console.log('❌ No node or title found');
        return;
    }
    console.log('✅ Node found:', node.title);
    
    console.log('🔧 AI_CONFIG:', AI_CONFIG);
    if (!AI_CONFIG.enabled) {
        console.log('❌ AI disabled');
        return;
    }
    
    // 검색 도메인이 설정되어 있는지 확인
    const hasSearchDomains = node.searchDomains && node.searchDomains.length > 0;
    console.log('🌐 Search domains:', node.searchDomains, 'hasSearchDomains:', hasSearchDomains);
    
    if (hasSearchDomains && typeof window.updateStatus === 'function') {
        window.updateStatus('🤖 AI 추천 검색 중...');
    }
    
    try {
        console.log('🚀 Calling getAIRecommendations...');
        const recommendations = await getAIRecommendations(node.title, node.content || '', node.searchDomains || []);
        console.log('📊 Recommendations received:', recommendations);
        
        if (!node.aiRecommendations) {
            node.aiRecommendations = [];
        }
        
        node.aiRecommendations = recommendations;
        node.hasNewRecommendations = recommendations && recommendations.length > 0;
        console.log('✨ hasNewRecommendations:', node.hasNewRecommendations);
        drawCanvas();
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
}

// 단일 노드 AI 추천 업데이트 (우클릭 메뉴용)
async function refreshNodeAIRecommendations() {
    const lang = getCurrentLanguage();
    
    if (!AI_CONFIG.enabled || !AI_CONFIG.apiKey) {
        alert(lang === 'ko' ? 'AI 추천 기능이 비활성화되어 있거나 API 키가 설정되지 않았습니다.\n\nAI 설정에서 API 키를 입력해주세요.' : 'AI recommendations are disabled or API key is not set.\n\nPlease enter API key in AI Settings.');
        return;
    }
    
    if (!selectedNode) {
        return;
    }
    
    // 기존 추천 삭제 확인
    if (selectedNode.aiRecommendations && selectedNode.aiRecommendations.length > 0) {
        const confirmMsg = lang === 'ko' 
            ? `기존 AI 추천(${selectedNode.aiRecommendations.length}개)을 삭제하고 새로 가져오시겠습니까?`
            : `Delete existing AI recommendations (${selectedNode.aiRecommendations.length}) and fetch new ones?`;
        
        if (!confirm(confirmMsg)) {
            return;
        }
    }
    
    // 기존 추천 삭제
    selectedNode.aiRecommendations = [];
    selectedNode.hasNewRecommendations = false;
    
    updateStatus('🤖 ' + (lang === 'ko' ? `"${selectedNode.title}" AI 분석 중...` : `Analyzing "${selectedNode.title}"...`));
    
    // 새 추천 가져오기
    await fetchRecommendationsForNode(selectedNode);
    
    // 캔버스 다시 그리기
    drawCanvas();
    
    const count = selectedNode.aiRecommendations ? selectedNode.aiRecommendations.length : 0;
    updateStatus('✅ ' + (lang === 'ko' ? `AI 추천 업데이트 완료! (${count}개)` : `AI recommendations updated! (${count})`));
}

// 모든 노드에 대한 추천 갱신 (선택적)
async function refreshAllRecommendations() {
    const lang = getCurrentLanguage();
    
    if (!AI_CONFIG.enabled || !AI_CONFIG.apiKey) {
        alert(lang === 'ko' ? 'AI 추천 기능이 비활성화되어 있거나 API 키가 설정되지 않았습니다.' : 'AI recommendations are disabled or API key is not set.');
        return;
    }
    
    updateStatus('🤖 ' + (lang === 'ko' ? '모든 노드 분석 중...' : 'Analyzing all nodes...'));
    
    for (const node of nodes) {
        await fetchRecommendationsForNode(node);
        // API 요청 제한을 피하기 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    updateStatus('✅ ' + (lang === 'ko' ? '모든 노드 분석 완료!' : 'All nodes analyzed!'));
}

// 추천 모달 표시
// 추천 모달 표시
let currentRecommendationNode = null; // 현재 추천을 보고 있는 노드 저장

function showRecommendationsModal(node) {
    if (!node.aiRecommendations || node.aiRecommendations.length === 0) {
        const lang = getCurrentLanguage();
        alert(lang === 'ko' ? '이 노드에 대한 추천이 없습니다.' : 'No recommendations for this node.');
        return;
    }
    
    currentRecommendationNode = node; // 현재 노드 저장
    
    // ⚠️ 모달을 열어도 알림 아이콘은 유지 (모든 추천을 삭제해야 사라짐)
    // node.hasNewRecommendations = false; 제거!
    // node.aiRecommendations.forEach(rec => rec.read = true); 제거!
    
    renderRecommendationsList();
    
    const modal = document.getElementById('recommendationsModal');
    modal.style.display = 'flex';
}

// 추천 리스트 렌더링 (재사용 가능하도록 분리)
function renderRecommendationsList() {
    if (!currentRecommendationNode) return;
    
    const list = document.getElementById('recommendationsList');
    const node = currentRecommendationNode;
    
    // 목록 생성
    list.innerHTML = '';
    
    if (!node.aiRecommendations || node.aiRecommendations.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">모든 추천이 삭제되었습니다.</p>';
        // 모든 추천이 삭제되면 알림 아이콘 제거
        node.hasNewRecommendations = false;
        drawCanvas();
        return;
    }
    
    node.aiRecommendations.forEach((rec, index) => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.style.position = 'relative';
        
        // X 삭제 버튼
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'recommendation-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = '이 추천 삭제';
        deleteBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteRecommendation(index);
        };
        
        const titleEl = document.createElement('a');
        titleEl.href = rec.url;
        titleEl.target = '_blank';
        titleEl.rel = 'noopener noreferrer';
        titleEl.className = 'recommendation-title';
        titleEl.textContent = rec.title;
        
        const urlEl = document.createElement('div');
        urlEl.className = 'recommendation-url';
        urlEl.textContent = rec.url;
        
        const descEl = document.createElement('p');
        descEl.className = 'recommendation-description';
        descEl.textContent = rec.description;
        
        const timestampEl = document.createElement('div');
        timestampEl.className = 'recommendation-timestamp';
        timestampEl.textContent = new Date(rec.timestamp).toLocaleDateString();
        
        item.appendChild(deleteBtn);
        item.appendChild(titleEl);
        item.appendChild(urlEl);
        item.appendChild(descEl);
        item.appendChild(timestampEl);
        list.appendChild(item);
    });
}

// 개별 추천 삭제
function deleteRecommendation(index) {
    if (!currentRecommendationNode) return;
    
    const node = currentRecommendationNode;
    
    // 확인 없이 바로 삭제
    node.aiRecommendations.splice(index, 1);
    
    // 리스트 다시 렌더링
    renderRecommendationsList();
    
    // 모든 추천이 삭제되었으면 알림 아이콘 제거 및 모달 닫기
    if (node.aiRecommendations.length === 0) {
        node.hasNewRecommendations = false;
        drawCanvas();
        setTimeout(() => {
            closeRecommendationsModal();
        }, 500); // 0.5초 후 모달 닫기
    }
    
    saveState();
    drawCanvas();
}

// 추천 모달 닫기
function closeRecommendationsModal() {
    document.getElementById('recommendationsModal').style.display = 'none';
    currentRecommendationNode = null; // 참조 제거
}

// AI 설정 모달 표시
function showAISettingsModal() {
    const modal = document.getElementById('aiSettingsModal');
    
    document.getElementById('aiApiKey').value = AI_CONFIG.apiKey;
    // provider 필드 제거됨 (Tavily만 사용)
    document.getElementById('aiEnabled').checked = AI_CONFIG.enabled;
    
    modal.style.display = 'flex';
}

// AI 설정 저장
function saveAISettings() {
    const apiKey = document.getElementById('aiApiKey').value.trim();
    const enabled = document.getElementById('aiEnabled').checked;
    
    AI_CONFIG.apiKey = apiKey;
    AI_CONFIG.provider = 'tavily'; // 항상 Tavily
    AI_CONFIG.enabled = enabled;
    
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_recommendations_enabled', enabled.toString());
    
    const lang = getCurrentLanguage();
    updateStatus('✅ ' + (lang === 'ko' ? 'AI 설정이 저장되었습니다' : 'AI settings saved'));
    
    closeAISettingsModal();
}

// API 키 삭제
function clearApiKey() {
    if (!confirm('API 키를 삭제하시겠습니까?\n\n삭제 후에도 저장된 AI 추천 내용은 유지됩니다.')) {
        return;
    }
    
    // localStorage에서 API 키 삭제
    localStorage.removeItem('ai_api_key');
    
    // 현재 설정 초기화
    AI_CONFIG.apiKey = '';
    document.getElementById('aiApiKey').value = '';
    
    const lang = getCurrentLanguage();
    updateStatus('🗑️ ' + (lang === 'ko' ? 'API 키가 삭제되었습니다' : 'API key deleted'));
}

// AI 설정 모달 닫기
function closeAISettingsModal() {
    document.getElementById('aiSettingsModal').style.display = 'none';
}

// 전역 스코프에 함수들 노출
window.fetchRecommendationsForNode = fetchRecommendationsForNode;
window.showRecommendations = showRecommendations;
window.closeRecommendationsModal = closeRecommendationsModal;
window.showAISettingsModal = showAISettingsModal;
window.closeAISettingsModal = closeAISettingsModal;
window.saveAISettings = saveAISettings;
window.clearAIApiKey = clearAIApiKey;
window.checkNotificationIconClick = checkNotificationIconClick;
window.deleteRecommendation = deleteRecommendation;
