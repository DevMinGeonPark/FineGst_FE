// import Copyrigth from "@atomic/Copyrigth";
import LOCAL_VERSION from "@/utils/localVersion";
import React from "react";
import { Text, View } from "react-native";
import Copyrigth from "../atomic/Copyrigth";
import Logos from "../atomic/Logos";

export default function InfoContainer() {
  return (
    <View style={{ padding: 6, alignItems: "center", justifyContent: "center" }}>
      <View style={{ flexDirection: "row" }}>
        <Text style={{ fontSize: 14 }}>회사명: </Text>
        <Text style={{ fontSize: 14, fontWeight: "bold" }}>(주)화인지에스티</Text>
        <Text style={{ fontSize: 14 }}> 대표자: 박근우</Text>
      </View>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 14, textAlign: "center" }}>주소: 서울특별시 강서구 마곡중앙로 59-21, 7층 707-710호(마곡동, 에이스타워2)</Text>
        <Text style={{ textAlign: "center" }}>사업자번호: 119-81-88667</Text>
        <Text style={{ textAlign: "center" }}>통신판매업신고번호: 2020-서울강서-0419호</Text>
        <View style={{ flexDirection: "row" }}>
          <Text>이메일: </Text>
          <Text style={{ fontWeight: "bold" }}>fine@finegst.com</Text>
        </View>
        <Text style={{ textAlign: "center" }}>개인정보관리: 한경호</Text>
        <Text style={{ textAlign: "center" }}>Version: {LOCAL_VERSION}</Text>
      </View>
      <Logos />
      <Copyrigth />
    </View>
  );
}
