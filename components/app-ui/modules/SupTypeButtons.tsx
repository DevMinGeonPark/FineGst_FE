import React, { useEffect, useState } from "react";
// import { HStack, Pressable, Box, Text } from '@gluestack-ui/themed';
import { SupportType } from "../../../types/DetailTypes";
import { View, Text, Pressable } from "react-native";

type SupTypeButtonsProps = {
  SupportType: SupportType[];
  setSupType: React.Dispatch<React.SetStateAction<string>>;
  route: Readonly<object | undefined>;
};

export default function SupTypeButtons({ SupportType, setSupType, route }: SupTypeButtonsProps) {
  const [selection, setSelection] = useState<number>(0);
  const subText = SupportType.map((supportType) => supportType.ClickComment);

  useEffect(() => {
    setSupType(selection === 0 ? "Machine" : "Charge");
  }, [selection, setSupType]);

  return (
    <>
      <View style={{ flexDirection: "row", gap: 8, marginVertical: 12 }}>
        {SupportType.map((supportType, index) => (
          <Pressable
            key={index}
            onPress={() => {
              setSelection(index);
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
            <Text style={{ fontSize: 14, fontWeight: "bold", color: "black" }}>{supportType.Title}</Text>
          </Pressable>
        ))}
      </View>
      <View>
        <Text style={{ fontSize: 12, color: "black" }}>{subText[selection]}</Text>
      </View>
    </>
  );
}
