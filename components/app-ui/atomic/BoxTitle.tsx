import React from "react";
import { View, Text } from "react-native";

interface BoxTitleProps {
  title: string;
  borderWidth: number;
}

export default function BoxTitle({ title, borderWidth }: BoxTitleProps) {
  return (
    <View style={{ padding: 10, borderBottomColor: "#DDD", borderBottomWidth: borderWidth }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>{title}</Text>
    </View>
  );
}
