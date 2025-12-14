# 배포 빠른 시작 가이드

과제 제출을 위한 APK 빌드 및 배포를 위한 간단한 단계별 가이드입니다.

## 📝 개요

현재 앱이 하드코딩된 로컬 IP 주소를 사용하여 다른 환경에서 작동하지 않는 문제를 해결했습니다.
이제 환경 변수를 사용하여 개발/프로덕션 환경을 분리할 수 있습니다.

## ✅ 완료된 작업

1. **환경 변수 시스템 구축**
   - `.env.development`, `.env.production` 파일 생성
   - `app.config.js`로 환경별 설정 지원
   - `api.js`에서 동적 API URL 로드

2. **백엔드 Railway 배포 준비**
   - `database.js`에 `DB_PORT` 추가 (Railway 호환)
   - `.env.example` 업데이트

3. **EAS Build 설정**
   - `eas.json`에 환경별 빌드 프로파일 추가
   - production 프로파일에 API URL 환경 변수 설정

4. **문서 작성**
   - `RAILWAY_DEPLOYMENT.md` - Railway 배포 상세 가이드
   - `mobile/DEPLOYMENT_GUIDE.md` - 모바일 배포 가이드
   - `README.md` 업데이트

## 🚀 배포 단계 (요약)

### 1단계: 백엔드 Railway 배포 (약 10분)

1. [Railway](https://railway.app)에 GitHub 계정으로 로그인
2. "Start a New Project" → GitHub에서 Smore 리포지토리 선택
3. "+ New" → "Database" → "Add MySQL"
4. 백엔드 서비스의 "Variables" 탭에서 환경 변수 설정:

```bash
NODE_ENV=production
PORT=3000
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
CORS_ORIGIN=*
LOG_LEVEL=info
```

5. "Settings" → "Generate Domain" 클릭
6. 생성된 URL 복사 (예: `https://your-app.up.railway.app`)

### 2단계: 데이터베이스 초기화

Railway MySQL에 스키마 적용 (MySQL Workbench 또는 Railway CLI 사용):

```bash
# Railway CLI 사용
npm install -g @railway/cli
railway login
railway link
railway run mysql -u root -p smore < MySQL_schema.sql

# 데이터 수집 (선택사항)
railway run node clear-and-collect.js
```

### 3단계: 모바일 앱 설정

`mobile/eas.json` 파일의 프로덕션 URL 업데이트:

```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://your-app.up.railway.app/api/v1"
      }
    }
  }
}
```

**중요**: `your-app.up.railway.app`를 실제 Railway URL로 교체하세요!

### 4단계: APK 빌드 (약 10-20분)

```bash
cd mobile
npm install  # 의존성 설치 (처음 한 번만)
npm run build:production
```

빌드가 완료되면 터미널에 표시된 링크 또는 [EAS 대시보드](https://expo.dev)에서 APK 다운로드

## 🔍 테스트

배포된 API 테스트:

```bash
# 헬스 체크
curl https://your-app.up.railway.app/health

# 챌린지 목록
curl https://your-app.up.railway.app/api/v1/challenges
```

## 📱 APK 설치

1. Android 기기에 APK 파일 전송
2. 설치 및 실행
3. 앱이 Railway 백엔드와 통신하는지 확인

## ❓ 문제 해결

### Railway 배포 실패
- "Deployments" 탭에서 로그 확인
- 환경 변수가 올바르게 설정되었는지 확인

### 앱에서 API 연결 실패
- Railway 도메인이 생성되었는지 확인
- `eas.json`의 API_URL이 올바른지 확인
- Railway 서버가 실행 중인지 대시보드에서 확인

### APK 빌드 실패
```bash
cd mobile
rm -rf node_modules
npm install
npm run build:production
```

## 📚 상세 문서

- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Railway 배포 상세 가이드
- [mobile/DEPLOYMENT_GUIDE.md](./mobile/DEPLOYMENT_GUIDE.md) - 모바일 배포 가이드
- [mobile/BUILD_GUIDE.md](./mobile/BUILD_GUIDE.md) - APK 빌드 가이드

## 💡 중요 사항

- Railway 무료 티어: 월 $5 크레딧 (과제 제출에 충분)
- Railway URL은 변경되지 않으므로 한 번만 APK를 빌드하면 됩니다
- 로컬 개발 시에는 기존처럼 `.env.development` 사용

## ✅ 체크리스트

배포 전 확인:
- [ ] Railway 프로젝트 생성 및 배포 완료
- [ ] Railway MySQL 데이터베이스 추가
- [ ] 환경 변수 모두 설정
- [ ] Railway 도메인 생성 확인
- [ ] API 테스트 성공 (`curl` 명령)
- [ ] `mobile/eas.json`에 Railway URL 설정
- [ ] APK 빌드 완료
- [ ] 실제 기기에서 APK 테스트
