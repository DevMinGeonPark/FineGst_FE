import React, { FC } from "react";
import { Image, ImageSourcePropType, Pressable, Text, View } from "react-native";

interface Props {
  image: ImageSourcePropType;
  title: string;
  desc: string;
  onPress?: () => void;
}

const SocialContainer: FC<Props> = ({ image, title, desc, onPress }) => {
  return (
    <View style={{ alignItems: "center" }}>
      <Pressable
        style={{
          borderBottomColor: "#555",
          borderBottomWidth: 1,
          width: 240,
          justifyContent: "center",
          paddingVertical: 8,
        }}
        onPress={onPress}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {image && <Image alt="Social Logo" resizeMode="contain" style={{ width: 48, height: 48 }} source={image} />}
          <View style={{ marginLeft: 12, gap: 2 }}>
            <Text style={{ fontWeight: "bold", color: "white", fontSize: 20 }}>{title}</Text>
            <Text style={{ fontWeight: "normal", color: "white", fontSize: 13 }}>{desc}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

export default SocialContainer;
