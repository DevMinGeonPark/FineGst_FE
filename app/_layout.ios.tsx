import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import { useState, useEffect } from "react";
import { compareVersions } from "../utils/versionChecker";
import UpdateModal from "../components/app-ui/modules/UpdateModal";
import NetworkErrorModal from "../components/app-ui/modules/NetworkErrorModal";
import WebMainIos from "../components/web-ui/web-main.ios";
import { SplashScreen, Stack } from "expo-router";

// 테스트용: true로 설정하면 네이티브 앱뷰로 진입 (iOS 심사용)
const USE_APP_VIEW = true;

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
      <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}

// 앱 초기화 커스텀 훅
function useAppInitialization() {
  const [appState, setAppState] = useState<AppState>({
    updateModal: false,
    networkErrorModal: false,
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. 버전 체크 (5초 타임아웃 적용)
        const versionResult = await compareVersions();

        // 타임아웃 시 앱 정상 진입 (다음 실행 시 다시 체크)
        if (versionResult.isTimeout) {
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
      } catch {
        // 버전 체크 실패 시 앱 정상 진입
      }
    };

    initializeApp();
  }, []);

  return appState;
}

// 웹 메인 컴포넌트
function WebMainApp() {
  return (
    <SetupProvider>
      <WebMainIos />
    </SetupProvider>
  );
}

// 조건부 렌더링 컴포넌트
function AppRenderer({ appState }: { appState: AppState }) {
  const { updateModal, networkErrorModal } = appState;

  if (networkErrorModal) {
    return <NetworkErrorModal />;
  } else if (updateModal) {
    return <UpdateModal />;
  } else {
    return <WebMainApp />;
  }
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const appState = useAppInitialization();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // 네이티브 앱뷰 모드: expo-router가 전체 네비게이션 관리
  if (USE_APP_VIEW) {
    return (
      <SetupProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(app)" />
        </Stack>
      </SetupProvider>
    );
  }

  return <AppRenderer appState={appState} />;
}
