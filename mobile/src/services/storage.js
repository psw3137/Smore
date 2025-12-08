import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'smore_bookmarks';

export const storageService = {
  // 북마크 추가
  addBookmark: async (challenge) => {
    try {
      const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
      const existingBookmarks = bookmarks ? JSON.parse(bookmarks) : [];

      const bookmarkExists = existingBookmarks.find(
        b => b.challenge_id === challenge.challenge_id
      );

      if (!bookmarkExists) {
        existingBookmarks.push({
          ...challenge,
          bookmarkedAt: new Date().toISOString()
        });
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(existingBookmarks));
      }
      return true;
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      return false;
    }
  },

  // 북마크 제거
  removeBookmark: async (challengeId) => {
    try {
      const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
      const existingBookmarks = bookmarks ? JSON.parse(bookmarks) : [];

      const filtered = existingBookmarks.filter(
        b => b.challenge_id !== challengeId
      );

      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      return false;
    }
  },

  // 모든 북마크 조회
  getBookmarks: async () => {
    try {
      const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
      console.error('Failed to get bookmarks:', error);
      return [];
    }
  },

  // 북마크 여부 확인
  isBookmarked: async (challengeId) => {
    try {
      const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
      const existingBookmarks = bookmarks ? JSON.parse(bookmarks) : [];
      return existingBookmarks.some(b => b.challenge_id === challengeId);
    } catch (error) {
      console.error('Failed to check bookmark:', error);
      return false;
    }
  }
};
