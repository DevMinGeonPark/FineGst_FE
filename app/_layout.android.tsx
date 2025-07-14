import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import { useState, useEffect } from "react";
import { compareVersions } from "../utils/versionChecker";
import UpdateModal from "../components/app-ui/modules/UpdateModal";
import NetworkErrorModal from "../components/app-ui/modules/NetworkErrorModal";
import WebMainAndroid from "../components/web-ui/web-main.android";
import { SplashScreen } from "expo-router";

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
        // 1. 버전 체크
        const versionResult = await compareVersions();

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
      } catch (error) {
        console.log("버전 체크 실패", error);
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
      <WebMainAndroid />
    </SetupProvider>
  );
}

// 조건부 렌더링 컴포넌트
function AppRenderer({ appState }: { appState: AppState }) {
  const { updateModal, networkErrorModal } = appState;

  if (networkErrorModal) {
    return <NetworkErrorModal />;
  } else if (updateModal) {
    // 업데이트 필요 시
    return <UpdateModal />;
  } else {
    // 버전 체크 성공 시
    return <WebMainApp />;
  }
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const appState = useAppInitialization();

  // 폰트 로딩과 스플래시 스크린이 모두 완료될 때까지 대기
  if (!loaded) {
    return null;
  }

  return <AppRenderer appState={appState} />;
}
