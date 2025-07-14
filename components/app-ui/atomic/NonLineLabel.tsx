import React from "react";
import { View, Text } from "react-native";
import { NumberPreprocesser } from "../../../utils/NumberPreprocesser";

interface NonLineLabelProps {
  label: string;
  Rate: number;
}

export default function NonLineLabel({ label, Rate }: NonLineLabelProps) {
  return (
    <View style={{ padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ fontSize: 15, color: "#AAAAAA" }}>{label}</Text>
      <Text style={{ fontSize: 15, color: "#AAAAAA" }}>{NumberPreprocesser(Rate.toString()) + " 원"}</Text>
    </View>
  );
}
