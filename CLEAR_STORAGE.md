# 🔧 localStorage 초기화 방법

## 문제 원인
기존에 저장된 마인드맵 파일들이 배열 참조를 공유하는 버그가 있는 버전으로 저장되었습니다.
수정된 코드가 제대로 동작하려면 localStorage를 초기화해야 합니다.

## 해결 방법

### 방법 1: 개발자 도구에서 직접 삭제 (권장)

1. **F12** 키를 눌러 개발자 도구를 엽니다
2. **Console** 탭으로 이동합니다
3. 다음 명령어를 복사해서 붙여넣고 **Enter**:

```javascript
// 저장된 모든 마인드맵 파일 삭제
Object.keys(localStorage).forEach(key => {
    if (key.startsWith('mindmap_file_')) {
        localStorage.removeItem(key);
        console.log('Deleted:', key);
    }
});
// 최근 파일 목록 삭제
localStorage.removeItem('mindmap_recent_files');
console.log('✅ All mindmap files cleared!');
```

4. **F5**로 페이지 새로고침

### 방법 2: 애플리케이션 탭에서 삭제

1. **F12** 키를 눌러 개발자 도구를 엽니다
2. **Application** (또는 **애플리케이션**) 탭으로 이동
3. 왼쪽 메뉴에서 **Local Storage** → **file://** (또는 도메인) 선택
4. `mindmap_file_`로 시작하는 항목들을 모두 선택하여 삭제
5. `mindmap_recent_files` 항목도 삭제
6. **F5**로 페이지 새로고침

### 방법 3: 완전 초기화 (AI 설정도 함께 삭제)

**주의**: 이 방법은 AI API 키와 모든 설정도 삭제합니다!

```javascript
// 모든 localStorage 삭제
localStorage.clear();
console.log('✅ All localStorage cleared!');
```

## 확인 방법

초기화 후 다음을 테스트해보세요:

1. Node 1 생성 → 편집 → 도메인: `github.com` 입력 → 저장
2. Node 2 생성 → 편집 → 도메인: `stackoverflow.com` 입력 → 저장
3. Node 1 더블클릭 → 도메인이 `github.com`으로 표시되는지 확인 ✅
4. Node 2 더블클릭 → 도메인이 `stackoverflow.com`으로 표시되는지 확인 ✅
5. 마인드맵 저장 → 파일 이름 입력 → 저장
6. 브라우저 새로고침 (F5)
7. 저장한 파일 로드
8. Node 1, Node 2의 도메인이 각각 올바르게 표시되는지 확인 ✅

## 버그 수정 내역

### 1. `ui.js` - saveNodeEdit()
- `saveState()`를 노드 수정 **전**으로 이동
- searchDomains 배열을 `.slice()`로 복사

### 2. `storage.js` - loadFileItem()
- `nodes = parsed.nodes` → `nodes = deepClone(parsed.nodes)`
- 각 노드의 `searchDomains` 배열을 명시적으로 복사 (`[...node.searchDomains]`)

### 3. `ui.js` - openEditModal()
- searchDomains 로드 시 안전하게 처리

이제 각 노드가 **독립적인 searchDomains 배열**을 갖습니다! 🎉
