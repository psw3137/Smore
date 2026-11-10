# Railway를 사용한 Smore 백엔드 배포 가이드

Railway를 사용하면 무료 티어로 간단하게 백엔드 서버를 배포할 수 있습니다.

## 사전 준비

- GitHub 계정
- Railway 계정 (GitHub으로 가입 가능)
- 코드가 GitHub에 푸시되어 있어야 함

## 1단계: Railway 계정 생성 및 프로젝트 생성

1. [Railway](https://railway.app) 접속
2. "Start a New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. GitHub 계정 연동 (처음이라면)
5. `Smore` 리포지토리 선택

## 2단계: MySQL 데이터베이스 추가

1. Railway 프로젝트 대시보드에서 "+ New" 클릭
2. "Database" → "Add MySQL" 선택
3. MySQL 서비스가 자동으로 생성됩니다

Railway가 자동으로 제공하는 MySQL 환경 변수:
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLDATABASE`
- `MYSQLUSER`
- `MYSQLPASSWORD`

## 3단계: 백엔드 서비스 환경 변수 설정

Railway 프로젝트의 백엔드 서비스를 클릭한 후, "Variables" 탭에서 다음 환경 변수를 추가:

```bash
# 서버 설정
NODE_ENV=production
PORT=3000

# MySQL 데이터베이스 (Railway MySQL 플러그인 사용)
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}

# YouTube API (본인의 API 키 입력)
YOUTUBE_API_KEY=your_actual_youtube_api_key

# CORS 설정
CORS_ORIGIN=*

# 로깅 레벨
LOG_LEVEL=info
```

**중요**: `YOUTUBE_API_KEY`는 실제 YouTube API 키로 교체해야 합니다.

`.env` 파일에 발급받은 YouTube API 키를 넣어 주세요 (키는 절대 커밋하지 않습니다).

## 4단계: 데이터베이스 초기화

Railway MySQL에 데이터베이스 스키마를 설정해야 합니다.

### 방법 1: Railway CLI 사용

```bash
# Railway CLI 설치
npm install -g @railway/cli

# Railway 로그인
railway login

# 프로젝트 연결
railway link

# MySQL 쉘 접속
railway run mysql -u root -p

# SQL 파일 실행 (로컬에서)
railway run mysql -u root -p smore < path/to/schema.sql
```

### 방법 2: Railway 대시보드에서 직접 실행

1. Railway 프로젝트에서 MySQL 서비스 클릭
2. "Connect" 탭에서 접속 정보 확인
3. MySQL 클라이언트(MySQL Workbench, DBeaver 등)로 접속
4. SQL 스키마 파일 실행

## 5단계: 배포 확인

1. Railway가 자동으로 코드를 배포합니다
2. "Deployments" 탭에서 배포 로그 확인
3. 배포가 완료되면 "Settings" 탭에서 "Generate Domain" 클릭
4. Railway가 제공하는 도메인이 생성됩니다 (예: `your-app.up.railway.app`)

## 6단계: API URL 확인 및 테스트

생성된 도메인으로 API 테스트:

```bash
# 헬스 체크
curl https://your-app.up.railway.app/health

# 챌린지 목록 조회
curl https://your-app.up.railway.app/api/v1/challenges
```

## 7단계: 모바일 앱 설정 업데이트

생성된 Railway URL을 모바일 앱 설정에 추가:

1. `mobile/eas.json` 파일 수정:

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

2. `.env.production` 파일 수정:

```bash
API_URL=https://your-app.up.railway.app/api/v1
```

**중요**: `your-app.up.railway.app`를 실제 Railway가 생성한 도메인으로 교체하세요.

## 8단계: APK 빌드

Railway 배포가 완료되고 URL을 설정했다면 APK를 빌드:

```bash
cd mobile
npm run build:production
```

빌드가 완료되면 EAS 대시보드에서 APK를 다운로드할 수 있습니다.

## Railway 무료 티어 제한사항

- **월 $5 크레딧** (약 500시간 실행 시간)
- 하나의 프로젝트에 여러 서비스 사용 가능
- 과제 제출 및 테스트에는 충분합니다

## 문제 해결

### 배포 실패 시

1. Railway 로그 확인:
   - "Deployments" 탭에서 로그 확인
   - 에러 메시지 확인

2. 환경 변수 확인:
   - "Variables" 탭에서 모든 변수가 올바르게 설정되었는지 확인

3. 포트 설정 확인:
   - Railway는 `PORT` 환경 변수를 자동으로 설정
   - `server.js`가 `process.env.PORT`를 사용하는지 확인 ✓

### MySQL 연결 오류

1. MySQL 서비스가 실행 중인지 확인
2. 환경 변수가 올바르게 참조되는지 확인:
   ```
   DB_HOST=${{MySQL.MYSQLHOST}}
   ```
3. 데이터베이스가 초기화되었는지 확인

### API 응답 없음

1. Railway 도메인이 생성되었는지 확인
2. 헬스 체크 엔드포인트 테스트:
   ```bash
   curl https://your-app.up.railway.app/health
   ```
3. CORS 설정이 `*`로 되어 있는지 확인

## 참고 자료

- [Railway 공식 문서](https://docs.railway.app/)
- [Railway MySQL 플러그인](https://docs.railway.app/databases/mysql)
- [Railway CLI](https://docs.railway.app/develop/cli)

## 배포 후 체크리스트

- [ ] Railway 프로젝트 생성 완료
- [ ] MySQL 데이터베이스 추가 완료
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 스키마 초기화 완료
- [ ] 배포 성공 및 도메인 생성 완료
- [ ] API 테스트 성공
- [ ] `mobile/eas.json`에 Railway URL 설정 완료
- [ ] APK 빌드 완료
