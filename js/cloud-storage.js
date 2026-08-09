// Firestore 클라우드 저장/불러오기

// Firestore 컬렉션 경로: users/{uid}/mindmaps/{mindmapId}
function getUserMindmapsRef() {
    if (!currentUser) return null;
    return db.collection('users').doc(currentUser.uid).collection('mindmaps');
}

// 클라우드에 마인드맵 저장
async function saveToCloud(fileId, name, favorite) {
    const ref = getUserMindmapsRef();
    if (!ref) return;

    const data = {
        name: name,
        timestamp: new Date().toISOString(),
        favorite: favorite || false,
        nodes: deepClone(nodes),
        connections: deepClone(connections)
    };

    try {
        await ref.doc(fileId).set(data);
        updateStatus('☁️ 클라우드 저장 완료!');
    } catch (error) {
        console.error('클라우드 저장 오류:', error);
        updateStatus('❌ 클라우드 저장 실패');
    }
}

// 클라우드에서 마인드맵 불러오기
async function loadFromCloud(fileId) {
    const ref = getUserMindmapsRef();
    if (!ref) return null;

    try {
        const doc = await ref.doc(fileId).get();
        if (!doc.exists) return null;
        return doc.data();
    } catch (error) {
        console.error('클라우드 불러오기 오류:', error);
        updateStatus('❌ 클라우드 불러오기 실패');
        return null;
    }
}

// 클라우드에서 파일 삭제
async function deleteFromCloud(fileId) {
    const ref = getUserMindmapsRef();
    if (!ref) return;

    try {
        await ref.doc(fileId).delete();
    } catch (error) {
        console.error('클라우드 삭제 오류:', error);
    }
}

// 클라우드 즐겨찾기 상태 업데이트
async function updateCloudFavorite(fileId, favorite) {
    const ref = getUserMindmapsRef();
    if (!ref) return;

    try {
        await ref.doc(fileId).update({ favorite: favorite });
    } catch (error) {
        console.error('클라우드 즐겨찾기 업데이트 오류:', error);
    }
}

// 클라우드 파일 이름 변경
async function renameInCloud(fileId, newName) {
    const ref = getUserMindmapsRef();
    if (!ref) return;

    try {
        await ref.doc(fileId).update({ name: newName });
    } catch (error) {
        console.error('클라우드 이름 변경 오류:', error);
    }
}

// 클라우드 파일 목록 로드 (recentFiles 갱신)
async function loadCloudRecentFiles() {
    const ref = getUserMindmapsRef();
    if (!ref) return;

    try {
        const snapshot = await ref.orderBy('timestamp', 'desc').limit(50).get();
        recentFiles = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            timestamp: doc.data().timestamp,
            favorite: doc.data().favorite || false
        }));
        renderRecentFiles();
    } catch (error) {
        console.error('클라우드 파일 목록 오류:', error);
        updateStatus('❌ 파일 목록 불러오기 실패');
    }
}
