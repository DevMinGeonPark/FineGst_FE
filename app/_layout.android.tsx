import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { compareVersions } from "../utils/versionChecker";
import UpdateModal from "../components/app-ui/modules/UpdateModal";
import NetworkErrorModal from "../components/app-ui/modules/NetworkErrorModal";
import WebMainAndroid from "../components/web-ui/web-main.android";
import { SplashScreen } from "expo-router";
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
  });

  const initializeApp = async () => {
    try {
      // 1. 버전 체크 (5초 타임아웃 적용)
      const versionResult = await compareVersions();

      // 타임아웃 시 앱 정상 진입 (다음 실행 시 다시 체크)
      if (versionResult.isTimeout) {
        setAppState({ updateModal: false, networkErrorModal: false });
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

      // 정상 진입
      setAppState({ updateModal: false, networkErrorModal: false });
    } catch {
      // 버전 체크 실패 시 앱 정상 진입
      setAppState({ updateModal: false, networkErrorModal: false });
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const retry = () => {
    setAppState({ updateModal: false, networkErrorModal: false });
    initializeApp();
  };

  return { appState, retry };
}

// 웹 메인 컴포넌트
function WebMainApp() {
  return (
    <SetupProvider>
      <WebMainAndroid />
    </SetupProvider>
  );
}

// 조건부 렌더링 컴포넌트
function AppRenderer({ appState, onRetry }: { appState: AppState; onRetry: () => void }) {
  const { updateModal, networkErrorModal } = appState;

  if (networkErrorModal) {
    return <NetworkErrorModal onRetry={onRetry} />;
  } else if (updateModal) {
    return <UpdateModal />;
  } else {
    return <WebMainApp />;
  }
}

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { appState, retry } = useAppInitialization();

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
    if (loaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore if splash screen is already hidden or unavailable.
      });
    }
  }, [loaded, fontError]);

  if (!loaded && !fontError) {
    return null;
  }

  return <AppRenderer appState={appState} onRetry={retry} />;
}
