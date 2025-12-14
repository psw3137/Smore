import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Dimensions,
  StatusBar,
  FlatList,
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { challengeAPI } from '../services/api';
import { storageService } from '../services/storage';
import { formatNumber } from '../utils/formatters';
import { getYoutubeVideoId } from '../utils/youtube';
import { ANIMATION } from '../constants/app';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Shorts 스타일로 화면을 꽉 채우기 위한 계산
// 16:9 가로 영상을 세로 화면에 맞추려면 높이 기준으로 확대
const PLAYER_HEIGHT = SCREEN_HEIGHT;
const PLAYER_WIDTH = SCREEN_HEIGHT * (16 / 9); // 화면보다 넓게 (좌우가 잘림)

export default function ChallengeDetailScreen({ route, navigation }) {
  const {
    challengeId,
    categoryId,
    sortType = 'latest',
    challenges: providedChallenges,
    isSearchResult = false
  } = route.params;

  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState({});
  const [showUI, setShowUI] = useState(true);

  const flatListRef = useRef(null);
  const uiOpacity = useRef(new Animated.Value(1)).current;
  const hideTimerRef = useRef(null);

  // 탭바 숨기기
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
        }
      });
    };
  }, [navigation]);

  useEffect(() => {
    loadChallenges();
  }, [categoryId, challengeId]);

  const loadChallenges = async () => {
    try {
      let challengeList = [];

      // 검색 결과나 외부에서 제공된 챌린지 사용
      if (isSearchResult && providedChallenges) {
        challengeList = providedChallenges;
      } else {
        // 카테고리의 모든 챌린지 로드
        const data = await challengeAPI.getChallengesByCategory(categoryId, {
          sort: sortType,
          limit: 100
        });
        challengeList = data.challenges || [];
      }

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

  // UI 표시/숨김 토글
  const toggleUI = () => {
    const toValue = showUI ? 0 : 1;

    // 기존 타이머 제거
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    // 애니메이션
    Animated.timing(uiOpacity, {
      toValue,
      duration: ANIMATION.FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setShowUI(!showUI);

      // UI가 보이는 상태가 되면 자동 숨김
      if (!showUI) {
        hideTimerRef.current = setTimeout(() => {
          Animated.timing(uiOpacity, {
            toValue: 0,
            duration: ANIMATION.FADE_DURATION,
            useNativeDriver: true,
          }).start(() => {
            setShowUI(false);
          });
        }, ANIMATION.UI_AUTO_HIDE_DELAY);
      }
    });
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // 초기 로드 시 UI 자동 숨김
  useEffect(() => {
    if (!isLoading) {
      hideTimerRef.current = setTimeout(() => {
        Animated.timing(uiOpacity, {
          toValue: 0,
          duration: ANIMATION.FADE_DURATION,
          useNativeDriver: true,
        }).start(() => {
          setShowUI(false);
        });
      }, ANIMATION.UI_AUTO_HIDE_DELAY);
    }
  }, [isLoading]);

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

  const [playbackErrors, setPlaybackErrors] = useState({});

  const onPlayerError = useCallback((error, challengeId) => {
    console.error('❌ Player Error:', error, 'Challenge:', challengeId);

    // embed_not_allowed 에러 처리
    if (error === 'embed_not_allowed') {
      setPlaybackErrors(prev => ({ ...prev, [challengeId]: true }));
    }
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
    const isBookmarked = bookmarks[item.challenge_id];
    const hasPlaybackError = playbackErrors[item.challenge_id];

    return (
      <TouchableWithoutFeedback onPress={toggleUI}>
        <View style={styles.videoPage}>
          {/* 영상 플레이어 - 전체 화면 배경 */}
          <View style={styles.videoContainer}>
          {hasPlaybackError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={80} color={colors.text_white} />
              <Text style={styles.errorTitle}>재생할 수 없는 영상</Text>
              <Text style={styles.errorMessage}>
                이 영상은 앱 내에서 재생할 수 없습니다.{'\n'}
                YouTube에서 시청하세요.
              </Text>
              <TouchableOpacity
                style={styles.youtubeButton}
                onPress={() => openExternalLink(item.video_url)}
              >
                <Ionicons name="logo-youtube" size={24} color="white" />
                <Text style={styles.youtubeButtonText}>YouTube에서 보기</Text>
              </TouchableOpacity>
            </View>
          ) : videoId ? (
            <YoutubePlayer
              height={PLAYER_HEIGHT}
              width={PLAYER_WIDTH}
              videoId={videoId}
              onError={(error) => onPlayerError(error, item.challenge_id)}
              webViewStyle={styles.youtubeWebView}
              webViewProps={{
                androidLayerType: 'hardware',
                allowsInlineMediaPlayback: true,
              }}
              initialPlayerParams={{
                controls: 1,
                modestbranding: 1,
                rel: 0,
                playsinline: 1,
              }}
            />
          ) : (
            <Text style={styles.errorText}>비디오 ID를 찾을 수 없습니다</Text>
          )}
        </View>

        {/* 플랫폼 배지 */}
        <Animated.View style={{ opacity: uiOpacity }}>
          <LinearGradient
            colors={['#FF0000', '#CC0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.platformBadge}
          >
            <Text style={styles.platformText}>SHORTS</Text>
          </LinearGradient>
        </Animated.View>

        {/* 우측 액션 버튼 */}
        <Animated.View style={[styles.rightActionsOverlay, { opacity: uiOpacity }]}>
          <TouchableOpacity
            style={styles.actionButtonOverlay}
            onPress={() => toggleBookmark(item)}
          >
            <LinearGradient
              colors={isBookmarked ? colors.gradient.primary : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.actionButtonBg}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={28}
                color="white"
              />
            </LinearGradient>
            <Text style={styles.actionLabelOverlay}>저장</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonOverlay}
            onPress={() => openExternalLink(item.video_url)}
          >
            <View style={styles.actionButtonBg}>
              <Ionicons name="logo-youtube" size={28} color="white" />
            </View>
            <Text style={styles.actionLabelOverlay}>YouTube</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 하단 정보 */}
        <Animated.View style={{ opacity: uiOpacity }}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
            style={styles.bottomInfoOverlay}
          >
            <Text style={styles.titleOverlay} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.channelName}>{item.channel_name}</Text>
            <Text style={styles.stats}>
              👁 {formatNumber(item.view_count)} views
            </Text>
          </LinearGradient>
        </Animated.View>
        </View>
      </TouchableWithoutFeedback>
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
        onScrollToIndexFailed={(info) => {
          console.warn('Scroll to index failed:', info);
          setTimeout(() => {
            if (flatListRef.current && info.index < challenges.length) {
              flatListRef.current.scrollToIndex({ index: info.index, animated: false });
            }
          }, 100);
        }}
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
    borderRadius: 12,
    zIndex: 100,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  platformText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rightActionsOverlay: {
    position: 'absolute',
    right: spacing.md,
    bottom: 140,
    zIndex: 100,
    gap: spacing.md,
  },
  actionButtonOverlay: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionButtonBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionLabelOverlay: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginTop: 4,
  },
  bottomInfoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: 100,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: spacing.xl,
  },
  errorTitle: {
    color: colors.text_white,
    fontSize: 24,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    color: colors.text_white,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  youtubeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 30,
    gap: spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  youtubeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  }
});
