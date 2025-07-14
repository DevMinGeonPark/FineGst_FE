import React from "react";
import { Text, View } from "react-native";

export default function Copyrigth() {
  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        <Text style={{ fontSize: 14, fontWeight: "bold" }}>KT 공식몰©</Text>
        <Text style={{ fontSize: 13 }}> All rights reserved.</Text>
      </View>
    </View>
  );
}
