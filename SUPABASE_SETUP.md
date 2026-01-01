# Supabase 설정 가이드

## 🔧 Supabase API 키 설정

1. Supabase 대시보드에서 **Settings** → **API** 메뉴로 이동
2. 다음 정보를 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (긴 문자열)

3. `js/supabase-config.js` 파일을 열어서 다음 부분을 수정:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co'; // 여기에 Project URL 입력
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // 여기에 anon key 입력
```

## ✅ 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 생성 (SQL 실행)
- [ ] API 키를 `supabase-config.js`에 입력
- [ ] 로컬에서 테스트
- [ ] GitHub에 커밋 및 푸시

## 🚀 배포

설정이 완료되면:

```bash
git add .
git commit -m "Add Supabase cloud sync feature"
git push
```

GitHub Pages에 자동으로 배포됩니다!

## 🔐 보안 주의사항

⚠️ **ANON KEY는 공개해도 안전합니다** (Row Level Security로 보호됨)
- 각 사용자는 자신의 데이터만 접근 가능
- Supabase의 RLS 정책이 보안을 담당

## 📖 사용 방법

1. **회원가입/로그인**
   - 이메일 또는 Google/GitHub 계정 사용

2. **마인드맵 저장**
   - "클라우드 저장" 버튼 클릭
   - 파일 이름 입력

3. **다른 기기에서 접속**
   - 동일한 계정으로 로그인
   - 자동으로 모든 파일 동기화

## 💡 문제 해결

### Supabase 라이브러리 로딩 실패
- 브라우저 콘솔에 에러가 표시되면 CDN 링크 확인
- 인터넷 연결 확인

### 로그인 안 됨
- Supabase 프로젝트 설정에서 Email Provider 활성화 확인
- API 키가 올바르게 입력되었는지 확인

### 파일 목록이 안 보임
- 로그인 상태 확인
- 브라우저 콘솔에서 에러 메시지 확인
