import { useRef, useState, useEffect } from "react";
import { BackHandler, Linking } from "react-native";
import WebView, { WebViewNavigation } from "react-native-webview";
import { WEB_URL } from "@env";
import logger from "../utils/logger";

interface UseWebViewReturn {
  webViewRef: React.RefObject<WebView | null>;
  uri: string;
  currentUrl: string;
  canGoBack: boolean;
  handleUri: (url: string) => void;
  handleBackPress: () => boolean;
  onNavigationStateChange: (navState: WebViewNavigation) => void;
  handleWebViewMessage: (event: { nativeEvent: { data: string } }) => void;
  onShouldStartLoadWithRequest: (navState: WebViewNavigation) => boolean;
}

export const useWebView = (): UseWebViewReturn => {
  const webViewRef = useRef<WebView | null>(null);
  const [uri, setUri] = useState<string>(WEB_URL);
  const [currentUrl, setCurrentUrl] = useState<string>(WEB_URL);
  const [canGoBack, setCanGoBack] = useState(false);

  // app_page=1 파라미터 부착 제거 (BE 측 ?app_page1 깨짐 이슈) — setUri 자체가 안정 참조라 useCallback 불필요
  const handleUri = setUri;

  const handleBackPress = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  // 외부 브라우저로 열고 앱 내에서 페이지 이동 처리하는 함수
  const handleExternalBrowserAndRedirect = (url: string) => {
    Linking.openURL(url)
      .then(() => {
        // 외부 브라우저가 성공적으로 열린 후 앱은 이전 페이지 또는 메인으로 돌아가기
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
        } else {
          handleUri(WEB_URL);
        }
      })
      .catch((err) => {
        logger.error("외부 브라우저로 링크 열기 실패:", err);
      });
  };

  const onNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);
    logger.log("WebView 현재 URL:", navState.url);
  };

  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    const messageData = event.nativeEvent.data;

    // 기존 close 메시지 처리
    if (messageData === "close") {
      webViewRef.current?.stopLoading();
      webViewRef.current?.goBack();
      return;
    }

    // 새창 열기 메시지 처리
    try {
      const parsedData = JSON.parse(messageData);
      if (parsedData.type === "openExternal" && parsedData.url) {
        handleExternalBrowserAndRedirect(parsedData.url);
      }
    } catch (error) {
      // JSON 파싱 실패 시 무시
    }
  };

  const onShouldStartLoadWithRequest = (navState: WebViewNavigation): boolean => {
    // 모든 요청을 내부 WebView에서 처리하도록 설정
    return true;
  };

  // 뒤로가기 핸들러
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => backHandler.remove();
  }, [canGoBack]);

  return {
    webViewRef,
    uri,
    currentUrl,
    canGoBack,
    handleUri,
    handleBackPress,
    onNavigationStateChange,
    handleWebViewMessage,
    onShouldStartLoadWithRequest,
  };
};
