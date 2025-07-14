import React, { useEffect, useState } from "react";
import { ItemColor } from "../../../types/DetailTypes";
import { useWindowDimensions, Image as RNImage, ActivityIndicator, View, Text } from "react-native";
import { Images } from "../../../assets/images";
import { Circles } from "../atomic/Circles";

interface DetailInfoProps {
  productTitle: string;
  data: ItemColor[];
  errImg?: string;
}

export default function DetailInfo({ productTitle, data, errImg }: DetailInfoProps) {
  const [text, setText] = useState<string>(""); //색상이름
  const [imgUrl, setImgUrl] = useState<string>(""); //색상이미지
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const width = useWindowDimensions().width;
  const imageHeight = width * 0.75; // 4:3 비율로 설정

  useEffect(() => {
    setText(data[0]?.ColorName || "");
    const newImgUrl = data[0]?.ColorImg || errImg || "";
    setImgUrl(newImgUrl);
    setIsLoading(true);
    setHasError(false);

    // 이미지 URL 유효성 검사
    if (newImgUrl && isValidImageUrl(newImgUrl)) {
      RNImage.prefetch(newImgUrl)
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          setHasError(true);
        });
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  }, [data, errImg]);

  const onCirclePress = (index: number) => {
    try {
      setText(data[index]?.ColorName);
      setImgUrl(data[index]?.ColorImg);
    } catch (e) {
      console.log(e);
    }
  };

  const isValidImageUrl = (url: string) => {
    return (
      url && (url.endsWith(".jpg") || url.endsWith(".JPG") || url.endsWith(".png") || url.endsWith(".PNG") || url.endsWith(".jpeg") || url.endsWith(".JPEG"))
    );
  };

  const renderImage = () => {
    if (isLoading) {
      return (
        <View
          style={{
            height: imageHeight,
            width: width,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
    if (hasError || !isValidImageUrl(imgUrl)) {
      return <RNImage source={Images.NoImage} style={{ width, height: imageHeight }} resizeMode="contain" />;
    }

    return <RNImage source={{ uri: imgUrl }} style={{ width, height: imageHeight }} resizeMode="contain" />;
  };

  return (
    <View style={{ marginVertical: 3 }}>
      {renderImage()}
      <View style={{ alignItems: "center", justifyContent: "center", width: "100%" }}>
        <Text style={{ fontWeight: "bold", fontSize: 22, marginVertical: 15 }}>{productTitle}</Text>
        <View
          style={{
            width: 260,
            height: 1,
            backgroundColor: "#1F2937",
          }}
        />
        <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 10, marginBottom: 30 }}>색상 : {text}</Text>
        <Circles colors={data.map((item) => item.ColorRGB)} size={30} gap={10} onCirclePress={onCirclePress} />
      </View>
    </View>
  );
}
