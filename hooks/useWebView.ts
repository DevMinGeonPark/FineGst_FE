import { useRef, useState, useEffect } from "react";
import { BackHandler, Linking } from "react-native";
import WebView, { WebViewNavigation } from "react-native-webview";
import { WEB_URL } from "@env";

interface UseWebViewReturn {
  webViewRef: React.RefObject<WebView | null>;
  uri: string;
  setUri: (uri: string) => void;
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
  const [canGoBack, setCanGoBack] = useState(false);

  const handleUri = (url: string) => {
    setUri(url.includes("?app_page=1") ? url : `${url}?app_page=1`);
  };

  const handleBackPress = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  const onNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    console.log("WebView 현재 URL:", navState.url);
  };

  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    if (event.nativeEvent.data === "close") {
      webViewRef.current?.stopLoading();
      webViewRef.current?.goBack();
    }
  };

  const onShouldStartLoadWithRequest = (navState: WebViewNavigation): boolean => {
    const { url } = navState;
    const isInternal = url.startsWith("https://kt-online.shop");
    const isForm = url.includes("/form");

    if (!isInternal || isForm) {
      Linking.openURL(url).catch((err) => console.error("URL 열기 실패:", err));
      return false;
    }
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
    setUri,
    canGoBack,
    handleUri,
    handleBackPress,
    onNavigationStateChange,
    handleWebViewMessage,
    onShouldStartLoadWithRequest,
  };
};
