import React from "react";
import { View, ActivityIndicator, Platform, Linking } from "react-native";
import WebView, { WebViewNavigation } from "react-native-webview";
import { getWebViewOptimizedJavaScript } from "../../utils/webViewOptimizer";

interface CommonWebViewProps {
  webViewRef: React.RefObject<WebView | null>;
  uri: string;
  onNavigationStateChange: (navState: WebViewNavigation) => void;
  onMessage: (event: { nativeEvent: { data: string } }) => void;
  onShouldStartLoadWithRequest?: (navState: WebViewNavigation) => boolean;
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

  // 외부 링크 처리를 위한 JavaScript
  const externalLinkScript = `
    (function() {
      function handleExternalLinks() {
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
          const href = link.getAttribute('href');
          const target = link.getAttribute('target');
          
          // 외부 링크 판별
          const isExternalLink = 
            href && (
              href.includes('pf.kakao.com') ||
              href.includes('kakaotalk://') ||
              href.includes('tel:') ||
              href.includes('mailto:') ||
              href.includes('maps.app.goo.gl') ||
              href.includes('naver.me') ||
              target === '_blank' ||
              (href.startsWith('http') && !href.includes(window.location.hostname))
            );
          
          if (isExternalLink) {
            link.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              
              // React Native로 메시지 전송
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'EXTERNAL_LINK',
                url: href
              }));
            });
          }
        });
      }
      
      // DOM이 로드된 후 실행
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleExternalLinks);
      } else {
        handleExternalLinks();
      }
      
      // 동적으로 추가되는 링크들을 위한 MutationObserver
      const observer = new MutationObserver(handleExternalLinks);
      observer.observe(document.body, { childList: true, subtree: true });
    })();
  `;

  const combinedJavaScript = optimizedJavaScript + "\n" + externalLinkScript;

  // 메시지 처리 핸들러
  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "EXTERNAL_LINK") {
        const url = data.url;

        // 카카오톡 상담 링크 특별 처리
        if (url.includes("pf.kakao.com")) {
          // iOS와 Android 모두에서 작동하는 카카오톡 채널 링크 처리
          const channelId = url.replace("https://pf.kakao.com/", "");

          // iOS에서 더 정확한 카카오톡 URL 스킴 사용
          let kakaoAppUrl;
          if (Platform.OS === "ios") {
            // iOS: 카카오톡 채널로 직접 이동하는 스킴
            kakaoAppUrl = `kakaoplus://plusfriend/home/${channelId}`;
          } else {
            // Android: 기존 방식 유지
            kakaoAppUrl = `kakaotalk://plusfriend/home/${channelId}`;
          }

          console.log(`${Platform.OS}에서 카카오톡 링크 처리:`, { originalUrl: url, channelId, kakaoAppUrl });

          // 먼저 카카오톡 앱이 설치되어 있는지 확인
          Linking.canOpenURL(Platform.OS === "ios" ? "kakaoplus://" : "kakaotalk://")
            .then((supported) => {
              if (supported) {
                // 카카오톡 앱이 설치되어 있으면 앱으로 열기
                console.log("카카오톡 앱으로 열기 시도:", kakaoAppUrl);
                Linking.openURL(kakaoAppUrl).catch((err) => {
                  console.log("카카오톡 앱 열기 실패, 대체 스킴 시도");
                  // iOS에서 첫 번째 스킴이 실패하면 다른 스킴 시도
                  const fallbackUrl = Platform.OS === "ios" ? `kakaotalk://plusfriend/home/${channelId}` : `kakaoplus://plusfriend/home/${channelId}`;

                  Linking.openURL(fallbackUrl).catch(() => {
                    console.log("대체 스킴도 실패, 웹으로 시도");
                    Linking.openURL(url).catch(() => {
                      console.log("웹 브라우저 열기도 실패");
                    });
                  });
                });
              } else {
                // 카카오톡 앱이 없으면 웹 브라우저에서 열기
                console.log("카카오톡 앱 없음, 웹 브라우저로 열기:", url);
                Linking.openURL(url).catch(() => {
                  console.log("웹 브라우저 열기 실패");
                });
              }
            })
            .catch(() => {
              // canOpenURL 체크 실패시 웹 브라우저로 열기
              console.log("URL 체크 실패, 웹 브라우저로 시도:", url);
              Linking.openURL(url).catch(() => {
                console.log("웹 브라우저 열기 실패");
              });
            });
        } else {
          // 일반 외부 링크 처리
          Linking.openURL(url)
            .then(() => {
              console.log("외부 링크 열기 성공:", url);
            })
            .catch((err) => {
              console.log("외부 링크 열기 실패:", url);
            });
        }
        return;
      }
    } catch (error) {
      // JSON 파싱 실패 시 무시하고 원래 onMessage 호출
    }

    // 원래 onMessage 핸들러 호출
    onMessage(event);
  };

  // 기본 onShouldStartLoadWithRequest 핸들러 - 모든 요청을 내부 WebView에서 처리
  const defaultShouldStartLoadWithRequest = (navState: WebViewNavigation) => {
    // JavaScript injection에서 이미 외부 링크를 처리하므로 여기서는 모든 요청을 허용
    return true;
  };

  const finalShouldStartLoadWithRequest = onShouldStartLoadWithRequest || defaultShouldStartLoadWithRequest;

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
    injectedJavaScript: combinedJavaScript,
    onMessage: handleMessage,
    scalesPageToFit: false,
    mixedContentMode: "always" as const,
    domStorageEnabled: true,
    setSupportMultipleWindows: false,
    allowsProtectedMedia: true,
    mediaPlaybackRequiresUserAction: false,
    onShouldStartLoadWithRequest: finalShouldStartLoadWithRequest,
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
          userAgent: "Mozilla/5.0 (Linux; Android 12; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
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
