import React from "react";
import { Text, StyleSheet, StyleProp, TextStyle } from "react-native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";

/**
 * 앱 버전 · 실행 중인 OTA 업데이트 ID 앞 8자리 소형 텍스트 (예: "v11.0.0 · 019f473f")
 * 에러/업데이트 화면에서 사용자가 불러주는 값으로 어떤 코드가 실행 중인지 식별하는 용도
 * UpdateProvider 밖(강제 업데이트 모달 등)에서도 렌더링되므로 컨텍스트 대신 expo-updates 상수를 직접 읽음
 */
export function VersionTag({ style }: { style?: StyleProp<TextStyle> }) {
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const updateIdShort = Updates.updateId ? Updates.updateId.slice(0, 8) : "번들";
  return <Text style={[styles.text, style]}>{`v${appVersion} · ${updateIdShort}`}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 11,
    color: "rgba(0, 0, 0, 0.3)",
  },
});
