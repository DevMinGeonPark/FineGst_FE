// import AdCopy from "@atomic/AdCopy.ios";
import { Images } from "@/assets/images";
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import useAuthStore from "../../../store/authStore";
import { NumberPreprocesser } from "@/utils/NumberPreprocesser copy";
import AlertModal from "./AlertModal";

function Header() {
  const router = useRouter();
  const pathname = usePathname(); // 현재 경로 확인

  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);

  const { isLoggedIn, user, logout } = useAuthStore();

  const handleWithdrawPress = () => {
    setIsAlertModalVisible(true);
  };

  return (
    <View style={{ width: "100%" }}>
      <View
        style={{ padding: 10, justifyContent: "space-between", borderBottomColor: "#CCC", borderBottomWidth: 1, alignItems: "center", flexDirection: "row" }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 14, color: "black" }}>KT화인지에스티</Text>
          <Text style={{ fontWeight: "bold", fontSize: 14, color: "red" }}>회원 전용 App</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={() => {
              if (isLoggedIn) {
                logout();
              } else {
                router.replace("/login");
              }
            }}
          >
            {isLoggedIn ? <Text>로그아웃</Text> : <Text>로그인</Text>}
          </Pressable>
          {!isLoggedIn ? (
            <>
              <Text>|</Text>
              <Pressable onPress={() => router.replace("/register")}>
                <Text>회원가입</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text>|</Text>
              <Pressable onPress={handleWithdrawPress}>
                <Text>회원탈퇴</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
      <View style={{ paddingVertical: 0 }}>
        <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 0 }}>
          <View style={{ paddingVertical: 5 }}>
            <Pressable
              onPress={() => {
                if (pathname !== "/app-main") {
                  router.replace("/app-main");
                }
              }}
            >
              <Image style={{ width: 140, height: 40, resizeMode: "contain" }} alt="logo" source={Images.Logo} />
            </Pressable>
          </View>
        </View>
      </View>
      <View style={{ borderBottomWidth: 1, borderTopWidth: 0.1, borderColor: "#CCC" }} />
      {isLoggedIn && (
        <View style={{ padding: 6, borderBottomColor: "black", borderBottomWidth: 1.5, alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: "black", margin: 5 }}>
            {user?.UserNm}님 보유하신 포인트: {NumberPreprocesser(user?.Point || 0)} Point 입니다.
          </Text>
        </View>
      )}

      <AlertModal isVisible={isAlertModalVisible} onClose={() => setIsAlertModalVisible(false)} />
    </View>
  );
}

export default Header;
