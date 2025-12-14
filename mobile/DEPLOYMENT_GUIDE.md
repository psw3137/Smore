# Smore 앱 배포 가이드

## 환경 설정

### 1. API 서버 URL 설정

앱은 환경에 따라 다른 API 서버 URL을 사용합니다:

- **개발 환경**: 로컬 개발 서버
- **프로덕션 환경**: 실제 배포 서버

### 2. 환경 변수 설정 방법

#### 방법 1: .env 파일 사용 (로컬 개발)

개발 시에는 `.env.development` 파일을 사용:

```bash
# .env.development
API_URL=http://10.0.2.2:3000/api/v1  # Android 에뮬레이터
# API_URL=http://YOUR_PC_IP:3000/api/v1  # 실제 기기
```

#### 방법 2: EAS Build 환경 변수 (배포)

배포 시에는 `eas.json`에서 환경 변수를 설정합니다.

## 배포 전 준비사항

### 1. 패키지 설치

```bash
cd mobile
npm install
```

### 2. 프로덕션 API 서버 URL 설정

**중요**: 배포 전에 반드시 실제 서버 URL로 변경해야 합니다!

`mobile/eas.json` 파일에서 프로덕션 환경의 API_URL을 수정:

```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://your-actual-api-server.com/api/v1"
      }
    }
  }
}
```

### 3. 백엔드 서버 배포 옵션

다음 중 하나의 방법으로 백엔드 서버를 배포해야 합니다:

#### 옵션 A: 클라우드 호스팅 (권장)
- AWS EC2, Google Cloud, Azure 등
- Heroku, Railway, Render 등의 PaaS

#### 옵션 B: 터널링 서비스 (테스트용)
- ngrok: `ngrok http 3000`
- localtunnel: `lt --port 3000`

**예시: ngrok 사용**
```bash
# 백엔드 서버 실행
cd Smore
node server.js

# 다른 터미널에서 ngrok 실행
ngrok http 3000

# ngrok이 제공하는 URL (예: https://abcd1234.ngrok.io)을
# eas.json의 API_URL에 설정
```

## APK 빌드

### 1. EAS CLI 설치 및 로그인

```bash
npm install -g eas-cli
eas login
```

### 2. 프로덕션 APK 빌드

```bash
cd mobile
npm run build:production
```

또는:

```bash
eas build -p android --profile production
```

### 3. 미리보기 APK 빌드 (테스트용)

```bash
npm run build:preview
```

### 4. APK 다운로드

빌드가 완료되면:
1. EAS 대시보드에서 APK 다운로드: https://expo.dev/accounts/psw3137/projects/smore-challenge/builds
2. 또는 터미널에 표시된 링크에서 다운로드

## 로컬 개발 환경

### Android 에뮬레이터 사용

```bash
# .env.development 파일 확인
API_URL=http://10.0.2.2:3000/api/v1

# 백엔드 서버 실행 (루트 디렉토리)
cd ..
node server.js

# 앱 실행 (mobile 디렉토리)
cd mobile
npm start
# 또는
npm run android
```

### 실제 기기 사용 (같은 Wi-Fi)

```bash
# PC의 로컬 IP 확인
# Windows: ipconfig
# Mac/Linux: ifconfig

# .env.development 수정
API_URL=http://192.168.x.x:3000/api/v1  # PC의 실제 IP

# 백엔드 서버를 0.0.0.0으로 실행
cd ..
node server.js  # server.js가 0.0.0.0:3000으로 리스닝하는지 확인

# 앱 실행
cd mobile
npm start
```

## 문제 해결

### API 연결 오류

1. **로그 확인**: 앱 시작 시 콘솔에 "🔧 API Base URL: ..."이 표시됩니다
2. **백엔드 서버 확인**: 서버가 실행 중인지 확인
3. **네트워크 확인**:
   - 에뮬레이터: `http://10.0.2.2:3000/api/v1/challenges` 접속 테스트
   - 실제 기기: PC와 같은 Wi-Fi에 연결되어 있는지 확인

### 빌드 오류

```bash
# 캐시 정리 후 재시도
cd mobile
rm -rf node_modules
npm install
eas build --clear-cache -p android --profile production
```

## 체크리스트

배포 전 확인사항:

- [ ] 백엔드 서버가 배포되었고 접근 가능한 URL이 있음
- [ ] `eas.json`의 프로덕션 API_URL이 실제 서버 URL로 설정됨
- [ ] 모든 의존성이 설치됨 (`npm install`)
- [ ] EAS CLI 로그인 완료
- [ ] 앱이 로컬에서 정상 작동함
- [ ] 빌드 프로파일 확인 (production)

## 참고사항

### 환경별 URL 확인

- **개발**: `http://10.0.2.2:3000/api/v1` (에뮬레이터)
- **개발** (실기기): `http://192.168.x.x:3000/api/v1` (로컬 IP)
- **프로덕션**: `https://your-server.com/api/v1` (실제 배포 서버)

### 보안 주의사항

- `.env` 파일은 git에 커밋되지 않습니다 (`.gitignore`에 포함)
- `.env.example` 파일만 참고용으로 공유됩니다
- 프로덕션 서버는 반드시 HTTPS를 사용하세요

### 추가 도움말

- Expo EAS Build 문서: https://docs.expo.dev/build/introduction/
- EAS 대시보드: https://expo.dev/
