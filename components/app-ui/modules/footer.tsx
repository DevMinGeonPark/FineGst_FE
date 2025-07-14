import { Images } from "@/assets/images";
import React from "react";
import { Linking, View } from "react-native";
import InfoContainer from "./InfoContainer";
import SocialContainer from "./SocialContainer";

export default function Footer() {
  return (
    <View>
      <View style={{ backgroundColor: "black", padding: 30, marginBottom: 20 }}>
        <SocialContainer image={Images.FooterTel} title="1577-3795" desc="월-토 09:00 - 18:00 상담가능!" onPress={() => Linking.openURL(`tel:1577-3795`)} />
        <SocialContainer
          image={Images.FooterKakao}
          title="카카오톡채널"
          desc="클릭하면 바로 1:1 상담가능!"
          onPress={() => Linking.openURL("http://pf.kakao.com/_ULWxfd/chat")}
        />
        <SocialContainer
          image={Images.FooterNaver}
          title="네이버 톡톡"
          desc="클릭하면 바로 1:1 상담가능!"
          onPress={() => Linking.openURL("https://talk.naver.com/ct/wc981y")}
        />
      </View>
      <InfoContainer />
    </View>
  );
}
