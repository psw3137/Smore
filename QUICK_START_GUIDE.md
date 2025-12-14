# Smore 앱 빠른 시작 가이드

> 이 문서는 개발이 완료된 Smore 앱을 테스트하고 APK를 빌드하기 위한 단계별 가이드입니다.

---

## 📋 목차

1. [사전 준비사항](#사전-준비사항)
2. [백엔드 서버 실행](#백엔드-서버-실행)
3. [모바일 앱 테스트](#모바일-앱-테스트)
4. [APK 빌드](#apk-빌드)
5. [문제 해결](#문제-해결)

---

## 사전 준비사항

### 필수 소프트웨어

- ✅ Node.js 18 이상
- ✅ MySQL 8.0 이상
- ✅ Git
- ✅ Android 기기 또는 Expo Go 앱

### 확인 방법

```bash
# Node.js 버전 확인
node --version

# MySQL 버전 확인
mysql --version

# Git 버전 확인
git --version
```

---

## 백엔드 서버 실행

### Step 1: 의존성 확인

```bash
# 프로젝트 루트에서
npm install
```

### Step 2: 데이터베이스 확인

MySQL에 접속하여 `smore` 데이터베이스가 존재하는지 확인:

```bash
mysql -u root -p
```

```sql
SHOW DATABASES;
USE smore;
SHOW TABLES;
```

테이블 목록:
- categories (8개 카테고리)
- challenges (챌린지 데이터)
- tags
- challenge_tags

### Step 3: 백엔드 서버 시작

```bash
# 프로젝트 루트에서
npm start
# 또는
node server.js
```

**성공 메시지:**
```
🚀 Smore Backend Server is running on port 3000
📍 Environment: development
🔗 API Base URL: http://localhost:3000/api/v1
💚 Health Check: http://localhost:3000/health
```

### Step 4: API 테스트

새 터미널에서:

```bash
# Health check
curl http://localhost:3000/health

# 카테고리 목록
curl http://localhost:3000/api/v1/categories

# 챌린지 목록 (처음 20개)
curl http://localhost:3000/api/v1/challenges
```

---

## 모바일 앱 테스트

### Step 1: 모바일 디렉토리로 이동

```bash
cd mobile
```

### Step 2: 의존성 설치 확인

```bash
npm install
```

### Step 3: API 서버 주소 확인

`mobile/src/services/api.js` 파일 확인:

```javascript
const API_BASE_URL = 'http://YOUR_PC_IP:3000/api/v1';
```

**중요**: 실제 디바이스에서 테스트할 경우, 컴퓨터의 로컬 IP로 변경 필요!

#### Windows에서 IP 확인
```bash
ipconfig
# "IPv4 주소" 확인
```

#### Mac/Linux에서 IP 확인
```bash
ifconfig
# "inet" 주소 확인
```

### Step 4: 앱 실행

```bash
npx expo start
```

또는

```bash
npm start
```

### Step 5: QR 코드 스캔

1. **Android**: Expo Go 앱 설치 후 QR 스캔
2. **iOS**: 카메라 앱으로 QR 스캔

### Step 6: 기능 테스트 체크리스트

#### 홈 화면
- [ ] Daily Picks 표시 확인
- [ ] 챌린지 카드 그리드 표시
- [ ] 정렬 버튼 (최신순/인기순) 동작
- [ ] Pull-to-refresh 동작
- [ ] 무한 스크롤 동작

#### 카테고리 화면
- [ ] 8개 카테고리 그리드 표시
- [ ] 카테고리 선택 → 챌린지 목록 표시
- [ ] 뒤로가기 버튼 동작

#### 검색 화면
- [ ] 검색창에 키워드 입력
- [ ] 검색 결과 표시
- [ ] 정렬 옵션 (관련도/최신순/인기순) 동작

#### 트렌드 화면
- [ ] 기간 선택 버튼 (7일/14일/30일)
- [ ] 통계 카드 표시 (조회수, 좋아요, 챌린지 수)
- [ ] 카테고리 순위 표시
- [ ] Top 10 챌린지 표시

#### 프로필 화면
- [ ] 북마크 목록 표시
- [ ] 저장 개수 표시

#### 재생 화면
- [ ] 챌린지 카드 클릭 → 전체 화면 재생
- [ ] YouTube 영상 재생
- [ ] 세로 스와이프로 다음/이전 영상
- [ ] 화면 터치 → UI 표시/숨김
- [ ] 3초 후 자동 숨김 동작
- [ ] 북마크 버튼 동작
- [ ] YouTube 앱에서 보기 버튼 동작
- [ ] 뒤로가기 버튼 동작

---

## APK 빌드

### Step 1: EAS CLI 설치 (최초 1회)

```bash
npm install -g eas-cli
```

### Step 2: Expo 계정 생성 및 로그인

1. https://expo.dev 접속하여 계정 생성
2. 터미널에서 로그인:

```bash
eas login
```

### Step 3: 프로젝트 설정 (최초 1회)

```bash
cd mobile
eas build:configure
```

### Step 4: APK 빌드 실행

#### 방법 1: 간단한 명령어

```bash
npm run build:preview
```

#### 방법 2: 직접 명령어

```bash
eas build -p android --profile preview
```

### Step 5: 빌드 모니터링

터미널에 표시되는 URL로 접속하여 빌드 진행 상황 확인:
```
https://expo.dev/accounts/[username]/projects/smore-challenge/builds
```

**빌드 시간**: 약 10~20분 소요

### Step 6: APK 다운로드

빌드 완료 후:
1. 터미널에 표시되는 URL 클릭
2. "Download" 버튼 클릭
3. APK 파일 다운로드

### Step 7: Android 기기에 설치

1. APK 파일을 Android 기기로 전송
2. 기기에서 파일 열기
3. "알 수 없는 출처" 허용
4. 설치 진행

---

## 문제 해결

### 백엔드 관련

#### 문제: MySQL 연결 실패
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**해결**:
1. MySQL 서버가 실행 중인지 확인
2. `.env` 파일의 DB 설정 확인
3. MySQL 포트 확인 (기본값: 3306)

#### 문제: 데이터가 없음
```
{"challenges": [], "total": 0}
```

**해결**:
```bash
node clear-and-collect.js
```

### 모바일 앱 관련

#### 문제: 앱이 백엔드에 연결되지 않음
```
Network Error / Connection Refused
```

**해결**:
1. 백엔드 서버가 실행 중인지 확인
2. `mobile/src/services/api.js`의 IP 주소 확인
3. 방화벽 설정 확인
4. 같은 Wi-Fi 네트워크에 연결되어 있는지 확인

#### 문제: QR 코드 스캔이 안됨

**해결**:
1. Expo Go 앱이 최신 버전인지 확인
2. 터미널에서 표시된 URL을 직접 입력
3. LAN 모드로 전환: `npx expo start --lan`

#### 문제: YouTube 영상이 재생되지 않음

**해결**:
- 일부 영상은 embed가 허용되지 않음 (정상 동작)
- "YouTube에서 보기" 버튼 클릭하여 YouTube 앱에서 시청

### APK 빌드 관련

#### 문제: 빌드 실패
```
Build failed
```

**해결**:
1. 캐시 클리어 후 재시도:
```bash
eas build --clear-cache -p android --profile preview
```

2. `eas.json`과 `app.json` 설정 확인

#### 문제: 로그인 오류

**해결**:
```bash
eas logout
eas login
```

---

## 📂 주요 파일 위치

### 설정 파일
```
📁 프로젝트 루트
├── .env                    # 백엔드 환경 변수 (생성 필요)
├── server.js               # 백엔드 진입점
├── MySQL_schema.sql        # DB 스키마
└── 📁 mobile
    ├── app.json            # Expo 설정
    ├── eas.json            # EAS Build 설정
    ├── package.json        # 의존성
    └── BUILD_GUIDE.md      # 상세 빌드 가이드
```

### 소스 파일
```
📁 mobile/src
├── screens/                # 화면 컴포넌트
├── components/             # 재사용 컴포넌트
├── services/               # API 클라이언트, 저장소
├── utils/                  # 유틸리티 함수
├── constants/              # 상수
└── theme/                  # 디자인 시스템
```

---

## 📚 추가 문서

- **BUILD_GUIDE.md**: APK 빌드 상세 가이드
- **PRESENTATION_OUTLINE.md**: PPT 발표 자료 구조
- **PROJECT_SUMMARY.md**: 프로젝트 전체 요약
- **README.md**: 프로젝트 전체 문서

---

## ✅ 최종 체크리스트

### 테스트 전
- [ ] Node.js, MySQL 설치 확인
- [ ] 백엔드 의존성 설치
- [ ] 모바일 의존성 설치
- [ ] MySQL 데이터베이스 설정
- [ ] 초기 데이터 수집 (clear-and-collect.js)

### 테스트 중
- [ ] 백엔드 서버 실행
- [ ] API 응답 확인
- [ ] 모바일 앱 실행
- [ ] IP 주소 설정 확인
- [ ] 모든 화면 기능 테스트

### APK 빌드
- [ ] EAS CLI 설치
- [ ] Expo 계정 로그인
- [ ] 빌드 설정 확인
- [ ] APK 빌드 실행
- [ ] APK 다운로드 및 설치

### 발표 준비
- [ ] 스크린샷 촬영
- [ ] 데모 영상 녹화 (선택)
- [ ] PPT 자료 준비
- [ ] 발표 연습

---

## 🎯 다음 단계

1. **지금 즉시**
   - 백엔드 서버 실행
   - 모바일 앱 테스트
   - 오류 확인 및 수정

2. **APK 빌드 전**
   - 모든 기능 테스트 완료
   - IP 주소를 공개 서버로 변경 (필요 시)
   - app.json 설정 최종 확인

3. **발표 준비**
   - PRESENTATION_OUTLINE.md 참고
   - 스크린샷 촬영
   - PPT 작성

---

**작성일**: 2024-12-14
**최종 업데이트**: 완료된 최적화 작업 반영

**문의**: 문제 발생 시 프로젝트 문서를 참고하세요.
