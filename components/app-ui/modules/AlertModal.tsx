import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../../store/authStore";
import { encrypt } from "../../../utils/Encrypt";
import useDeleteMember from "../../../hooks/useDeleteMember";

interface AlertModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AlertModal({ isVisible, onClose }: AlertModalProps) {
  const { user, logout } = useAuthStore();
  const [password, setPassword] = useState("");
  const deleteMember = useDeleteMember();

  const handleDeleteMember = async () => {
    if (!password.trim()) {
      Alert.alert("알림", "비밀번호를 입력해주세요.");
      return;
    }

    Alert.alert("회원탈퇴 확인", "정말로 탈퇴하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "탈퇴",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMember.mutateAsync({
              KTShopID: user?.UserId || "",
              KTShopPW: encrypt(password),
            });

            Alert.alert("알림", "회원탈퇴가 완료되었습니다.");
            logout();
            onClose();
          } catch (error) {
            if (error instanceof Error) {
              Alert.alert("에러 발생", error.message);
            } else {
              Alert.alert("에러 발생", "회원탈퇴에 실패했습니다.");
            }
          }
        },
      },
    ]);
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>회원탈퇴</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* 본문 */}
            <View style={styles.body}>
              <Text style={styles.bodyText}>정말 회원에서 탈퇴하시겠습니까?</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="비밀번호를 입력해주세요."
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                />
                <Ionicons name="lock-closed" size={20} color="black" style={styles.inputIcon} />
              </View>
            </View>

            {/* 푸터 */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={deleteMember.isPending}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, deleteMember.isPending && styles.deleteButtonDisabled]}
                onPress={handleDeleteMember}
                disabled={deleteMember.isPending}
              >
                <Text style={styles.deleteButtonText}>{deleteMember.isPending ? "처리중..." : "탈퇴"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContent: {
    padding: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  closeButton: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  bodyText: {
    fontSize: 16,
    color: "black",
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  inputIcon: {
    marginRight: 12,
    width: 20,
    height: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "black",
    height: 40,
    paddingVertical: 0,
  },
  footer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 0.5,
    borderRightColor: "#E5E5E5",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 0.5,
    borderLeftColor: "#E5E5E5",
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#DC3545",
    fontWeight: "bold",
  },
});
