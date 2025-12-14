# Smore - 숏폼 챌린지 모바일 앱 프로젝트 요약

## 📱 프로젝트 개요

**프로젝트 명**: Smore (Short-form More)
**프로젝트 유형**: React Native 모바일 앱 + Node.js 백엔드
**개발 기간**: 2024년
**목적**: 숏폼 챌린지 탐색 및 참여를 위한 통합 플랫폼

---

## 🎯 주요 기능

### 1. 홈 화면
- 오늘의 추천 챌린지 (Daily Picks)
- 최신/인기순 챌린지 목록
- 정렬 옵션 전환
- Pull-to-refresh 새로고침
- 무한 스크롤 (페이지네이션)

### 2. 카테고리 화면
- 8개 카테고리 제공
  - 댄스 (Dance)
  - 립싱크 (Lip-sync)
  - 운동 (Exercise)
  - 요리 (Cooking)
  - 코미디 (Comedy)
  - 뷰티 (Beauty)
  - 게임 (Gaming)
  - 기타 (Other)
- 카테고리별 챌린지 필터링
- 시각적 아이콘 및 그라데이션

### 3. 검색 화면
- 실시간 키워드 검색
- 검색 결과 정렬 (관련도/최신순/인기순)
- 검색 히스토리 (향후 추가 예정)

### 4. 트렌드 화면
- 기간별 통계 (7일/14일/30일)
- 총 조회수/좋아요/챌린지 수 표시
- 카테고리별 순위
- 인기 챌린지 Top 10

### 5. 재생 화면
- YouTube Shorts 스타일 전체 화면 재생
- 세로 스와이프로 다음/이전 영상
- 자동 숨김/표시 UI (3초 후 자동 숨김)
- 북마크 기능
- YouTube 바로가기 버튼
- 에러 처리 (embed_not_allowed 등)

### 6. 프로필 화면
- 저장한 챌린지 (북마크) 목록
- 로컬 저장소 기반

---

## 🛠️ 기술 스택

### Frontend (Mobile)
```
- React Native 0.81.5
- React 19.1.0
- Expo ~54.0.29
- React Navigation 7.x
  - Bottom Tabs Navigator
  - Stack Navigator
- Axios 1.13.2 (HTTP 클라이언트)
- AsyncStorage 2.2.0 (로컬 저장소)
- React Native YouTube iFrame 2.4.1
- Expo Linear Gradient
- Expo Linking
- Expo Splash Screen
```

### Backend (Server)
```
- Node.js
- Express.js
- MySQL
- RESTful API
```

### 개발 도구
```
- Git/GitHub
- EAS Build (APK 빌드)
- Expo CLI
```

---

## 📂 프로젝트 구조

### 모바일 앱 구조
```
mobile/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── ChallengeCard.js        # 챌린지 카드 (React.memo 최적화)
│   │   ├── GradientHeader.js       # 공통 헤더
│   │   ├── ListStates.js           # 로딩/빈 상태
│   │   ├── ChallengeGrid.js        # 그리드 레이아웃
│   │   ├── CategoryRankingRow.js   # 트렌드 순위
│   │   ├── StatCard.js             # 통계 카드
│   │   └── SplashScreen.js         # 스플래시 화면
│   ├── screens/             # 화면 컴포넌트
│   │   ├── HomeScreen.js           # 홈
│   │   ├── CategoryScreen.js       # 카테고리
│   │   ├── SearchScreen.js         # 검색
│   │   ├── TrendScreen.js          # 트렌드
│   │   ├── ProfileScreen.js        # 프로필
│   │   └── ChallengeDetailScreen.js # 재생
│   ├── navigation/          # 네비게이션
│   │   └── RootNavigator.js        # 탭/스택 네비게이터
│   ├── services/            # 서비스 레이어
│   │   ├── api.js                  # API 클라이언트
│   │   └── storage.js              # 로컬 저장소
│   ├── utils/               # 유틸리티 함수
│   │   ├── formatters.js           # 숫자/날짜 포맷팅
│   │   ├── youtube.js              # YouTube URL 처리
│   │   └── errorHandler.js         # 에러 처리
│   ├── constants/           # 상수
│   │   └── app.js                  # 앱 전역 상수
│   └── theme/               # 테마
│       ├── colors.js               # 색상 팔레트
│       ├── spacing.js              # 간격
│       └── typography.js           # 타이포그래피
├── assets/                  # 이미지/아이콘
├── app.json                 # Expo 설정
├── eas.json                 # EAS Build 설정
├── package.json             # 의존성
└── BUILD_GUIDE.md           # 빌드 가이드
```

### 백엔드 구조
```
src/
├── controllers/             # 컨트롤러
│   ├── categoryController.js
│   ├── challengeController.js
│   └── recommendationController.js
├── routes/                  # 라우트
│   ├── categoryRoutes.js
│   ├── challengeRoutes.js
│   └── recommendationRoutes.js
└── services/                # 서비스
    ├── categoryService.js
    ├── challengeService.js
    └── recommendationService.js
```

---

## 🗄️ 데이터베이스 설계

### ERD
```
categories (카테고리)
├── category_id (PK)
├── name
├── description
└── icon

challenges (챌린지)
├── challenge_id (PK)
├── category_id (FK → categories)
├── title
├── video_url
├── thumbnail_url
├── channel_name
├── view_count
├── like_count
├── difficulty
├── platform
└── created_at
```

---

## 🔌 API 엔드포인트

### 카테고리
- `GET /api/v1/categories` - 카테고리 목록
- `GET /api/v1/categories/:id/challenges` - 카테고리별 챌린지

