import { Images } from "@/assets/images";
import React from "react";
import { Image, View } from "react-native";

export default function Logos() {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        flexWrap: "wrap",
      }}
    >
      <Image source={Images.FooterFTC} alt="FTC" style={{ width: 60, height: 80, flex: 1, maxWidth: 70 }} resizeMode="contain" />
      <Image source={Images.FooterKAIP} alt="KAIP" style={{ width: 80, height: 80, flex: 1, maxWidth: 100 }} resizeMode="contain" />
      <Image source={Images.FooterCICTM} alt="CICTM" style={{ width: 80, height: 80, flex: 1, maxWidth: 100 }} resizeMode="contain" />
    </View>
  );
}
