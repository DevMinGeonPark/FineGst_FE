import React from "react";
import { Linking, BackHandler, Platform, Modal, View, Image, TouchableOpacity, StyleSheet, Text } from "react-native";

// import SubNotice from "@src/Atomic/UpdateModal/SubNotice";
// import MainNotice from "@src/Atomic/UpdateModal/MainNotice";
import { Ionicons } from "@expo/vector-icons";

export default function UpdateModal() {
  const handleExitApp = () => {
    BackHandler.exitApp();
  };
  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <Image style={styles.appIcon} source={require("../../../assets/icon.png")} />
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 30, color: "#e5e5e5" }}>UP</Text>
                <Ionicons name="checkmark-circle" size={30} color="#67e39a" style={{ marginLeft: 4 }} />
              </View>
              <Text style={{ fontSize: 30, color: "#e5e5e5" }}>DATE</Text>
            </View>
          </View>
          <View>
            <Text style={styles.title}>새로운 버전이</Text>
            <Text style={styles.title}>업데이트 되었어요</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 14, color: "black" }}>스토어 이동 후 앱이 보이지 않으면</Text>
            <Text style={{ fontSize: 14, color: "black" }}>휴대폰의 OS를 먼저 업데이트해주세요</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.exitButton]} onPress={handleExitApp}>
              <Text style={{ fontSize: 15, color: "black" }}>앱종료</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={() => {
                let url = "";
                // eslint-disable-next-line no-unused-expressions
                Platform.OS === "android"
                  ? (url = "https://play.google.com/store/apps/details?id=com.finegst.mshop&hl=ko")
                  : (url = "https://apps.apple.com/ph/app/%EC%A3%BC-%ED%99%94%EC%9D%B8%EC%A7%80%EC%97%90%EC%8A%A4%ED%8B%B0/id6468455648");
                Linking.openURL(url).catch((err) => console.error("Could not open the store page.", err));
              }}
            >
              <Text style={{ fontSize: 15, color: "white" }}>지금 업데이트</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    width: "85%",
    alignItems: "flex-start",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  appIcon: {
    width: 64,
    height: 64,
    marginRight: 16,
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 30,
    width: "100%",
    justifyContent: "center",
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  exitButton: {
    backgroundColor: "#f0f0f0",
  },
  updateButton: {
    backgroundColor: "#222222",
  },
  title: {
    fontSize: 20,
    color: "black",
    fontWeight: "bold",
    textAlign: "left",
    width: "100%",
  },
});
