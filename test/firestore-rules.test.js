// Firestore 에뮬레이터에 실제 규칙을 로드하고 동작을 검증하는 스크립트 (npm 의존성 없음)
const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '127.0.0.1';
const PORT = 8080;
const PROJECT = 'demo-rulestest';
const RULES_PATH = path.join(__dirname, '..', 'firestore.rules');

function request(method, urlPath, body, headers) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        host: HOST,
        port: PORT,
        path: urlPath,
        method,
        headers: Object.assign(
          { 'Content-Type': 'application/json' },
          data ? { 'Content-Length': Buffer.byteLength(data) } : {},
          headers || {}
        ),
      },
      (res) => {
        let out = '';
        res.on('data', (c) => (out += c));
        res.on('end', () => resolve({ status: res.statusCode, body: out }));
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// 에뮬레이터가 받아들이는 서명 없는 JWT 생성
function fakeToken(uid) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    iss: `https://securetoken.google.com/${PROJECT}`,
    aud: PROJECT,
    auth_time: now,
    user_id: uid,
    sub: uid,
    iat: now,
    exp: now + 3600,
    firebase: { identities: {}, sign_in_provider: 'google.com' },
  };
  return `${b64(header)}.${b64(payload)}.`;
}

const authHeader = (uid) => (uid ? { Authorization: `Bearer ${fakeToken(uid)}` } : {});

const docPath = (uid) =>
  `/v1/projects/${PROJECT}/databases/(default)/documents/users/${uid}/mindmaps`;

function validMindmap(name) {
  return {
    fields: {
      name: { stringValue: name },
      timestamp: { stringValue: new Date().toISOString() },
      favorite: { booleanValue: false },
      nodes: { arrayValue: { values: [] } },
      connections: { arrayValue: { values: [] } },
    },
  };
}

const results = [];
function check(label, actualAllowed, expectAllowed, detail) {
  const pass = actualAllowed === expectAllowed;
  results.push({ label, pass, actualAllowed, expectAllowed, detail });
  const mark = pass ? 'PASS' : 'FAIL';
  console.log(
    `[${mark}] ${label} — 기대:${expectAllowed ? '허용' : '차단'} 실제:${actualAllowed ? '허용' : '차단'}`
  );
  if (!pass && detail) console.log(`        ${detail.slice(0, 300)}`);
}

(async () => {
  // 1) 실제 규칙을 에뮬레이터에 로드하고 컴파일 오류 확인
  const rules = fs.readFileSync(RULES_PATH, 'utf8');
  const load = await request('PUT', `/emulator/v1/projects/${PROJECT}:securityRules`, {
    rules: { files: [{ name: 'firestore.rules', content: rules }] },
  });
  if (load.status !== 200) {
    console.log('규칙 컴파일 실패:');
    console.log(load.body);
    process.exit(1);
  }
  console.log('규칙 컴파일 성공\n');

  // 2) 동작 테스트
  // 본인 문서 생성 → 허용
  let r = await request('POST', `${docPath('userA')}?documentId=m1`, validMindmap('내 마인드맵'), authHeader('userA'));
  check('본인 문서 생성', r.status === 200, true, r.body);

  // 본인 문서 읽기 → 허용
  r = await request('GET', `${docPath('userA')}/m1`, null, authHeader('userA'));
  check('본인 문서 읽기', r.status === 200, true, r.body);

  // 타인이 읽기 → 차단
  r = await request('GET', `${docPath('userA')}/m1`, null, authHeader('userB'));
  check('타인 문서 읽기', r.status === 200, false, r.body);

  // 비로그인 읽기 → 차단
  r = await request('GET', `${docPath('userA')}/m1`, null, {});
  check('비로그인 읽기', r.status === 200, false, r.body);

  // 타인이 쓰기 → 차단
  r = await request('POST', `${docPath('userA')}?documentId=m2`, validMindmap('침입'), authHeader('userB'));
  check('타인 문서 생성', r.status === 200, false, r.body);

  // 이름 변경 (부분 업데이트) → 허용  [renameInCloud 경로]
  r = await request(
    'PATCH',
    `${docPath('userA')}/m1?updateMask.fieldPaths=name`,
    { fields: { name: { stringValue: '새 이름' } } },
    authHeader('userA')
  );
  check('본인 문서 이름 변경(부분 업데이트)', r.status === 200, true, r.body);

  // 즐겨찾기 토글 (부분 업데이트) → 허용  [updateCloudFavorite 경로]
  r = await request(
    'PATCH',
    `${docPath('userA')}/m1?updateMask.fieldPaths=favorite`,
    { fields: { favorite: { booleanValue: true } } },
    authHeader('userA')
  );
  check('본인 문서 즐겨찾기 변경(부분 업데이트)', r.status === 200, true, r.body);

  // 허용되지 않은 필드 추가 → 차단
  const extra = validMindmap('필드추가');
  extra.fields.evil = { stringValue: 'x' };
  r = await request('POST', `${docPath('userA')}?documentId=m3`, extra, authHeader('userA'));
  check('미허용 필드 포함 생성', r.status === 200, false, r.body);

  // 타입이 틀린 문서 → 차단
  const badType = validMindmap('타입오류');
  badType.fields.favorite = { stringValue: 'true' };
  r = await request('POST', `${docPath('userA')}?documentId=m4`, badType, authHeader('userA'));
  check('favorite 타입 오류 생성', r.status === 200, false, r.body);

  // 다른 컬렉션 접근 → 차단
  r = await request(
    'POST',
    `/v1/projects/${PROJECT}/databases/(default)/documents/other?documentId=x`,
    { fields: { a: { stringValue: 'b' } } },
    authHeader('userA')
  );
  check('그 외 컬렉션 쓰기', r.status === 200, false, r.body);

  // 컬렉션 목록 조회 → 본인 허용 / 타인 차단  [loadCloudRecentFiles 경로]
  r = await request('GET', docPath('userA'), null, authHeader('userA'));
  check('본인 컬렉션 목록 조회', r.status === 200, true, r.body);

  r = await request('GET', docPath('userA'), null, authHeader('userB'));
  check('타인 컬렉션 목록 조회', r.status === 200, false, r.body);

  // orderBy + limit 쿼리 → 허용  [loadCloudRecentFiles의 실제 쿼리]
  const query = {
    structuredQuery: {
      from: [{ collectionId: 'mindmaps' }],
      orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' }],
      limit: 50,
    },
  };
  r = await request(
    'POST',
    `/v1/projects/${PROJECT}/databases/(default)/documents/users/userA:runQuery`,
    query,
    authHeader('userA')
  );
  check('본인 orderBy+limit 쿼리', r.status === 200 && !r.body.includes('PERMISSION_DENIED'), true, r.body);

  r = await request(
    'POST',
    `/v1/projects/${PROJECT}/databases/(default)/documents/users/userA:runQuery`,
    query,
    authHeader('userB')
  );
  check('타인 orderBy+limit 쿼리', r.status === 200 && !r.body.includes('PERMISSION_DENIED'), false, r.body);

  // 본인 문서 삭제 → 허용
  r = await request('DELETE', `${docPath('userA')}/m1`, null, authHeader('userA'));
  check('본인 문서 삭제', r.status === 200, true, r.body);

  const failed = results.filter((x) => !x.pass);
  console.log(`\n총 ${results.length}건 중 ${results.length - failed.length}건 통과, ${failed.length}건 실패`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
