import React from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import WebView, { WebViewNavigation } from "react-native-webview";
import { getWebViewOptimizedJavaScript } from "../../utils/webViewOptimizer";

interface CommonWebViewProps {
  webViewRef: React.RefObject<WebView | null>;
  uri: string;
  onNavigationStateChange: (navState: WebViewNavigation) => void;
  onMessage: (event: { nativeEvent: { data: string } }) => void;
  onShouldStartLoadWithRequest: (navState: WebViewNavigation) => boolean;
  onContentProcessDidTerminate?: () => void;
  onHttpError?: (syntheticEvent: any) => void;
  onError?: (syntheticEvent: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onLoadProgress?: ({ nativeEvent }: { nativeEvent: { progress: number } }) => void;
  webViewKey?: number;
  webViewLoaded?: boolean;
  isLoading?: boolean;
  setWebViewKey?: (key: number) => void;
}

export const CommonWebView: React.FC<CommonWebViewProps> = ({
  webViewRef,
  uri,
  onNavigationStateChange,
  onMessage,
  onShouldStartLoadWithRequest,
  onContentProcessDidTerminate,
  onHttpError,
  onError,
  onLoadStart,
  onLoadEnd,
  onLoadProgress,
  webViewKey,
  webViewLoaded,
  isLoading,
  setWebViewKey,
}) => {
  const optimizedJavaScript = getWebViewOptimizedJavaScript();

  const commonProps = {
    ref: webViewRef,
    style: {
      flex: 1,
      backgroundColor: "white",
      ...(webViewLoaded !== undefined &&
        isLoading !== undefined && {
          opacity: webViewLoaded && !isLoading ? 1 : 0,
        }),
    },
    source: { uri: `${uri}?app_page=1` },
    onNavigationStateChange,
    javaScriptEnabled: true,
    bounces: false,
    scrollEnabled: true,
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: false,
    sharedCookiesEnabled: true,
    cacheEnabled: true,
    injectedJavaScript: optimizedJavaScript,
    onMessage,
    scalesPageToFit: false,
    mixedContentMode: "always" as const,
    domStorageEnabled: true,
    setSupportMultipleWindows: false,
    onShouldStartLoadWithRequest,
    decelerationRate: 1.2,
    incognito: false,
    thirdPartyCookiesEnabled: true,
    allowsBackForwardNavigationGestures: false,
    allowsLinkPreview: false,
  };

  const platformSpecificProps =
    Platform.OS === "ios"
      ? {
          allowsInlineMediaPlayback: true,
          originWhitelist: ["*"],
          startInLoadingState: false,
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        }
      : {
          allowsInlineMediaPlayback: undefined,
          originWhitelist: undefined,
          startInLoadingState: true,
          onContentProcessDidTerminate,
        };

  const eventHandlers = {
    onHttpError: (syntheticEvent: any) => {
      const { nativeEvent } = syntheticEvent;
      console.error("WebView HTTP Error: ", nativeEvent.statusCode, nativeEvent.description, nativeEvent.url);
      onHttpError?.(syntheticEvent);
    },
    onError: (syntheticEvent: any) => {
      const { nativeEvent } = syntheticEvent;
      if (nativeEvent.code === -1009) {
        if (setWebViewKey && webViewKey !== undefined) {
          setWebViewKey(webViewKey + 1);
        } else {
          webViewRef.current?.reload();
        }
      }
      console.error("WebView Error: ", nativeEvent.code, nativeEvent.description);
      onError?.(syntheticEvent);
    },
    onLoadStart: () => {
      console.log("WebView 로딩 시작");
      onLoadStart?.();
    },
    onLoadEnd: () => {
      console.log("WebView 로딩 완료");
      onLoadEnd?.();
    },
    onLoadProgress: ({ nativeEvent }: { nativeEvent: { progress: number } }) => {
      console.log("[메인 WebView] onLoadProgress:", nativeEvent.progress);
      onLoadProgress?.({ nativeEvent });
    },
  };

  return <WebView key={webViewKey} {...commonProps} {...platformSpecificProps} {...eventHandlers} />;
};
