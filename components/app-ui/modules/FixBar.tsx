import React from "react";
import { Linking, View, Text, Pressable } from "react-native";

import { NumberPreprocesser } from "../../../utils/NumberPreprocesser";
import useFixBarStore from "../../../store/fixBarStore";

export default function FixBar() {
  const { fixBarProps } = useFixBarStore();

  return (
    <View style={{ backgroundColor: "#000", padding: 15 }}>
      {/* 상단 텍스트 영역 */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <View style={{ alignItems: "center", paddingBottom: 10 }}>
          <Text style={{ color: "#fff", fontSize: 14 }}>월 할부금</Text>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{NumberPreprocesser(fixBarProps?.ChgContractMonthChg || 0)}원</Text>
        </View>
        <Text style={{ color: "#fff", fontSize: 30, fontWeight: "bold", paddingBottom: 10 }}>+</Text>
        <View style={{ alignItems: "center", paddingBottom: 10 }}>
          <Text style={{ color: "#fff", fontSize: 14 }}>월 통신요금</Text>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{NumberPreprocesser(fixBarProps?.ChgContractMonthRate || 0)}원</Text>
        </View>
        <Text style={{ color: "#fff", fontSize: 30, fontWeight: "bold", paddingBottom: 10 }}>=</Text>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "#fff", fontSize: 14 }}>월 통신요금</Text>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{NumberPreprocesser(fixBarProps?.ChgContractMonthTotal || 0)}원</Text>
          <Text style={{ color: "#fff", fontSize: 12 }}>(할부이자 별도)</Text>
        </View>
      </View>

      {/* 하단 버튼 영역 */}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <Pressable
          style={{
            backgroundColor: "#5ddfde",
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            borderRadius: 5,
          }}
          onPress={() => Linking.openURL(fixBarProps?.OrderPage || "")}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>주문하기</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "#f9e000",
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            borderRadius: 5,
          }}
          onPress={() => Linking.openURL("https://pf.kakao.com/_ULWxfd")}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>카톡상담</Text>
        </Pressable>
      </View>
    </View>
  );
}
