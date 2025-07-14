import React from "react";
import { View, Text } from "react-native";
import { NumberPreprocesser } from "../../../utils/NumberPreprocesser";

interface RateBoxProps {
  Rate: number;
}

export default function RateBox({ Rate }: RateBoxProps) {
  return (
    <View
      style={{ marginTop: 15, marginHorizontal: 12, padding: 12, backgroundColor: "#5ddfde", marginBottom: 20, alignItems: "center", justifyContent: "center" }}
    >
      <View style={{ flexDirection: "row", alignItems: "baseline", margin: 2 }}>
        <Text style={{ fontSize: 16 }}>(월)</Text>
        <Text style={{ fontWeight: "bold", fontSize: 22 }}>{NumberPreprocesser(Rate.toString())}</Text>
        <Text>원</Text>
      </View>
      <Text style={{ marginBottom: 3, fontSize: 14 }}>부가세포함, 할부이자 별도</Text>
    </View>
  );
}
