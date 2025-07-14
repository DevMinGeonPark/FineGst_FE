import React, { useEffect, useState } from "react";
// import { HStack, Pressable, Box, Text } from '@gluestack-ui/themed';
import { RegiType } from "../../../types/DetailTypes";
import { View, Text, Pressable } from "react-native";

type SignTypeButtonsProps = {
  regiTypes: RegiType[];
  route: Readonly<object | undefined>;
};

export default function SignTypeButtons({ regiTypes, route }: SignTypeButtonsProps) {
  const [selection, setSelection] = useState<number>(0);

  const subText = regiTypes.map((regiType) => regiType.ClickComment);

  return (
    <>
      <View style={{ flexDirection: "row", gap: 8, marginVertical: 12 }}>
        {regiTypes.map((regiType, index) => (
          <Pressable
            key={index}
            onPress={() => setSelection(index)}
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
            <Text style={{ fontSize: 14, fontWeight: "bold", color: "black" }}>{regiType.Title}</Text>
          </Pressable>
        ))}
      </View>
      <View>
        <Text style={{ fontSize: 14, color: "black" }}>{subText[selection]}</Text>
      </View>
    </>
  );
}
