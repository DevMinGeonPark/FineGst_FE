import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useState, useEffect } from "react";
import { compareVersions } from "../utils/versionChecker";
import { shouldShowWebMain } from "../api/shouldShowWebMain";
import UpdateModal from "../components/app-ui/modules/UpdateModal";
import NetworkErrorModal from "../components/app-ui/modules/NetworkErrorModal";
import WebMainIos from "../components/web-ui/web-main.ios";
import { View, StyleSheet } from "react-native";

SplashScreen.preventAutoHideAsync();

// 타입 정의
interface AppState {
  updateModal: boolean;
  networkErrorModal: boolean;
  ico: boolean;
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
    ico: true,
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. 버전 체크
        const versionResult = await compareVersions();

        if (versionResult.isNetworkError) {
          setAppState((prev) => ({ ...prev, networkErrorModal: true }));
          return;
        }

        if (versionResult.needsUpdate) {
          setAppState((prev) => ({ ...prev, updateModal: true }));
          return;
        }

        // 2. ICO 값 가져오기
        const icoValue = await shouldShowWebMain();
        console.log("icoValue", icoValue);
        setAppState((prev) => ({ ...prev, ico: icoValue }));
      } catch (error) {
        console.log("ICO 값을 가져오는 데 실패했습니다.", error);
        setAppState((prev) => ({ ...prev, ico: false }));
      }
    };

    initializeApp();
  }, []);

  return appState;
}

// 메인 앱 컴포넌트
function AppMainApp() {
  return (
    <SetupProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(app)">
        <Stack.Screen name="(app)" />
      </Stack>
      <StatusBar style="auto" />
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
  const { updateModal, ico } = appState;

  // 스플래시 스크린 제어용 상태
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setSplashVisible(false);
      await SplashScreen.hideAsync();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 폰트 로딩, 스플래시 스크린이 모두 완료될 때까지 대기
  if (!loaded || splashVisible) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <AppMainApp />
      {/* updateModal이 true면 UpdateModal 오버레이 */}
      {updateModal && (
        <View style={styles.overlay} pointerEvents="box-none">
          <UpdateModal />
        </View>
      )}
      {/* !ico가 true면 WebMain 오버레이 */}
      {!ico && !updateModal && (
        <View style={styles.overlay} pointerEvents="box-none">
          <WebMainApp />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
