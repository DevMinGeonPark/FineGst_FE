import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from "react-native";
import Constants from "expo-constants";
import { useUpdate } from "../../UpdateContext";

/**
 * OTA 업데이트 버전 표시 + 디버그 패널
 * - 좌하단 소형 텍스트로 앱 버전 · 실행 중인 업데이트 ID 앞 8자리 표시 (프로덕션 포함)
 *   → 사용자 응대 시 이 8자리로 어떤 OTA가 적용된 상태인지 구분
 *   → 우하단은 웹 콘텐츠의 카카오톡/전화 플로팅 버튼과 겹쳐 터치를 가로채므로 좌하단 고정
 * - 길게 누르면 업데이트 정보 모달 표시
 * - update context 구독을 이 컴포넌트로 격리해 다운로드 진행률 tick이
 *   WebView 화면 전체를 리렌더하지 않도록 한다
 */
export const UpdateDebugPanel: React.FC = () => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    isDownloading,
    downloadProgress,
    checkForUpdate,
  } = useUpdate();

  const channel = currentlyRunning?.channel;

  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const updateId = currentlyRunning?.updateId;
  const updateIdShort = updateId ? updateId.slice(0, 8) : "번들";
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
    <>
      {/* 버전 · 업데이트 ID 텍스트 (길게 누르면 디버그 패널) */}
      <Pressable style={styles.versionBadge} onLongPress={() => setShowDebugPanel(true)} delayLongPress={500}>
        <Text style={styles.versionText}>{`v${appVersion} · ${updateIdShort}`}</Text>
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
    </>
  );
};

const styles = StyleSheet.create({
  versionBadge: {
    position: "absolute",
    bottom: 4,
    left: 8,
  },
  versionText: {
    fontSize: 10,
    color: "rgba(0, 0, 0, 0.25)",
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

export default UpdateDebugPanel;
