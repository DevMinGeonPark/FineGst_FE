import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToggleIcons from "../app-ui/modules/toggleIcons";
import PopupModal from "../app-ui/modules/PopupModal";
import { useWebView } from "../../hooks/useWebView";
import { usePopupModalState } from "../../hooks/usePopupModalState";
import { CommonWebView } from "./CommonWebView";

export default function WebMain() {
  const { webViewRef, uri, currentUrl, handleUri, onNavigationStateChange, handleWebViewMessage, onShouldStartLoadWithRequest } = useWebView();

  const { modal, closeModal, popupData, defaultPopupData } = usePopupModalState();

  // it_id가 URL에 포함되면 토글 숨김 (상품 상세 페이지)
  const isToggleShow = useMemo(() => {
    return !currentUrl.includes("it_id=");
  }, [currentUrl]);

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

      <PopupModal visible={modal} onClose={closeModal} showCloseButton={true} handleUri={handleUri} data={popupData || defaultPopupData} />

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
