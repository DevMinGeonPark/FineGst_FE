import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useUpdate } from "../../UpdateProvider";

const { width } = Dimensions.get("window");

interface ForceUpdateModalProps {
  visible?: boolean;
}

/**
 * 강제 업데이트 모달
 * - 업데이트 다운로드 진행률 표시
 * - 다운로드 완료 후 자동 재시작
 */
export default function ForceUpdateModal({ visible }: ForceUpdateModalProps) {
  const {
    isForceUpdateRequired,
    isDownloading,
    isUpdatePending,
    downloadProgress,
    forceUpdate,
  } = useUpdate();

  const isVisible = visible ?? isForceUpdateRequired;

  // 업데이트 다운로드 완료 시 자동 재시작
  useEffect(() => {
    if (isForceUpdateRequired && isUpdatePending && !isDownloading) {
      // 약간의 딜레이 후 재시작 (UI 피드백 위해)
      const timer = setTimeout(() => {
        forceUpdate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isForceUpdateRequired, isUpdatePending, isDownloading, forceUpdate]);

  const progressPercent = Math.round(downloadProgress * 100);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>중요 업데이트</Text>
          <Text style={styles.description}>
            앱을 최신 버전으로 업데이트하고 있습니다.{"\n"}
            잠시만 기다려주세요.
          </Text>

          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            {isDownloading && (
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressPercent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{progressPercent}%</Text>
              </View>
            )}
            {isUpdatePending && !isDownloading && (
              <Text style={styles.statusText}>업데이트 적용 중...</Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    minHeight: 80,
    justifyContent: "center",
  },
  progressBarContainer: {
    width: "100%",
    marginTop: 16,
    alignItems: "center",
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  statusText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666666",
  },
});
