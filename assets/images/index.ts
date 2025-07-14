import { ImageSourcePropType } from "react-native";

// 이미지 타입 정의
export interface Images {
  Logo: ImageSourcePropType;
  FooterTel: ImageSourcePropType;
  FooterNaver: ImageSourcePropType;
  FooterKakao: ImageSourcePropType;
  FooterKAIP: ImageSourcePropType;
  FooterFTC: ImageSourcePropType;
  FooterCICTM: ImageSourcePropType;
  NoImage: ImageSourcePropType;
  ToggleKakao: ImageSourcePropType;
  ToggleTel: ImageSourcePropType;
}

// 이미지 객체 정의
export const Images: Images = {
  Logo: require("./logo.png"),
  FooterTel: require("./footer-tel.png"),
  FooterNaver: require("./footer-naver.png"),
  FooterKakao: require("./footer-kakao.png"),
  FooterKAIP: require("./footer-KAIP.png"),
  FooterFTC: require("./footer-FTC.png"),
  FooterCICTM: require("./footer-CICTM.png"),
  NoImage: require("./no-image.png"),
  ToggleKakao: require("./toggle-katalk.png"),
  ToggleTel: require("./toggle-tel.png"),
};

// 타입 안전한 이미지 접근을 위한 헬퍼 함수
export const getImage = (key: keyof Images): ImageSourcePropType => {
  return Images[key];
};

// 기본 export
export default Images;
