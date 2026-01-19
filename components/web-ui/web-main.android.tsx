import React, { useEffect, useState, useMemo } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToggleIcons from "../app-ui/modules/toggleIcons";
import PopupModal from "../app-ui/modules/PopupModal";
import { SplashScreen } from "expo-router";
import { useWebView } from "../../hooks/useWebView";
import { usePopupModalState } from "../../hooks/usePopupModalState";
import { CommonWebView } from "./CommonWebView";

export default function WebMain() {
  const { webViewRef, uri, currentUrl, handleUri, onNavigationStateChange, handleWebViewMessage, onShouldStartLoadWithRequest } = useWebView();

  const { modal, closeModal, popupData, defaultPopupData } = usePopupModalState();
  const [webViewKey, setWebViewKey] = useState<number>(0);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // it_id가 URL에 포함되면 토글 숨김 (상품 상세 페이지)
  const isToggleShow = useMemo(() => {
    return !currentUrl.includes("it_id=");
  }, [currentUrl]);

  const onContentProcessDidTerminate = () => {
    webViewRef.current?.reload();
  };

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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