### 챌린지
- `GET /api/v1/challenges` - 챌린지 목록
- `GET /api/v1/challenges/search` - 검색
- `GET /api/v1/challenges/trending` - 트렌딩

### 추천
- `GET /api/v1/recommendations/daily-picks` - 오늘의 추천

---

## ⚡ 최적화 내역

### 코드 최적화
1. **중복 코드 제거**
   - formatNumber, getYoutubeVideoId 함수 → utils로 이동
   - 중복된 로딩/빈 상태 렌더링 → ListStates 컴포넌트로 통합

2. **재사용 컴포넌트 생성**
   - GradientHeader: 공통 헤더 컴포넌트
   - ListStates: 로딩/빈 상태/에러 상태
   - ChallengeGrid: 2열 그리드 레이아웃

3. **성능 최적화**
   - ChallengeCard에 React.memo 적용
   - 이미지 캐싱 (`cache="force-cache"`)
   - 상수 관리 체계화 (constants/app.js)

### 사용자 경험 개선
1. **재생 화면 UI**
   - 화면 터치 시 UI 토글
   - 3초 후 자동 숨김
   - 부드러운 페이드 애니메이션

2. **그라데이션 최적화**
   - 전체 화면 너비로 확장
   - 잘림 현상 제거

---

## 📊 프로젝트 통계

### 코드 통계
- **총 파일 수**: ~30개
- **컴포넌트 수**: 15개
- **화면 수**: 6개
- **API 엔드포인트**: 8개
- **유틸리티 함수**: 10개+

### 주요 라이브러리
- React Native 관련: 10개
- UI/UX 관련: 5개
- 데이터 관리: 2개

---

## 🎨 디자인 시스템

### 색상 팔레트
```javascript
primary: '#FF6B9D'        // 핑크
secondary: '#9C4FFF'      // 보라
tertiary: '#4ECDC4'       // 청록
background: '#FFFFFF'     // 흰색
surface: '#F8F9FA'        // 밝은 회색
text_primary: '#1E1E1E'   // 검은색
```

### 카테고리 색상
- 댄스: #FF6B9D (핑크)
- 립싱크: #9C4FFF (보라)
- 운동: #00C9FF (파랑)
- 요리: #FF8C42 (주황)
- 코미디: #FFD93D (노랑)
- 뷰티: #FF6BA9 (핑크)
- 게임: #7F5AF0 (보라)
- 기타: #95A5A6 (회색)

---

## 🚀 빌드 및 배포

### APK 빌드 방법
```bash
# 1. EAS CLI 설치
npm install -g eas-cli

# 2. Expo 로그인
eas login

# 3. APK 빌드
cd mobile
npm run build:preview
```

### 빌드 설정
- **패키지명**: com.smore.challenge
- **버전**: 1.0.0
- **버전 코드**: 1
- **빌드 타입**: APK

---

## 🐛 알려진 이슈 및 해결 방법

### 1. YouTube embed_not_allowed 에러
**문제**: 일부 영상이 embed 허용되지 않음
**해결**: 에러 처리 및 YouTube 바로가기 버튼 제공

### 2. 코드 중복
**문제**: 여러 화면에서 동일한 코드 반복
**해결**: 유틸리티 함수 및 재사용 컴포넌트로 분리

### 3. UI 방해 요소
**문제**: 재생 화면의 정보가 영상 시청 방해
**해결**: 자동 숨김/표시 기능 구현

---

## 🔮 향후 개선 방향

### 기능 추가
- [ ] 사용자 인증 및 프로필
- [ ] 댓글 및 커뮤니티 기능
- [ ] 챌린지 참여 기록 관리
- [ ] 푸시 알림
- [ ] 소셜 공유 기능

### 기술 개선
- [ ] TypeScript 마이그레이션
- [ ] 단위 테스트 추가 (Jest)
- [ ] E2E 테스트 (Detox)
- [ ] CI/CD 파이프라인 구축
- [ ] 오프라인 지원
- [ ] 성능 모니터링 (Sentry)

### 데이터 확장
- [ ] TikTok, Instagram 플랫폼 추가
- [ ] AI 기반 챌린지 추천
- [ ] 실시간 트렌드 분석
- [ ] 개인화 피드

---

## 📚 참고 자료

- [React Native 공식 문서](https://reactnative.dev/)
- [Expo 공식 문서](https://docs.expo.dev/)
- [React Navigation 공식 문서](https://reactnavigation.org/)
- [EAS Build 가이드](https://docs.expo.dev/build/introduction/)

---

## ✅ 체크리스트

### 개발 완료
- [x] 백엔드 API 개발
- [x] 모바일 앱 UI/UX 구현
- [x] 네비게이션 설정
- [x] API 연동
- [x] 로컬 저장소 (북마크) 구현
- [x] 코드 최적화 및 리팩토링

### 빌드 준비
- [x] app.json 설정
- [x] eas.json 생성
- [x] package.json 빌드 스크립트 추가
- [x] 빌드 가이드 문서 작성

### 발표 준비
- [x] PPT 구조 작성
- [x] 프로젝트 요약 문서 작성
- [ ] 스크린샷 촬영
- [ ] 데모 영상 준비

---

## 👥 팀원 (해당되는 경우 작성)

- 역할 분담
- 기여도

---

## 📄 라이센스

MIT License

---

**마지막 업데이트**: 2024년 12월

**프로젝트 상태**: ✅ 개발 완료, APK 빌드 준비 완료
