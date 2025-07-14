import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToggleIcons from "../app-ui/modules/toggleIcons";
import PopupModal from "../app-ui/modules/PopupModal";
import { SplashScreen } from "expo-router";
import { useWebView } from "../../hooks/useWebView";
import { usePopupModalState } from "../../hooks/usePopupModalState";
import { CommonWebView } from "./CommonWebView";

export default function WebMain() {
  const { webViewRef, uri, handleUri, onNavigationStateChange, handleWebViewMessage, onShouldStartLoadWithRequest } = useWebView();

  const { modal, closeModal, popupData, defaultPopupData } = usePopupModalState();
  const [webViewKey, setWebViewKey] = useState<number>(0);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggleShow, setIsToggleShow] = useState<boolean>(true);

  // 디버깅을 위한 로그 추가
  console.log("팝업 모달 상태:", { modal, popupData, webViewLoaded, isLoading });

  const onContentProcessDidTerminate = () => {
    webViewRef.current?.reload();
  };

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // 스플래시를 WebView가 완전히 로드된 후에만 숨김
  useEffect(() => {
    if (webViewLoaded && !isLoading) {
      console.log("웹뷰 로딩 완료 - 스플래시 스크린 숨김");
    }
  }, [webViewLoaded, isLoading]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <CommonWebView
          webViewRef={webViewRef}
          uri={uri}
          onNavigationStateChange={onNavigationStateChange}
          onMessage={handleWebViewMessage}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onContentProcessDidTerminate={onContentProcessDidTerminate}
          webViewKey={webViewKey}
          webViewLoaded={webViewLoaded}
          isLoading={isLoading}
          setWebViewKey={setWebViewKey}
          onLoadStart={() => {
            setIsLoading(true);
            setWebViewLoaded(false);
          }}
          onLoadEnd={() => {
            setWebViewLoaded(true);
            setIsLoading(false);
          }}
        />
      </View>

      <PopupModal visible={modal} onClose={closeModal} showCloseButton={true} handleUri={handleUri} data={popupData || defaultPopupData} />

      {isToggleShow && <ToggleIcons />}
    </SafeAreaView>
  );
}
