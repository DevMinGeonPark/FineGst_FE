import { Text, View } from "react-native";
import React from "react";

interface ToDetailButtonProps {
  isPressed: boolean;
}

export default function ToDetailButton({ isPressed }: ToDetailButtonProps) {
  return (
    <View
      style={{
        margin: 20,
        paddingVertical: 10,
        paddingHorizontal: 0,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#bbb",
        backgroundColor: isPressed ? "#f43f5e" : "white",
        borderRadius: 30,
      }}
    >
      <Text style={{ fontSize: 10, color: isPressed ? "white" : "#222", fontWeight: "normal" }}>자세히보기</Text>
    </View>
  );
}
