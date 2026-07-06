import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Platform, Linking, Dimensions, StyleSheet, Modal, Pressable } from "react-native";
import WebView, { WebViewNavigation } from "react-native-webview";
import type { WebViewErrorEvent, WebViewHttpErrorEvent } from "react-native-webview/lib/WebViewTypes";
import Constants from "expo-constants";
import { getWebViewOptimizedJavaScript } from "../../utils/webViewOptimizer";
import { useUpdate } from "../UpdateContext";

interface CommonWebViewProps {
  webViewRef: React.RefObject<WebView | null>;
  uri: string;
  onNavigationStateChange: (navState: WebViewNavigation) => void;
  onMessage: (event: { nativeEvent: { data: string } }) => void;
  onShouldStartLoadWithRequest?: (navState: WebViewNavigation) => boolean;
  onContentProcessDidTerminate?: () => void;
  onHttpError?: (syntheticEvent: WebViewHttpErrorEvent) => void;
  onError?: (syntheticEvent: WebViewErrorEvent) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onLoadProgress?: ({ nativeEvent }: { nativeEvent: { progress: number } }) => void;
  webViewKey?: number;
  webViewLoaded?: boolean;
  isLoading?: boolean;
  setWebViewKey?: (key: number) => void;
}

// 에러 UI 컴포넌트
const ErrorView: React.FC<{ onRetry: () => void; errorMessage?: string }> = ({ onRetry, errorMessage }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorIcon}>!</Text>
    <Text style={styles.errorTitle}>페이지를 불러올 수 없습니다</Text>
    <Text style={styles.errorMessage}>{errorMessage || "네트워크 연결을 확인해주세요"}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
      <Text style={styles.retryButtonText}>다시 시도</Text>
    </TouchableOpacity>
  </View>
);

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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // 업데이트 정보 (UpdateProvider context 소비 — useAppUpdates 다중 인스턴스 방지)
  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    isDownloading,
    downloadProgress,
    checkForUpdate,
  } = useUpdate();

  // JavaScript 캐싱
  const optimizedJavaScript = useMemo(() => getWebViewOptimizedJavaScript(), []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => {
      webViewRef.current?.injectJavaScript("window.__setAppHeight && window.__setAppHeight(); true;");
    });
    return () => {
      subscription?.remove();
    };
  }, [webViewRef]);

  // 외부 링크 처리를 위한 JavaScript
  const externalLinkScript = `
    (function() {
      // www 유무를 무시한 동일 사이트 판별 (배너 링크가 www 없는 kt-online.shop으로 걸려 있어
      // 단순 hostname includes 비교로는 외부 링크로 오판됨)
      function isSameSite(href) {
        try {
          const u = new URL(href, window.location.href);
          if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
          const norm = function(h) { return h.replace(/^www\\./, ''); };
          return norm(u.hostname) === norm(window.location.hostname);
        } catch (e) {
          return false;
        }
      }

      function handleExternalLinks() {
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
          const href = link.getAttribute('href');
          const target = link.getAttribute('target');

          const sameSite = href && isSameSite(href);

          // 동일 사이트인데 target=_blank면 WebView 내에서 열리도록 강제
          if (sameSite && target === '_blank') {
            link.setAttribute('target', '_self');
          }

          // 외부 링크 판별
          const isExternalLink =
            href && !sameSite && (
              href.includes('pf.kakao.com') ||
              href.includes('kakaotalk://') ||
              href.includes('tel:') ||
              href.includes('mailto:') ||
              href.includes('maps.app.goo.gl') ||
              href.includes('naver.me') ||
              target === '_blank' ||
              href.startsWith('http')
            );

          if (isExternalLink) {
            // 동일 링크에 리스너 중복 부착 방지 (MutationObserver 재실행 대응)
            if (link.dataset.rnExternalHandled === 'true') {
              return;
            }
            link.dataset.rnExternalHandled = 'true';

            link.addEventListener('click', function(e) {
              // 리스너 부착 이후 페이지 JS가 href를 바꿔치기할 수 있으므로 클릭 시점의 href 사용
              var currentHref = link.href || href;

              // 같은 사이트로 바뀐 경우 WebView 기본 내비게이션에 맡김
              if (isSameSite(currentHref)) return;

              e.preventDefault();
              e.stopPropagation();

              // React Native로 메시지 전송
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'EXTERNAL_LINK',
                url: currentHref
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

          // 카카오톡 앱 설치 여부 확인 후 열기
          Linking.canOpenURL(Platform.OS === "ios" ? "kakaoplus://" : "kakaotalk://")
            .then((supported) => {
              if (supported) {
                // 카카오톡 앱으로 열기
                Linking.openURL(kakaoAppUrl).catch(() => {
                  // 실패 시 대체 스킴 시도
                  const fallbackUrl = Platform.OS === "ios" ? `kakaotalk://plusfriend/home/${channelId}` : `kakaoplus://plusfriend/home/${channelId}`;
                  Linking.openURL(fallbackUrl).catch(() => {
                    // 대체 스킴도 실패 시 웹으로
                    Linking.openURL(url).catch(() => {});
                  });
                });
              } else {
                // 카카오톡 앱이 없으면 웹 브라우저로
                Linking.openURL(url).catch(() => {});
              }
            })
            .catch(() => {
              // canOpenURL 실패 시 웹 브라우저로
              Linking.openURL(url).catch(() => {});
            });
        } else {
          // 일반 외부 링크 처리
          Linking.openURL(url).catch(() => {});
        }
        return;
      }
    } catch {
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
    source: { uri },
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
    mixedContentMode: "compatibility" as const,
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
          textZoom: 100,
          userAgent: "Mozilla/5.0 (Linux; Android 12; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
          onContentProcessDidTerminate,
        };

  // 다시 시도 핸들러
  const handleRetry = () => {
    setHasError(false);
    setErrorMessage(undefined);
    if (setWebViewKey && webViewKey !== undefined) {
      setWebViewKey(webViewKey + 1);
    } else {
      webViewRef.current?.reload();
    }
  };

  const eventHandlers = {
    onHttpError: (syntheticEvent: WebViewHttpErrorEvent) => {
      const { nativeEvent } = syntheticEvent;
      // 4xx, 5xx 에러 시 에러 UI 표시
      if (nativeEvent.statusCode >= 400) {
        setHasError(true);
        setErrorMessage(`서버 오류가 발생했습니다 (${nativeEvent.statusCode})`);
      }
      onHttpError?.(syntheticEvent);
    },
    onError: (syntheticEvent: WebViewErrorEvent) => {
      const { nativeEvent } = syntheticEvent;
      setHasError(true);
      // 에러 코드별 메시지 설정
      if (nativeEvent.code === -1009) {
        setErrorMessage("인터넷 연결이 없습니다");
      } else if (nativeEvent.code === -1001) {
        setErrorMessage("요청 시간이 초과되었습니다");
      } else {
        setErrorMessage(nativeEvent.description || "페이지를 불러올 수 없습니다");
      }
      onError?.(syntheticEvent);
    },
    onLoadStart: () => {
      setHasError(false);
      onLoadStart?.();
    },
    onLoadEnd: () => {
      onLoadEnd?.();
    },
    onLoadProgress: ({ nativeEvent }: { nativeEvent: { progress: number } }) => {
      onLoadProgress?.({ nativeEvent });
    },
  };

  // 에러 상태일 때 에러 UI 표시
  if (hasError) {
    return <ErrorView onRetry={handleRetry} errorMessage={errorMessage} />;
  }

  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const updateId = currentlyRunning?.updateId;
  const channel = currentlyRunning?.channel;
  const runtimeVersion = currentlyRunning?.runtimeVersion;
  const isEmbeddedLaunch = currentlyRunning?.isEmbeddedLaunch;
  const isEmergencyLaunch = currentlyRunning?.isEmergencyLaunch;

  const getUpdateStatus = () => {
    if (isDownloading) return `다운로드 중 (${Math.round(downloadProgress * 100)}%)`;
    if (isUpdatePending) return "대기 중 (재시작 시 적용)";
    if (isUpdateAvailable) return "업데이트 있음";
    return "최신 상태";
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView key={webViewKey} {...commonProps} {...platformSpecificProps} {...eventHandlers} />

      {/* 버전 텍스트 (길게 누르면 디버그 패널) */}
      <Pressable onLongPress={() => setShowDebugPanel(true)} delayLongPress={500}>
        <Text style={styles.versionText}>v{appVersion}</Text>
      </Pressable>

      {/* 디버그 패널 모달 */}
      <Modal
        visible={showDebugPanel}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDebugPanel(false)}
      >
        <Pressable style={styles.debugOverlay} onPress={() => setShowDebugPanel(false)}>
          <View style={styles.debugPanel}>
            <Text style={styles.debugTitle}>업데이트 정보</Text>

            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>앱 버전</Text>
              <Text style={styles.debugValue}>{appVersion}</Text>
            </View>

            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>업데이트 ID</Text>
              <Text style={styles.debugValue} numberOfLines={1}>
                {updateId ? updateId.slice(0, 8) + "..." : "없음 (번들)"}
              </Text>
            </View>

            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>채널</Text>
              <Text style={styles.debugValue}>{channel || "없음"}</Text>
            </View>

            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>런타임 버전</Text>
              <Text style={styles.debugValue} numberOfLines={1}>
                {runtimeVersion ? runtimeVersion.slice(0, 12) + "..." : "없음"}
              </Text>
            </View>

            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>상태</Text>
              <Text style={[styles.debugValue, isUpdatePending && styles.debugPending]}>
                {getUpdateStatus()}
              </Text>
            </View>

            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>번들 실행</Text>
              <Text style={styles.debugValue}>{isEmbeddedLaunch ? "예" : "아니오"}</Text>
            </View>

            {isEmergencyLaunch && (
              <View style={styles.debugRow}>
                <Text style={[styles.debugLabel, { color: "#dc3545" }]}>긴급 실행</Text>
                <Text style={[styles.debugValue, { color: "#dc3545" }]}>예</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.debugButton}
              onPress={async () => {
                await checkForUpdate();
              }}
            >
              <Text style={styles.debugButtonText}>업데이트 확인</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.debugCloseButton}
              onPress={() => setShowDebugPanel(false)}
            >
              <Text style={styles.debugCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

// 스타일
const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#dc3545",
    marginBottom: 16,
    width: 64,
    height: 64,
    lineHeight: 64,
    textAlign: "center",
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#dc3545",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    position: "absolute",
    bottom: 4,
    right: 8,
    fontSize: 10,
    color: "rgba(0, 0, 0, 0.2)",
  },
  debugOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  debugPanel: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    maxWidth: 320,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 16,
    textAlign: "center",
  },
  debugRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  debugLabel: {
    fontSize: 13,
    color: "#6c757d",
  },
  debugValue: {
    fontSize: 13,
    color: "#212529",
    fontWeight: "500",
    maxWidth: 160,
    textAlign: "right",
  },
  debugPending: {
    color: "#28a745",
  },
  debugButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  debugButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  debugCloseButton: {
    paddingVertical: 10,
    marginTop: 8,
  },
  debugCloseText: {
    color: "#6c757d",
    fontSize: 14,
    textAlign: "center",
  },
});
