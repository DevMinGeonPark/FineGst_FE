import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useUpdate } from "../../UpdateProvider";

interface UpdateBannerProps {
  /** 배너 표시 위치 */
  position?: "top" | "bottom";
}

/**
 * 업데이트 준비 완료 시 표시되는 배너
 * 사용자가 탭하면 앱이 즉시 재시작되어 새 버전이 적용됩니다.
 */
export function UpdateBanner({ position = "bottom" }: UpdateBannerProps) {
  const { isUpdatePending, forceUpdate } = useUpdate();

  if (!isUpdatePending) {
    return null;
  }

  const handlePress = async () => {
    await forceUpdate();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        position === "top" ? styles.top : styles.bottom,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.text}>새 버전이 준비되었습니다</Text>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>지금 적용</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  top: {
    top: 60,
  },
  bottom: {
    bottom: 100,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 12,
  },
  buttonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default UpdateBanner;
