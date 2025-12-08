import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Dimensions,
  StatusBar,
  FlatList
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { challengeAPI } from '../services/api';
import { storageService } from '../services/storage';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Shorts 스타일로 화면을 꽉 채우기 위한 계산
// 16:9 가로 영상을 세로 화면에 맞추려면 높이 기준으로 확대
const PLAYER_HEIGHT = SCREEN_HEIGHT;
const PLAYER_WIDTH = SCREEN_HEIGHT * (16 / 9); // 화면보다 넓게 (좌우가 잘림)

export default function ChallengeDetailScreen({ route, navigation }) {
  const { challengeId, categoryId, sortType = 'latest' } = route.params;
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState({});

  const playerRefs = useRef({});
  const flatListRef = useRef(null);

  useEffect(() => {
    loadChallenges();
  }, [categoryId, challengeId]);

  const loadChallenges = async () => {
    try {
      // 카테고리의 모든 챌린지 로드 (홈화면과 같은 정렬 순서로)
      const data = await challengeAPI.getChallengesByCategory(categoryId, {
        sort: sortType,
        limit: 100 // 충분한 양의 챌린지 로드
      });
      const challengeList = data.challenges || [];
      setChallenges(challengeList);

      // 현재 challengeId의 인덱스 찾기
      const initialIndex = challengeList.findIndex(c => c.challenge_id === challengeId);
      setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);

      // 북마크 상태 로드
      const bookmarkStates = {};
      for (const challenge of challengeList) {
        bookmarkStates[challenge.challenge_id] = await storageService.isBookmarked(challenge.challenge_id);
      }
      setBookmarks(bookmarkStates);

      console.log(`Loaded ${challengeList.length} challenges, starting at index ${initialIndex}`);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = async (challenge) => {
    const challengeId = challenge.challenge_id;
    const isBookmarked = bookmarks[challengeId];

    if (isBookmarked) {
      await storageService.removeBookmark(challengeId);
      setBookmarks(prev => ({ ...prev, [challengeId]: false }));
    } else {
      await storageService.addBookmark(challenge);
      setBookmarks(prev => ({ ...prev, [challengeId]: true }));
    }
  };

  const openExternalLink = async (videoUrl) => {
    if (videoUrl) {
      await Linking.openURL(videoUrl);
    }
  };

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // 현재 보이는 아이템 추적
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setCurrentIndex(newIndex);
      console.log('📍 Current video index:', newIndex);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80 // 80% 이상 보일 때 활성화
  }).current;

  // 각 비디오의 onReady 콜백 - 즉시 재생 시작
  const onPlayerReady = useCallback((challengeId) => {
    console.log('✅ Player Ready:', challengeId);
    // 현재 보이는 비디오인지 확인
    const isCurrentVideo = challenges[currentIndex]?.challenge_id === challengeId;

    if (isCurrentVideo) {
      console.log('▶️ Auto-playing video:', challengeId);
      // play prop이 true로 설정되어 있으므로 자동으로 재생됨
      // react-native-youtube-iframe는 play prop 변경을 감지하여 playVideo() 호출
    }
  }, [challenges, currentIndex]);

  const onPlayerError = useCallback((error, challengeId) => {
    console.error('❌ Player Error:', error, 'Challenge:', challengeId);
  }, []);

  const onPlayerStateChange = useCallback((state, challengeId) => {
    console.log('🎬 Player State:', state, 'Challenge:', challengeId);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderChallengeItem = ({ item, index }) => {
    const videoId = getYoutubeVideoId(item.video_url);
    const isActive = index === currentIndex;
    const isBookmarked = bookmarks[item.challenge_id];

    return (
      <View style={styles.videoPage}>
        {/* 영상 플레이어 - 전체 화면 배경 */}
        <View style={styles.videoContainer}>
          {videoId ? (
            <YoutubePlayer
              ref={(ref) => playerRefs.current[item.challenge_id] = ref}
              height={PLAYER_HEIGHT}
              width={PLAYER_WIDTH}
              videoId={videoId}
              play={isActive} // 현재 보이는 비디오만 재생
              onReady={() => onPlayerReady(item.challenge_id)}
              onError={(error) => onPlayerError(error, item.challenge_id)}
              onChangeState={(state) => onPlayerStateChange(state, item.challenge_id)}
              forceAndroidAutoplay={true}
              webViewStyle={styles.youtubeWebView}
              webViewProps={{
                androidLayerType: 'hardware',
                allowsInlineMediaPlayback: true,
                mediaPlaybackRequiresUserAction: false
              }}
              initialPlayerParams={{
                controls: 1, // 컨트롤 표시 (일단 재생 확인용)
                modestbranding: 1,
                rel: 0,
                playsinline: 1,
                fs: 0, // 전체화면 버튼 숨김
              }}
            />
          ) : (
            <Text style={styles.errorText}>비디오 ID를 찾을 수 없습니다</Text>
          )}
        </View>

        {/* 플랫폼 배지 */}
        <View style={[styles.platformBadge, { backgroundColor: colors.platform.youtube }]}>
          <Text style={styles.platformText}>SHORTS</Text>
        </View>

        {/* 우측 액션 버튼 */}
        <View style={styles.rightActionsOverlay}>
          <TouchableOpacity
            style={styles.actionButtonOverlay}
            onPress={() => toggleBookmark(item)}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={32}
              color={isBookmarked ? colors.primary : 'white'}
            />
            <Text style={[styles.actionLabelOverlay, { marginTop: spacing.xs }]}>저장</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonOverlay}
            onPress={() => openExternalLink(item.video_url)}
          >
            <Ionicons name="logo-youtube" size={32} color="white" />
            <Text style={[styles.actionLabelOverlay, { marginTop: spacing.xs }]}>YouTube</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 정보 */}
        <View style={styles.bottomInfoOverlay}>
          <Text style={styles.titleOverlay} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.channelName}>{item.channel_name}</Text>
          <Text style={styles.stats}>
            👁 {formatNumber(item.view_count)} views
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButtonOverlay}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Vertical Swipe FlatList */}
      <FlatList
        ref={flatListRef}
        data={challenges}
        renderItem={renderChallengeItem}
        keyExtractor={(item) => item.challenge_id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={currentIndex}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  videoPage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000'
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',  // 넘치는 부분(좌우)을 숨김
    zIndex: 1
  },
  youtubeWebView: {
    backgroundColor: '#000',
    opacity: 0.99 // WebView 렌더링 최적화
  },
  platformBadge: {
    position: 'absolute',
    top: 70,
    right: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
    zIndex: 100
  },
  platformText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700'
  },
  rightActionsOverlay: {
    position: 'absolute',
    right: spacing.md,
    bottom: 140,
    zIndex: 100
  },
  actionButtonOverlay: {
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  actionLabelOverlay: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  bottomInfoOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 60,
    padding: spacing.lg,
    zIndex: 100
  },
  titleOverlay: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  channelName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  stats: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100
  }
});
