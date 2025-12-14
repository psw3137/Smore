# Smore 모바일 앱 APK 빌드 가이드

## 📋 사전 준비사항

### 1. EAS CLI 설치
```bash
npm install -g eas-cli
```

### 2. Expo 계정 생성 및 로그인
```bash
# Expo 계정이 없다면 https://expo.dev 에서 회원가입
eas login
```

## 🚀 APK 빌드 방법

### 방법 1: 명령어로 빌드

#### 개발용 APK 빌드
```bash
cd mobile
npm run build:preview
```

#### 프로덕션 APK 빌드
```bash
npm run build:production
```

### 방법 2: 단계별 빌드

#### Step 1: 프로젝트 설정 (최초 1회만)
```bash
cd mobile
eas build:configure
```

#### Step 2: Android APK 빌드
```bash
eas build -p android --profile preview
```

## 📦 빌드 프로파일

### Preview 프로파일
- **용도**: 테스트 및 배포 전 확인
- **빌드 타입**: APK
- **설치**: 바로 설치 가능

### Production 프로파일
- **용도**: Google Play Store 배포
- **빌드 타입**: APK
- **설치**: 바로 설치 가능

## 🔧 주요 설정 파일

### app.json
```json
{
  "expo": {
    "name": "Smore",
    "slug": "smore-challenge",
    "version": "1.0.0",
    "android": {
      "package": "com.smore.challenge",
      "versionCode": 1
    }
  }
}
```

### eas.json
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## 📱 APK 설치 방법

### 방법 1: EAS 대시보드에서 다운로드
1. 빌드 완료 후 터미널에 표시되는 URL 접속
2. "Download" 버튼 클릭
3. APK 파일 다운로드
4. Android 기기로 전송 후 설치

### 방법 2: QR 코드 스캔
1. 빌드 완료 후 표시되는 QR 코드 스캔
2. APK 직접 다운로드 및 설치

## ⚠️ 주의사항

### Android 보안 설정
- APK 설치 시 "알 수 없는 출처" 허용 필요
- 설정 > 보안 > 알 수 없는 앱 설치 허용

### 인터넷 권한
- 앱이 정상 작동하려면 인터넷 연결 필요
- 백엔드 서버가 실행 중이어야 함

### API 서버 설정
현재 API URL: `http://YOUR_PC_IP:3000/api/v1`
- 실제 배포 시 공개 IP 또는 도메인으로 변경 필요
- `app.json`의 `extra.apiUrl` 수정

## 🐛 문제 해결

### 빌드 실패 시
```bash
# 캐시 클리어
eas build:clear-cache

# 다시 빌드
eas build -p android --profile preview --clear-cache
```

### 로그인 문제
```bash
eas logout
eas login
```

### 의존성 문제
```bash
cd mobile
rm -rf node_modules
npm install
```

## 📊 빌드 시간
- 일반적으로 10~20분 소요
- EAS 빌드 서버의 상황에 따라 다를 수 있음

## 🔗 유용한 링크
- [EAS Build 공식 문서](https://docs.expo.dev/build/introduction/)
- [Expo 대시보드](https://expo.dev/)
- [EAS Build 상태 확인](https://expo.dev/accounts/[username]/projects/smore-challenge/builds)

## ✅ 빌드 성공 체크리스트
- [ ] EAS CLI 설치 완료
- [ ] Expo 계정 로그인 완료
- [ ] app.json에 Android 패키지명 설정
- [ ] eas.json 파일 생성
- [ ] 백엔드 서버 실행 중
- [ ] 빌드 명령어 실행
- [ ] APK 다운로드 및 설치 완료
