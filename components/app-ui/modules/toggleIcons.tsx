import React from "react";
import { Linking, View } from "react-native";
import { Images } from "../../../assets/images";
import ToggleIcon from "../atomic/ToggleIcon";

const ToggleIcons = () => {
  return (
    <View style={{ position: "absolute", bottom: 60, right: 20, zIndex: 999, gap: 6 }}>
      <ToggleIcon iconName={Images.ToggleKakao} onPress={() => Linking.openURL("http://pf.kakao.com/_ULWxfd/chat")} />
      <ToggleIcon iconName={Images.ToggleTel} onPress={() => Linking.openURL("tel:1577-3795")} />
    </View>
  );
};

export default ToggleIcons;
