import { useFocusEffect, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { View, Alert, Platform } from "react-native";
import { CommonLayout } from "../../../components/layout/CommonLayout";
import { WebView } from "react-native-webview";

export default function Register() {
  const injectedJavaScriptOnLoad = `

    // zoom in이 되지않도록 scale을 1로 고정
    const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);

    // app에서 필요없는 요소들을 숨김
    var header = document.querySelector('.m-header');
    if (header) {
      header.style.display = 'none';
    }

    var atFooter = document.querySelector('.at-footer');
    if (atFooter) {
        atFooter.style.display = 'none';
    }

    var atMenu = document.querySelector('.at-menu'); 
    if (atMenu) { 
        atMenu.style.display = 'none'; 
    }

    var IDInput = document.getElementById('reg_mb_id');
    if (IDInput) {
      IDInput.autocapitalize = "none";
    }

    // 웹 요소의 최종 Height를 알아내기 위한 코드
    var lastHeight = document.documentElement.scrollHeight;

    new MutationObserver(function() {
      var newHeight = document.documentElement.scrollHeight;
      if (newHeight !== lastHeight) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            scrollHeight: newHeight,
          })
        );
        lastHeight = newHeight;
      }
    }).observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true
    });
    
    window.ReactNativeWebView.postMessage(
       JSON.stringify({
         scrollHeight: document.documentElement.scrollHeight,
       })
     );

    // bbs/register_form.php에서 취소버튼 무효화
    const cancel = document.querySelector('#fregisterform > .text-center > .btn.btn-black');
    if (cancel) {
      cancel.href = "" //cancel 무효화
    
      cancel.addEventListener('click', function(event) {
        event.preventDefault();
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            isClicked: true,
          })
        );
      });
    }

    // Alert 처리
    window.alert = function(message) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'alert',
        message,
      }));
    };
 
    // confirm 처리
    window.confirm = function(message) {
      var result = true; 
 
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'confirm',
        message,
        result,
      }));
 
      return result;
    };

    // submit 처리
    document.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'submit',
        data: new FormData(event.target)
      }));
    });

    var ipin = document.getElementById('win_ipin_cert');
    if (ipin) {
      ipin.style.display = 'none';
    }
    
     true;
  `;

  const router = useRouter();

  const [webViewKey, setWebViewKey] = useState<number>(0);
  const [height, setHeight] = useState(600); // 기본 높이 설정

  const webViewRef = useRef<WebView>(null);

  useFocusEffect(
    React.useCallback(() => {
      // 페이지에 진입할 때마다 WebView를 초기화합니다.
      setWebViewKey((prev) => prev + 1);
    }, [])
  );

  const handleNavigationChange = (navState: { url: string }) => {
    if (navState.url === "https://www.kt-online.shop/bbs/register_result.php") {
      router.replace("/");
    }
  };

  const handleOnMessage = (event: { nativeEvent: { data: string } }) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.scrollHeight) {
      // 사이즈 처리 - 최소 높이 보장
      const newHeight = Math.max(data.scrollHeight, 600);
      setHeight(newHeight);
    } else if (data.isClicked) {
      // 취소 버튼 클릭 시 로그인 페이지로 이동
      router.replace("/login");
    } else {
      // alert, confirm 처리
      switch (data.type) {
        case "alert":
          Alert.alert("알림", data.message);
          break;
        case "confirm":
          Alert.alert("확인", data.message, [
            { text: "확인", onPress: () => console.log("확인") },
            {
              text: "취소",
              onPress: () => console.log("취소"),
              style: "cancel",
            },
          ]);
          break;
        default:
          break;
      }
    }
  };

  return (
    <CommonLayout>
      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ flex: 1, backgroundColor: "white", borderRadius: 8, overflow: "hidden" }}>
          <WebView
            ref={webViewRef}
            key={webViewKey}
            source={{ uri: "https://www.kt-online.shop/bbs/register.php" }}
            style={{ height: height, opacity: 0.99, minHeight: 600 }}
            javaScriptEnabled={true}
            sharedCookiesEnabled={true}
            cacheEnabled={false}
            injectedJavaScript={injectedJavaScriptOnLoad}
            scalesPageToFit={false}
            allowsInlineMediaPlayback
            mixedContentMode="always"
            domStorageEnabled={true}
            onMessage={handleOnMessage}
            setSupportMultipleWindows={false}
            onNavigationStateChange={handleNavigationChange}
            startInLoadingState={Platform.OS === "ios" ? false : true}
            userAgent={
              Platform.OS === "ios"
                ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
                : undefined
            }
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView error: ", nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView HTTP error: ", nativeEvent);
            }}
          />
        </View>
      </View>
    </CommonLayout>
  );
}
