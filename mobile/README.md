# Smore Mobile App

React Native + Expo 기반 숏폼 챌린지 큐레이션 모바일 앱

## 📱 구현된 기능

### ✅ 완료된 화면 및 기능

1. **홈 화면 (Home)**
   - 챌린지 그리드 뷰 (2x2)
   - 무한 스크롤
   - 정렬 기능 (최신순/인기순)
   - ChallengeCard 컴포넌트

2. **검색 화면 (Search)**
   - 실시간 검색
   - 트렌딩 키워드 표시
   - 검색 결과 그리드
   - 정렬 기능 (관련성/최신순/인기순)

3. **디자인 시스템**
   - 색상 팔레트 (theme/colors.js)
   - 타이포그래피 (theme/typography.js)
   - 간격 시스템 (theme/spacing.js)

4. **네비게이션**
   - 5개 탭 네비게이션 (홈, 검색, 카테고리, 트렌드, 프로필)

5. **API 연동**
   - Axios 기반 API 클라이언트
   - 백엔드 API 연동 준비 완료

6. **로컬 저장소**
   - AsyncStorage 기반 북마크 서비스

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
cd mobile
npm install
```

### 2. 환경 설정

**중요:** API 서버 주소를 로컬 IP로 설정해야 합니다.

`src/services/api.js` 파일에서 다음 부분을 수정하세요:

```javascript
// 현재 설정
const API_BASE_URL = 'http://192.168.1.100:3000/api/v1';

// 자신의 로컬 IP로 변경
const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000/api/v1';
```

**로컬 IP 확인 방법:**

Windows:
```bash
ipconfig
```

macOS/Linux:
```bash
ifconfig | grep "inet "
```

### 3. 백엔드 서버 실행

먼저 백엔드 서버를 실행해야 합니다:

```bash
# 프로젝트 루트 디렉토리에서
npm run dev
```

### 4. 모바일 앱 실행

```bash
cd mobile
npx expo start
```

그런 다음:
- **Android**: Expo Go 앱에서 QR 코드 스캔
- **iOS**: Expo Go 앱에서 QR 코드 스캔
- **웹**: 브라우저에서 `w` 키 입력

## 📁 프로젝트 구조

```
mobile/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js          # 홈 화면 (챌린지 그리드)
│   │   ├── SearchScreen.js        # 검색 화면
│   │   ├── CategoryScreen.js      # 카테고리 (플레이스홀더)
│   │   ├── TrendScreen.js         # 트렌드 (플레이스홀더)
│   │   └── ProfileScreen.js       # 프로필 (플레이스홀더)
│   ├── components/
│   │   └── ChallengeCard.js       # 챌린지 카드 컴포넌트
│   ├── navigation/
│   │   └── RootNavigator.js       # 탭 네비게이션
│   ├── services/
│   │   ├── api.js                 # API 클라이언트
│   │   └── storage.js             # AsyncStorage 서비스
│   ├── theme/
│   │   ├── colors.js              # 색상 정의
│   │   ├── typography.js          # 타이포그래피
│   │   └── spacing.js             # 간격 시스템
│   └── assets/                    # 이미지, 폰트 등
├── App.js                         # 앱 진입점
└── package.json
```

## 🎨 디자인 시스템

### 색상

- **배경**: `#1A1A1A` (진한 회색)
- **표면**: `#2A2A2A` (카드 배경)
- **주요 색상**: `#FF6B6B` (빨강)
- **보조 색상**: `#FFB84D` (주황)
- **강조 색상**: `#4ECDC4` (청록)

### 플랫폼 배지

- **YouTube**: `#FF0000` (빨강)
- **TikTok**: `#00F7EF` (청록)

### 난이도

- **Easy**: `#4CAF50` (초록)
- **Medium**: `#FFB84D` (주황)
- **Hard**: `#FF6B6B` (빨강)

## 🔌 API 엔드포인트

앱에서 사용하는 주요 API:

- `GET /api/v1/challenges` - 챌린지 목록
- `GET /api/v1/search` - 검색
- `GET /api/v1/search/trending` - 트렌딩 키워드
- `GET /api/v1/trends` - 트렌드 정보

## 📝 다음 단계 (향후 구현)

1. **CategoryScreen 구현**
   - 8개 카테고리 그리드
   - 카테고리별 필터링

2. **TrendScreen 구현**
   - 기간 선택 (7일, 14일, 30일)
   - 통계 카드
   - 인기 카테고리 순위

3. **ChallengeDetailScreen 구현**
   - 비디오 플레이어 (외부 링크)
   - 좋아요/댓글/공유 버튼
   - 북마크 기능

4. **ProfileScreen 구현**
   - 북마크 목록
   - 설정

## 🐛 문제 해결

### "Network Error" 발생 시

1. 백엔드 서버가 실행 중인지 확인
2. API_BASE_URL이 올바른 로컬 IP인지 확인
3. 방화벽이 포트 3000을 차단하지 않는지 확인

### "Connection refused" 발생 시

- `localhost`나 `127.0.0.1` 대신 실제 로컬 IP를 사용해야 합니다
- 예: `http://192.168.1.100:3000/api/v1`

## 📞 문의

문제가 발생하거나 질문이 있으시면 Issues를 통해 문의해주세요.
