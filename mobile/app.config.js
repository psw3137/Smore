import 'dotenv/config';

export default ({ config }) => {
  // 환경에 따라 API URL 결정
  const apiUrl = process.env.API_URL || 'http://10.0.2.2:3000/api/v1';

  return {
    ...config,
    expo: {
      name: "Smore",
      slug: "smore-challenge",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "light",
      newArchEnabled: true,
      splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#FF6B9D"
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.smore.challenge",
        buildNumber: "1.0.0"
      },
      android: {
        package: "com.smore.challenge",
        versionCode: 1,
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#ffffff"
        },
        permissions: [
          "INTERNET",
          "ACCESS_NETWORK_STATE"
        ],
        edgeToEdgeEnabled: true
      },
      web: {
        favicon: "./assets/favicon.png"
      },
      extra: {
        apiUrl: apiUrl,
        eas: {
          projectId: "460f71eb-dfe7-4dc3-b672-5e5d1520fb08"
        }
      },
      plugins: [],
      owner: "psw3137"
    }
  };
};
