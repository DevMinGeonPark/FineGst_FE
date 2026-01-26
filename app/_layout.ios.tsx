import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import { compareVersions } from "../utils/versionChecker";
import { shouldShowWebMain } from "../api/shouldShowWebMain";
import UpdateModal from "../components/app-ui/modules/UpdateModal";
import NetworkErrorModal from "../components/app-ui/modules/NetworkErrorModal";
import WebMainIos from "../components/web-ui/web-main.ios";
import { SplashScreen, Stack } from "expo-router";
import { UpdateProvider } from "../components/UpdateProvider";
import { handleNotificationNavigation } from "../utils/notifications";
import { useNotifications } from "../hooks/useNotifications";
import { usePushToken } from "../hooks/usePushToken";

// 포그라운드 알림 표시 설정 (모듈 레벨에서 설정)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

SplashScreen.preventAutoHideAsync();

// 타입 정의
interface AppState {
  updateModal: boolean;
  networkErrorModal: boolean;
  useAppView: boolean;
}

interface SetupProviderProps {
  children: React.ReactNode;
}

// QueryClient 인스턴스
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 1000 * 60 * 5,
    },
  },
});

// 프로바이더 컴포넌트
function SetupProvider({ children }: SetupProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DefaultTheme}>
        <UpdateProvider>{children}</UpdateProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// 앱 초기화 커스텀 훅
function useAppInitialization() {
  const [appState, setAppState] = useState<AppState>({
    updateModal: false,
    networkErrorModal: false,
    useAppView: true, // 기본값: 앱뷰 (서버에서 false 받으면 웹뷰로 전환)
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. 버전 체크 (5초 타임아웃 적용)
        const versionResult = await compareVersions();

        // 타임아웃 시 앱 정상 진입 (다음 실행 시 다시 체크)
        if (versionResult.isTimeout) {
          // 타임아웃이어도 ico 값은 체크
          const icoValue = await shouldShowWebMain();
          setAppState((prev) => ({ ...prev, useAppView: icoValue }));
          return;
        }

        if (versionResult.isNetworkError) {
          // 네트워크 에러 발생 시
          setAppState((prev) => ({ ...prev, networkErrorModal: true }));
          return;
        }

        if (versionResult.needsUpdate) {
          // 업데이트 필요 시
          setAppState((prev) => ({ ...prev, updateModal: true }));
          return;
        }

        // 2. ICO 값 가져오기 (앱뷰/웹뷰 결정)
        const icoValue = await shouldShowWebMain();
        setAppState((prev) => ({ ...prev, useAppView: icoValue }));
      } catch {
        // 실패 시 앱뷰로 진입 (iOS 심사용)
        setAppState((prev) => ({ ...prev, useAppView: true }));
      }
    };

    initializeApp();
  }, []);

  return appState;
}

// 네이티브 앱뷰 컴포넌트
function AppMainApp() {
  return (
    <SetupProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(app)">
        <Stack.Screen name="(app)" />
      </Stack>
    </SetupProvider>
  );
}

// 웹 메인 컴포넌트
function WebMainApp() {
  return (
    <SetupProvider>
      <WebMainIos />
    </SetupProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const appState = useAppInitialization();
  const { updateModal, networkErrorModal, useAppView } = appState;

  // 푸시 알림 초기화: 권한 요청 및 토큰 생성
  useNotifications();
  // 푸시 토큰 서버 등록
  usePushToken();

  // Cold start: 앱이 종료된 상태에서 알림을 탭하여 실행된 경우 처리
  useEffect(() => {
    async function handleInitialNotification() {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        const { data } = response.notification.request.content;
        handleNotificationNavigation(data || {});
        // 처리 완료 후 응답 클리어
        await Notifications.clearLastNotificationResponseAsync();
      }
    }
    handleInitialNotification();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // 네트워크 에러 모달
  if (networkErrorModal) {
    return <NetworkErrorModal />;
  }

  // 업데이트 모달
  if (updateModal) {
    return <UpdateModal />;
  }

  // 앱뷰/웹뷰 분기
  if (useAppView) {
    return <AppMainApp />;
  }

  return <WebMainApp />;
}
