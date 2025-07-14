import React from "react";
import { Text, useWindowDimensions, View } from "react-native";

type TitleProps = {
  title: string;
  desc: string;
};

export default function Title({ title, desc }: TitleProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: "100%" }}>
        <Text style={{ fontSize: 30, fontWeight: "bold", zIndex: 2, textAlign: "center" }}>{title}</Text>
        <View
          style={{
            backgroundColor: "#ffcd00",
            position: "absolute",
            bottom: 0,
            marginTop: 30,
            width: width - width / 2.7,
            height: 16,
            zIndex: 1,
            alignSelf: "center",
          }}
        />
      </View>
      <View style={{ width: "100%", marginTop: 20 }}>
        <Text style={{ fontSize: 20, textAlign: "center", fontWeight: "bold" }}>{desc}</Text>
      </View>
    </View>
  );
}
