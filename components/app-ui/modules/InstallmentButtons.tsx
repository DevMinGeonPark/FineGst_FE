import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";

type InstallmentButtonsProps = {
  ForMonth: string[];
  setInstallment: React.Dispatch<React.SetStateAction<string>>;
  route: Readonly<object | undefined>;
};

export default function InstallmentButtons({ ForMonth, setInstallment, route }: InstallmentButtonsProps) {
  const [selection, setSelection] = useState<number>(0);

  return (
    <View style={{ flexDirection: "row", gap: 8, marginVertical: 12 }}>
      {ForMonth.map((month, index) => (
        <Pressable
          key={index}
          onPress={() => {
            setSelection(index);
            setInstallment(month);
          }}
          style={{
            flex: 1,
            borderWidth: selection === index ? 2 : 1,
            borderColor: selection === index ? "#5ddfde" : "#DDD",
            backgroundColor: selection === index ? "#f0f9ff" : "white",
            padding: 8,
            borderRadius: 6,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "black" }}>{month + "개월"}</Text>
        </Pressable>
      ))}
    </View>
  );
}
