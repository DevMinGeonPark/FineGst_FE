import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToggleIcons from "../app-ui/modules/toggleIcons";
import PopupModal from "../app-ui/modules/PopupModal";
import { SplashScreen } from "expo-router";
import { useWebView } from "../../hooks/useWebView";
import { usePopupModalState } from "../../hooks/usePopupModalState";
import { CommonWebView } from "./CommonWebView";

export default function WebMain() {
  const { webViewRef, uri, handleUri, onNavigationStateChange, handleWebViewMessage, onShouldStartLoadWithRequest } = useWebView();

  const { modal, setModal, popupData, defaultPopupData } = usePopupModalState();
  const [isToggleShow, setIsToggleShow] = useState<boolean>(true);

  // 스플래시 화면 숨김 처리
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webviewContainer}>
        <CommonWebView
          webViewRef={webViewRef}
          uri={uri}
          onNavigationStateChange={onNavigationStateChange}
          onMessage={handleWebViewMessage}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        />
      </View>

      <PopupModal visible={modal} onClose={() => setModal(false)} showCloseButton={true} handleUri={handleUri} data={popupData || defaultPopupData} />

      {isToggleShow && <ToggleIcons />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  webviewContainer: {
    flex: 1,
  },
});
