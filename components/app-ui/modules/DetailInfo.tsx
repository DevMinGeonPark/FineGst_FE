import React, { useEffect, useState } from "react";
import { ItemColor } from "../../../types/DetailTypes";
import { useWindowDimensions, Image as RNImage, ActivityIndicator, View, Text } from "react-native";
import { Images } from "../../../assets/images";
import { Circles } from "../atomic/Circles";
import { logger } from "../../../utils/logger";

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

  const isValidImageUrl = (url: string) => {
    return (
      url && (url.endsWith(".jpg") || url.endsWith(".JPG") || url.endsWith(".png") || url.endsWith(".PNG") || url.endsWith(".jpeg") || url.endsWith(".JPEG"))
    );
  };

  useEffect(() => {
    // 색상 데이터 변경 시 표시 상태 동기화 — 기존 패턴 유지 (SDK 56 업그레이드에서 동작 변경 금지, 추후 리팩터링 대상)
    /* eslint-disable react-hooks/set-state-in-effect */
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
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [data, errImg]);

  const onCirclePress = (index: number) => {
    try {
      setText(data[index]?.ColorName);
      setImgUrl(data[index]?.ColorImg);
    } catch (e) {
      logger.log(e);
    }
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
