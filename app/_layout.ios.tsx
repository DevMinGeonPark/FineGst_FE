import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { compareVersions } from "../utils/versionChecker";
import { shouldShowWebMain } from "../api/shouldShowWebMain";
import UpdateModal from "../components/app-ui/modules/UpdateModal";
import WebMainIos from "../components/web-ui/web-main.ios";
import { SetupProvider } from "../components/SetupProvider";
import { useColdStartNotification } from "../hooks/useColdStartNotification";
import { useNotifications } from "../hooks/useNotifications";
import { usePushToken } from "../hooks/usePushToken";

SplashScreen.preventAutoHideAsync();

// 타입 정의
interface AppState {
  updateModal: boolean;
  useAppView: boolean;
  isLoading: boolean;
}

// 앱 초기화 커스텀 훅
function useAppInitialization() {
  const [appState, setAppState] = useState<AppState>({
    updateModal: false,
    useAppView: true,
    isLoading: true,
  });

  const initializeApp = async () => {
    try {
      // 1. 버전 체크 (5초 타임아웃 적용)
      const versionResult = await compareVersions();

      // 타임아웃/네트워크 에러 시 앱 정상 진입 (다음 실행 시 다시 체크)
      // 메인 분기는 웹뷰이므로 버전 체크 API 실패로 앱 진입을 막지 않음 — 실제 오프라인이면 웹뷰 자체 에러 UI가 처리
      if (versionResult.isTimeout || versionResult.isNetworkError) {
        // 실패해도 ico 값은 체크
        const icoValue = await shouldShowWebMain();
        setAppState({ updateModal: false, useAppView: icoValue, isLoading: false });
        return;
      }

      if (versionResult.needsUpdate) {
        // 업데이트 필요 시
        setAppState((prev) => ({ ...prev, updateModal: true }));
        return;
      }

      // 2. ICO 값 가져오기 (앱뷰/웹뷰 결정)
      const icoValue = await shouldShowWebMain();
      setAppState({ updateModal: false, useAppView: icoValue, isLoading: false });
    } catch {
      // 실패 시 앱뷰로 진입 (iOS 심사용)
      setAppState({ updateModal: false, useAppView: true, isLoading: false });
    }
  };

  useEffect(() => {
    // 마운트 시 1회 비동기 초기화 — setState는 모두 await 이후에 발생 (SDK 56 lint 대응, 동작 변경 없음)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initializeApp();
  }, []);

  return { appState };
}

// 네이티브 앱뷰 컴포넌트 (iOS 앱스토어 심사용)
function AppMainApp() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(app)">
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

// 웹 메인 컴포넌트
function WebMainApp({ suppressPopup }: { suppressPopup: boolean }) {
  return <WebMainIos suppressPopup={suppressPopup} />;
}

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { appState } = useAppInitialization();
  const { updateModal, useAppView, isLoading } = appState;

  // 푸시 알림 초기화: 권한 요청 및 토큰 생성
  useNotifications();
  // 푸시 토큰 서버 등록
  usePushToken();

  // Cold start: 앱이 종료된 상태에서 알림을 탭하여 실행된 경우 처리
  useColdStartNotification();

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

  // 업데이트 모달
  if (updateModal) {
    return <UpdateModal />;
  }

  // 앱뷰/웹뷰 동시 렌더링 후 opacity로 전환 (심사용 구조 유지)
  // SetupProvider(UpdateProvider 포함)는 루트에 1회만 마운트하여 업데이트 체크 중복 실행 방지
  return (
    <SetupProvider>
      <View style={{ flex: 1 }}>
        <View style={{ ...StyleSheet.absoluteFill, opacity: isLoading ? 0 : useAppView ? 1 : 0, zIndex: useAppView ? 1 : 0 }} pointerEvents={useAppView ? "auto" : "none"}>
          <AppMainApp />
        </View>
        <View style={{ ...StyleSheet.absoluteFill, opacity: isLoading ? 0 : useAppView ? 0 : 1, zIndex: useAppView ? 0 : 1 }} pointerEvents={useAppView ? "none" : "auto"}>
          <WebMainApp suppressPopup={useAppView || isLoading} />
        </View>
      </View>
    </SetupProvider>
  );
}
