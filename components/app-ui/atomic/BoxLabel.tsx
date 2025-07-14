import React from "react";
import { View, Text, TextStyle } from "react-native";

import { NumberPreprocesser } from "../../../utils/NumberPreprocesser";

interface BoxLabelProps {
  label: string;
  Rate: number;
  fontColor: string;
  fontWeight?: TextStyle["fontWeight"];
}

export default function BoxLabel({ label, Rate, fontColor, fontWeight }: BoxLabelProps) {
  return (
    <View style={{ borderBottomColor: "#DDD", borderBottomWidth: 1 }}>
      <View style={{ padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontWeight: "bold", fontSize: 17 }}>{label}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 17, color: fontColor, fontWeight: fontColor === "#d71826" ? "bold" : fontWeight }}>
            {fontColor === "#d71826" && Rate != 0 ? "-" : ""}
            {NumberPreprocesser(Rate)}
          </Text>
          <Text style={{ fontSize: 17, color: fontColor, fontWeight: fontColor === "#d71826" ? "bold" : fontWeight }}>원</Text>
        </View>
      </View>
    </View>
  );
}
