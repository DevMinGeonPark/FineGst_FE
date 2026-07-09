import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import { useState, useEffect } from "react";
import { compareVersions } from "../utils/versionChecker";
import UpdateModal from "../components/app-ui/modules/UpdateModal";
import NetworkErrorModal from "../components/app-ui/modules/NetworkErrorModal";
import WebMainAndroid from "../components/web-ui/web-main.android";
import { SetupProvider } from "../components/SetupProvider";
import { useColdStartNotification } from "../hooks/useColdStartNotification";
import { useNotifications } from "../hooks/useNotifications";
import { usePushToken } from "../hooks/usePushToken";

SplashScreen.preventAutoHideAsync();

// 타입 정의
interface AppState {
  updateModal: boolean;
  networkErrorModal: boolean;
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
    // 마운트 시 1회 비동기 초기화 — setState는 모두 await 이후에 발생 (SDK 56 lint 대응, 동작 변경 없음)
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return <AppRenderer appState={appState} onRetry={retry} />;
}
