import React, { useEffect, useState } from "react";
import { Image, Pressable, View, Text } from "react-native";
import { ItemList } from "../../../types/ProductTypes";
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { Circles } from "./Circles";
import ToDetailButton from "../atomic/ToDetailButton";

function ProductCard(data: ItemList) {
  const [color, setColor] = useState<string[]>([]);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const router = useRouter();
  const routeName = useRoute().name;

  useEffect(() => {
    const colors = data.ItemColor.match(/#[a-f0-9]{6}/g) || [];
    setColor(colors);
  }, [data.ItemColor]);

  useEffect(() => {
    setIsPressed(false);
  }, [routeName]);

  const handlePress = () => {
    setIsPressed(true);
    router.replace({
      pathname: "/(app)/(tab)/detail",
      params: {
        name: "애플",
        MenuType: data.MenuType,
        MenuVar: data.MenuVar,
        it_id: data.ItemCode,
      },
    });
  };

  return (
    <Pressable
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={handlePress}
      style={{
        padding: 2,
        backgroundColor: "white",
        width: "100%",
        borderColor: "rgb(231, 231, 231)",
        borderWidth: 1,
        borderRadius: 30,
        margin: 1,
      }}
    >
      <View
        style={{
          padding: 10,
        }}
      >
        <View
          style={{
            alignItems: "center",
          }}
        >
          {data.ItemImgUrl && (
            <Image
              width={118}
              height={127}
              resizeMode="cover"
              alt="product img"
              source={{
                uri: data.ItemImgUrl || "",
              }}
            />
          )}
        </View>
        <View
          style={{
            alignItems: "center",
          }}
        >
          <Text style={{ height: 50, fontSize: 14, fontWeight: "bold" }}>{data.ItemName}</Text>
          <View style={{ width: "100%" }}>
            <Circles colors={color || []} size={16} onCirclePress={() => {}} />
          </View>
        </View>
      </View>
      <ToDetailButton isPressed={isPressed} />
    </Pressable>
  );
}

export default ProductCard;
