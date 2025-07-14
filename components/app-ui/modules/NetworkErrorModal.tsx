import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, BackHandler, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NetworkErrorModal() {
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
                <Text style={{ fontSize: 30, color: "#e5e5e5" }}>NETWORK</Text>
                <Ionicons name="alert-circle" size={30} color="#e36a6a" style={{ marginLeft: 4 }} />
              </View>
              <Text style={{ fontSize: 30, color: "#e5e5e5" }}>ERROR</Text>
            </View>
          </View>
          <View>
            <Text style={styles.title}>네트워크 에러가 발생했습니다.</Text>
            <Text style={styles.title}>인터넷 연결을 확인한 후 다시 시도해 주세요.</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.exitButton]} onPress={handleExitApp}>
              <Text style={{ fontSize: 15, color: "black" }}>앱종료</Text>
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
  title: {
    fontSize: 20,
    color: "black",
    fontWeight: "bold",
    textAlign: "left",
    width: "100%",
    marginBottom: 4,
  },
});
