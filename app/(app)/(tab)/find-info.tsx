import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useFixBarStore from "../../../store/fixBarStore";
import { CommonLayout } from "../../../components/layout/CommonLayout";
import axios from "axios";

interface FindUserData {
  error: string;
  message: string;
}

export default function FindInfo() {
  const router = useRouter();
  const { setShowFixBar } = useFixBarStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setShowFixBar(false);
  }, []);

  // 전화번호 입력시 숫자만 입력되도록 처리
  const onChangePhone = (text: string) => {
    const formattedText = text.replace(/[^0-9]/g, "");
    setPhone(formattedText);
  };

  const handleFindPassword = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("알림", "이름과 휴대폰 번호를 모두 입력해주세요.");
      return;
    }

    try {
      const res = await axios.get(`https://kt-online.shop/bbs/password_lost_sms.php?mb_name=${name}&mb_hp=${phone}`);

      const data: FindUserData = res.data;
      if (data.error === "0") {
        Alert.alert("알림", "아이디, 비밀번호를 전송해드렸습니다.");
        router.back();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("에러 발생", error.message);
      } else {
        Alert.alert("에러 발생", "비밀번호 찾기에 실패했습니다.");
      }
    }
  };

  return (
    <CommonLayout>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", gap: 6, backgroundColor: "#FAFAFA", padding: 10, borderBottomColor: "#CCC", borderBottomWidth: 1 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 8 }}>
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "black" }}>정보찾기</Text>
        </View>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", margin: 24 }}>
        <View style={{ width: "100%", backgroundColor: "#e9ecef", padding: 40, borderRadius: 14 }}>
          <Text style={styles.descriptionText}>가입 시 등록한 이름과 휴대폰 번호를 입력해주세요.</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="이름을 입력해주세요."
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <Ionicons name="person" size={20} color="black" style={styles.inputIcon} />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="휴대폰 번호를 입력해주세요."
              placeholderTextColor="#999"
              value={phone}
              onChangeText={onChangePhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <Ionicons name="call" size={20} color="black" style={styles.inputIcon} />
          </View>
          <Text style={styles.helperText}>전화번호는 01012345678 형식으로 입력해주세요.</Text>

          <TouchableOpacity style={styles.findButton} onPress={handleFindPassword} activeOpacity={0.8}>
            <Text style={styles.findButtonText}>아이디/비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CommonLayout>
  );
}

const styles = StyleSheet.create({
  descriptionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginBottom: 16,
    textAlign: "center",
  },
  subDescriptionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    height: 56,
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
    width: 20,
    height: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "black",
    height: 40,
    paddingVertical: 0,
    lineHeight: 20,
  },
  helperText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginLeft: 4,
  },
  findButton: {
    marginTop: 20,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: "#000000",
    backgroundColor: "#000000",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  findButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});
