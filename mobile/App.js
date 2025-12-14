import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenNative from 'expo-splash-screen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SplashScreen } from './src/components/SplashScreen';

// 네이티브 스플래시 스크린 유지
SplashScreenNative.preventAutoHideAsync();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // 앱 준비 완료
    async function prepare() {
      try {
        // 여기에 필요한 초기화 작업 추가 가능
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        SplashScreenNative.hideAsync();
      }
    }

    prepare();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (!appReady || showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <>
      <RootNavigator />
      <StatusBar style="dark" />
    </>
  );
}
