import React, { ReactNode } from "react";
import { View, Text } from "react-native";

// Props 타입을 정의합니다.
interface RateTypeUIProps {
  heading: string;
  children: ReactNode;
}

const RateTypeUI: React.FC<RateTypeUIProps> = ({ heading, children }) => {
  return (
    <View style={{ marginVertical: 10, paddingHorizontal: 6 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>{heading}</Text>
      {children}
    </View>
  );
};

export default RateTypeUI;
