# 🎬 Smore App - UI/UX Design Specification for Claude Code

**문서 버전:** 1.0  
**작성일:** 2025-11-27  
**대상:** Claude Code (AI Agent)  
**목적:** React Native + Expo 기반 UI 구현 가이드  
**설계자의 디자인:** 8개 화면 Figma 프로토타입

---

## 📋 목차

1. [전체 화면 구조](#1-전체-화면-구조)
2. [색상 팔레트 및 디자인 시스템](#2-색상-팔레트-및-디자인-시스템)
3. [화면별 상세 설계](#3-화면별-상세-설계)
4. [공통 컴포넌트](#4-공통-컴포넌트)
5. [네비게이션 구조](#5-네비게이션-구조)
6. [API 연동 스펙](#6-api-연동-스펙)

---

## 1. 전체 화면 구조

### 1.1 화면 맵

```
Smore App (5개 탭)
├── 🏠 Home (홈)
│   └── ChallengeGrid (카드 그리드 뷰)
│       └── ChallengeDetail (상세 모달)
│
├── 🔍 Search (검색)
│   ├── SearchBar + Trending Keywords
│   └── SearchResults (그리드 뷰)
│
├── 📁 Category (카테고리)
│   ├── CategoryGrid (8개 카테고리 버튼)
│   └── CategoryFiltered (필터된 챌린지 목록)
│
├── 📊 Trend (트렌드)
│   ├── TrendStats (통계 대시보드)
│   ├── CategoryRanking (카테고리 순위)
│   └── LatestChallenges (금상승 챌린지)
│
└── 👤 Profile (프로필) [향후 구현]
    └── Bookmarks & Settings
```

### 1.2 탭 네비게이션

```
하단 탭 네비게이션 (5개)
├─ 홈 (Home)
├─ 검색 (Search/검색)
├─ 카테고리 (Category/카테고리)
├─ 트렌드 (Trend/트렌드)
└─ 프로필 (Profile/프로필)
```

---

## 2. 색상 팔레트 및 디자인 시스템

### 2.1 색상 정의

```javascript
// colors.js
export const colors = {
  // 배경색
  background: '#1A1A1A',        // 진한 회색 배경
  surface: '#2A2A2A',            // 카드 배경
  surface_light: '#FFFFFF',      // 흰색 카드
  
  // 텍스트
  text_primary: '#FFFFFF',       // 주 텍스트
  text_secondary: '#999999',     // 보조 텍스트
  text_tertiary: '#666666',      // 약한 텍스트
  
  // 강조색
  primary: '#FF6B6B',            // 빨강 (메인)
  secondary: '#FFB84D',          // 주황 (강조)
  accent: '#4ECDC4',             // 청록 (accent)
  
  // 카테고리별 색상
  category: {
    dance: '#C441F5',            // 자주색
    lipsync: '#FF1493',          // 분홍색
    exercise: '#4CAF50',         // 초록색
    cooking: '#FF9800',          // 주황색
    comedy: '#FFD700',           // 노랑색
    beauty: '#E91E63',           // 분홍
    gaming: '#2196F3',           // 파랑
    other: '#9E9E9E'             // 회색
  },
  
  // 난이도
  difficulty: {
    easy: '#4CAF50',             // 초록
    medium: '#FFB84D',           // 주황
    hard: '#FF6B6B'              // 빨강
  },
  
  // 플랫폼
  platform: {
    youtube: '#FF0000',          // 유튜브 빨강
    tiktok: '#00F7EF'            // 틱톡 청록
  },
  
  // 상태
  like: '#FF1493',               // 좋아요 분홍
  border: '#333333',             // 테두리
  divider: '#404040'             // 구분선
};
```

### 2.2 타이포그래피

```javascript
// typography.js
export const typography = {
  // 헤딩
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },    // 제목
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },    // 부제목
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },    // 소제목
  
  // 본문
  body_lg: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  body_md: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  body_sm: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  
  // 라벨
  label: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  caption: { fontSize: 10, fontWeight: '500', lineHeight: 14 }
};
```

### 2.3 간격 시스템

```javascript
// spacing.js
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};
```

---

## 3. 화면별 상세 설계

### 3.1 화면 #1: 홈 (Home Screen)

**특징:**
- 상단 헤더: "Smore" 로고 + 정렬 버튼 + 그리드/리스트 뷰 토글
- 2x2 그리드로 챌린지 카드 표시
- 각 카드: 썸네일 + 플랫폼 배지 + 제목 + 난이도 + 조회수/좋아요

**컴포넌트:**

```javascript
// screens/HomeScreen.js
export const HomeScreen = () => {
  // API: GET /api/v1/challenges?sort=latest&limit=20
  // 상태: challenges 배열, isLoading, hasError
  
  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <HomeHeader />
      
      {/* 챌린지 그리드 */}
      <FlatList
        data={challenges}
        numColumns={2}
        renderItem={({ item }) => <ChallengeCard challenge={item} />}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={loadMore}  // 무한 스크롤
      />
    </View>
  );
};
```

**컴포넌트 구조:**

| 컴포넌트 | 설명 | 크기 |
|---------|------|------|
| **HomeHeader** | 로고 + 정렬/필터 버튼 | full width |
| **ChallengeCard** | 챌린지 카드 | width: 50% |
| **PlatformBadge** | YouTube/TikTok 배지 | 60x30 |
| **DifficultyBadge** | 난이도 표시 (Easy/Medium/Hard) | 60x24 |

**CardComponent 상세:**

```javascript
// components/ChallengeCard.js
<View style={styles.card}>
  {/* 썸네일 */}
  <Image source={{ uri: challenge.thumbnail_url }} style={styles.thumbnail} />
  
  {/* 플랫폼 배지 */}
  <View style={styles.platformBadge}>
    <Text style={styles.platformText}>
      {challenge.platform === 'youtube' ? 'YouTube' : 'TikTok'}
    </Text>
  </View>
  
  {/* 콘텐츠 */}
  <View style={styles.content}>
    <Text style={styles.title} numberOfLines={2}>
      {challenge.title}
    </Text>
    
    <View style={styles.difficultyRow}>
      <Text style={[styles.difficulty, getDifficultyColor(challenge.difficulty)]}>
        {challenge.difficulty.toUpperCase()}
      </Text>
    </View>
    
    <View style={styles.statsRow}>
      <Text style={styles.stat}>👁 {formatNumber(challenge.view_count)}</Text>
      <Text style={styles.stat}>❤️ {formatNumber(challenge.like_count)}</Text>
    </View>
  </View>
</View>
```

---

### 3.2 화면 #2: 챌린지 상세 (Challenge Detail Screen)

**특징:**
- 비디오 플레이어 (재생 버튼만, 실제 외부 링크로 이동)
- 좋아요/댓글/공유 버튼
- 제목, 난이도, 카테고리
- 채널명 + 뷰 수
- 해시태그

**컴포넌트:**

```javascript
// screens/ChallengeDetailScreen.js
<View style={styles.container}>
  {/* 비디오 영역 */}
  <View style={styles.videoContainer}>
    <Image source={{ uri: challenge.thumbnail_url }} style={styles.thumbnail} />
    <TouchableOpacity style={styles.playButton} onPress={openExternalLink}>
      <Ionicons name="play" size={60} color="white" />
    </TouchableOpacity>
  </View>
  
  {/* 상호작용 버튼 */}
  <View style={styles.actionButtons}>
    <ActionButton icon="heart" label={challenge.like_count} />
    <ActionButton icon="chatbubble" label="댓글" />
    <ActionButton icon="share-social" label="공유" />
    <ActionButton icon="bookmark" label="저장" onPress={toggleBookmark} />
  </View>
  
  {/* 정보 */}
  <View style={styles.info}>
    <Text style={styles.title}>{challenge.title}</Text>
    <View style={styles.metaRow}>
      <Text style={styles.difficulty}>{challenge.difficulty}</Text>
      <Text style={styles.category}>{challenge.category.category_name}</Text>
    </View>
    <View style={styles.creator}>
      <Text style={styles.creatorName}>{challenge.channel_name}</Text>
      <Text style={styles.views}>{challenge.view_count} views</Text>
    </View>
    <View style={styles.tags}>
      {challenge.tags.map(tag => (
        <Text key={tag.tag_id} style={styles.tag}>#{tag.tag_name}</Text>
      ))}
    </View>
  </View>
</View>
```

---

### 3.3 화면 #3: 검색 (Search Screen)

**특징:**
- 검색 입력창 (둥근 모서리)
- 정렬 버튼
- 트렌딩 키워드 (해시태그 형태)
- 최근 검색어 (저장되지 않음 - 로컬만)

**컴포넌트:**

```javascript
// screens/SearchScreen.js
<View style={styles.container}>
  {/* 검색 바 */}
  <View style={styles.searchBar}>
    <Ionicons name="search" size={20} color={colors.text_secondary} />
    <TextInput
      placeholder="챌린지 검색..."
      placeholderTextColor={colors.text_secondary}
      onChangeText={setSearchQuery}
      onSubmitEditing={handleSearch}
      style={styles.input}
    />
    <TouchableOpacity onPress={toggleSortModal}>
      <Ionicons name="settings" size={20} color={colors.text_secondary} />
    </TouchableOpacity>
  </View>
  
  {/* 트렌딩 키워드 */}
  <View style={styles.trendingSection}>
    <Text style={styles.sectionTitle}>📈 트렌딩 검색어</Text>
    <View style={styles.trendingGrid}>
      {trendingKeywords.map(keyword => (
        <TouchableOpacity
          key={keyword.id}
          style={styles.trendingBadge}
          onPress={() => handleSearch(keyword.name)}
        >
          <Text style={styles.trendingText}>
            #{keyword.name} ({keyword.count})
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
  
  {/* 빈 상태 */}
  {!hasSearched && (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={80} color={colors.text_tertiary} />
      <Text style={styles.emptyText}>검색어를 입력하세요</Text>
    </View>
  )}
</View>
```

---

### 3.4 화면 #4: 검색 결과 (Search Results Screen)

**특징:**
- 검색 결과 개수 표시
- 2x2 그리드로 결과 표시
- 무한 스크롤
- 결과 없음 상태

**컴포넌트:**

```javascript
// screens/SearchResultsScreen.js
// 홈 화면의 ChallengeGrid와 유사
// API: GET /api/v1/search?q={query}&sort={sort}&page={page}&limit=20
```

---

### 3.5 화면 #5: 카테고리 선택 (Category Grid Screen)

**특징:**
- 8개 카테고리 (Dance, Lipsync, Exercise, Cooking, Comedy, Beauty, Gaming, Other)
- 각 카테고리마다 다른 색상
- 2x4 그리드 또는 2x2 큰 버튼
- 아이콘 + 텍스트

**카테고리별 색상:**

```javascript
const categoryColors = {
  dance: '#C441F5',
  lipsync: '#FF1493',
  exercise: '#4CAF50',
  cooking: '#FF9800',
  comedy: '#FFD700',
  beauty: '#E91E63',
  gaming: '#2196F3',
  other: '#9E9E9E'
};

const categoryIcons = {
  dance: '🎵',
  lipsync: '🎤',
  exercise: '🏃',
  cooking: '👨‍🍳',
  comedy: '😂',
  beauty: '💄',
  gaming: '🎮',
  other: '••••'
};
```

**컴포넌트:**

```javascript
// screens/CategoryScreen.js
<View style={styles.container}>
  <Text style={styles.title}>카테고리 선택</Text>
  <View style={styles.grid}>
    {categories.map(category => (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryButton,
          { backgroundColor: categoryColors[category.code] }
        ]}
        onPress={() => navigateToCategoryFilter(category.id)}
      >
        <Text style={styles.categoryIcon}>{categoryIcons[category.code]}</Text>
        <Text style={styles.categoryName}>{category.name}</Text>
      </TouchableOpacity>
    ))}
  </View>
</View>
```

---

### 3.6 화면 #6: 카테고리 필터 (Category Filtered Screen)

**특징:**
- 카테고리 뒤로가기 + 제목 + 개수 표시
- 2x2 그리드로 챌린지 표시
- 무한 스크롤

**컴포넌트:**

```javascript
// screens/CategoryFilteredScreen.js
// API: GET /api/v1/challenges/category/{categoryId}?sort=latest&page={page}&limit=20
// 홈 화면과 동일한 ChallengeGrid 사용
```

---

### 3.7 화면 #7: 트렌드 대시보드 (Trend Dashboard Screen)

**특징:**
- 기간 선택 버튼 (최근 7일, 14일, 30일)
- 통계 카드:
  - 📺 조회수
  - ❤️ 좋아요
  - 🎬 챌린지 수
- 인기 카테고리 순위 (Top 5, 진행 바 형태)
- "금상승 챌린지" 섹션

**컴포넌트:**

```javascript
// screens/TrendScreen.js
<View style={styles.container}>
  {/* 기간 선택 */}
  <View style={styles.periodSelector}>
    <PeriodButton period={7} active={selectedPeriod === 7} />
    <PeriodButton period={14} active={selectedPeriod === 14} />
    <PeriodButton period={30} active={selectedPeriod === 30} />
  </View>
  
  {/* 통계 카드 */}
  <View style={styles.statsGrid}>
    <StatCard icon="👁" label="조회수" value="150.0M" trend="+12%" />
    <StatCard icon="❤️" label="좋아요" value="15.0M" trend="+18%" />
    <StatCard icon="🎬" label="챌린지" value="1250" trend="+5%" />
  </View>
  
  {/* 인기 카테고리 */}
  <View style={styles.categoryRanking}>
    <Text style={styles.sectionTitle}>인기 카테고리</Text>
    {topCategories.map((category, index) => (
      <CategoryRankingRow
        key={category.id}
        rank={index + 1}
        name={category.name}
        count={category.count}
        percentage={(category.count / totalCount) * 100}
      />
    ))}
  </View>
  
  {/* 금상승 챌린지 */}
  <View style={styles.latestSection}>
    <Text style={styles.sectionTitle}>금상승 챌린지</Text>
    <FlatList
      horizontal
      data={latestChallenges}
      renderItem={({ item }) => <ChallengeCard challenge={item} />}
      showsHorizontalScrollIndicator={false}
    />
  </View>
</View>
```

---

### 3.8 화면 #8: 금상승 챘리지 상세 (Latest Challenges Screen)

**특징:**
- "금상승 챌린지" 버튼
- 동일한 2x2 그리드로 상세 표시

**컴포넌트:**

```javascript
// screens/LatestChallengesScreen.js
// API: GET /api/v1/trends/daily
// 홈 화면과 동일한 ChallengeGrid 사용
```

---

## 4. 공통 컴포넌트

### 4.1 ChallengeCard (재사용 컴포넌트)

```javascript
// components/ChallengeCard.js
<View style={styles.card}>
  <Image source={{ uri: thumbnail_url }} style={styles.thumbnail} />
  
  <View style={[
    styles.platformBadge,
    { backgroundColor: platform === 'youtube' ? colors.platform.youtube : colors.platform.tiktok }
  ]}>
    <Text style={styles.platformText}>{platform.toUpperCase()}</Text>
  </View>
  
  <View style={styles.content}>
    <Text style={styles.title} numberOfLines={2}>{title}</Text>
    
    <View style={styles.difficultyContainer}>
      <Text style={[
        styles.difficulty,
        { color: colors.difficulty[difficulty] }
      ]}>
        {difficulty.toUpperCase()}
      </Text>
    </View>
    
    <View style={styles.stats}>
      <Text style={styles.stat}>👁 {formatViewCount(view_count)}</Text>
      <Text style={styles.stat}>❤️ {formatViewCount(like_count)}</Text>
    </View>
  </View>
</View>
```

### 4.2 ActionButton (상호작용 버튼)

```javascript
// components/ActionButton.js
<TouchableOpacity style={styles.button} onPress={onPress}>
  <Ionicons name={icon} size={24} color={colors.text_primary} />
  <Text style={styles.label}>{label}</Text>
</TouchableOpacity>
```

### 4.3 CategoryRankingRow (순위 표시)

```javascript
// components/CategoryRankingRow.js
<View style={styles.row}>
  <Text style={styles.rank}>#{rank}</Text>
  <Text style={styles.name}>{name}</Text>
  <View style={styles.progressBar}>
    <View style={[styles.progress, { width: `${percentage}%` }]} />
  </View>
  <Text style={styles.count}>{count}개</Text>
</View>
```

---

## 5. 네비게이션 구조

### 5.1 Stack Navigator (화면 이동)

```javascript
// navigation/RootNavigator.js
<NavigationContainer>
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Home: 'home',
          Search: 'search',
          Category: 'grid',
          Trend: 'trending-up',
          Profile: 'person'
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.text_secondary,
      tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border }
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Category" component={CategoryScreen} />
    <Tab.Screen name="Trend" component={TrendScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
</NavigationContainer>
```

---

## 6. API 연동 스펙

### 6.1 API 호출 패턴

```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.100:3000/api/v1'; // 로컬 IP

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// 챌린지 조회
export const getChallenges = async (params = {}) => {
  const response = await apiClient.get('/challenges', { params });
  return response.data.data.challenges;
};

// 검색
export const searchChallenges = async (query, params = {}) => {
  const response = await apiClient.get('/search', {
    params: { q: query, ...params }
  });
  return response.data.data.results;
};

// 카테고리별 챌린지
export const getChallengesByCategory = async (categoryId, params = {}) => {
  const response = await apiClient.get(`/challenges/category/${categoryId}`, { params });
  return response.data.data.challenges;
};

// 트렌드
export const getTrends = async (days = 7) => {
  const response = await apiClient.get('/trends', { params: { days } });
  return response.data.data;
};

// 트렌딩 검색어
export const getTrendingKeywords = async () => {
  const response = await apiClient.get('/search/trending');
  return response.data.data.trending_keywords;
};
```

### 6.2 Redux/Context 상태 관리 (선택)

```javascript
// context/ChallengeContext.js
export const ChallengeProvider = ({ children }) => {
  const [challenges, setChallenges] = useState([]);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadChallenges = async (filters) => {
    setIsLoading(true);
    try {
      const data = await getChallenges(filters);
      setChallenges(data);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ChallengeContext.Provider
      value={{
        challenges,
        trendingKeywords,
        bookmarks,
        isLoading,
        loadChallenges
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};
```

---

## 7. 개발 순서

### Phase 1: 기초 UI (1주)
- [ ] 프로젝트 초기화 (Expo)
- [ ] 네비게이션 구조 구축
- [ ] 색상/타이포그래피 정의
- [ ] 공통 컴포넌트 (ChallengeCard, ActionButton 등)

### Phase 2: 메인 화면 구현 (2주)
- [ ] HomeScreen + ChallengeGrid
- [ ] SearchScreen + TrendingKeywords
- [ ] CategoryScreen
- [ ] TrendScreen

### Phase 3: API 통합 (1주)
- [ ] API 클라이언트 설정
- [ ] 각 화면에 API 호출 추가
- [ ] AsyncStorage 북마크 기능
- [ ] 무한 스크롤 구현

### Phase 4: 최적화 및 테스트 (1주)
- [ ] 성능 최적화
- [ ] 에러 처리
- [ ] 로딩 상태 관리
- [ ] 테스트

---

## 📝 요구사항 요약

### 필수 라이브러리
```json
{
  "expo": "^49.0.0",
  "react-native": "^0.72.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "axios": "^1.3.0",
  "@react-native-async-storage/async-storage": "^1.17.0",
  "expo-linear-gradient": "^12.0.0",
  "ionicons": "^7.0.0"
}
```

### 파일 구조
```
src/
├── screens/
│   ├── HomeScreen.js
│   ├── SearchScreen.js
│   ├── SearchResultsScreen.js
│   ├── ChallengeDetailScreen.js
│   ├── CategoryScreen.js
│   ├── CategoryFilteredScreen.js
│   ├── TrendScreen.js
│   ├── LatestChallengesScreen.js
│   └── ProfileScreen.js
├── components/
│   ├── ChallengeCard.js
│   ├── ActionButton.js
│   ├── CategoryRankingRow.js
│   ├── StatCard.js
│   ├── PlatformBadge.js
│   ├── DifficultyBadge.js
│   └── HomeHeader.js
├── navigation/
│   └── RootNavigator.js
├── services/
│   ├── api.js
│   └── storage.js
├── theme/
│   ├── colors.js
│   ├── typography.js
│   └── spacing.js
├── context/
│   └── ChallengeContext.js
├── utils/
│   ├── formatters.js
│   └── helpers.js
└── app.js
```

---

**문서 버전**: 1.0  
**작성일**: 2025-11-27  
**상태**: Claude Code 구현 준비 완료
