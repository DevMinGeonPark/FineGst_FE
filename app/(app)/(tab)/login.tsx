import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useFixBarStore from "../../../store/fixBarStore";
import { CommonLayout } from "../../../components/layout/CommonLayout";
import useLogin from "../../../hooks/useLogin";

export default function Login() {
  const router = useRouter();
  const { setShowFixBar } = useFixBarStore();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: login } = useLogin({ id, loginType: "login" });

  useEffect(() => {
    setShowFixBar(false);
  }, []);

  return (
    <CommonLayout>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", gap: 6, backgroundColor: "#FAFAFA", padding: 10, borderBottomColor: "#CCC", borderBottomWidth: 1 }}>
          <Ionicons style={{ marginTop: 8 }} name="person" size={20} color="black" />
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "black" }}>Login</Text>
        </View>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", margin: 24 }}>
        <View style={{ width: "100%", backgroundColor: "#e9ecef", padding: 40, borderRadius: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "black", marginBottom: 12 }}>가입하신 아이디와 비밀번호를 입력해주세요.</Text>

          {/* 아이디 입력 필드 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="아이디를 입력해주세요."
              placeholderTextColor="#999"
              value={id}
              onChangeText={setId}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <Ionicons name="person" size={20} color="black" style={styles.inputIcon} />
          </View>

          {/* 비밀번호 입력 필드 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="비밀번호를 입력해주세요."
              placeholderTextColor="#999"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <Ionicons name="lock-closed" size={20} color="black" style={styles.inputIcon} />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => {
              console.log("press, login", id, password);
              login({ id, password });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>

          {/* 정보찾기 */}
          <View style={styles.findInfoContainer}>
            <TouchableOpacity style={styles.findInfoButton} onPress={() => router.push("/(app)/(tab)/find-info")}>
              <Ionicons name="search" size={16} color="black" />
              <Text style={styles.findInfoText}>정보찾기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </CommonLayout>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "black",
    paddingVertical: 8,
    lineHeight: 20,
  },
  loginButton: {
    marginTop: 20,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: "#000000",
    backgroundColor: "#000000",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  findInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  findInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  findInfoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});
