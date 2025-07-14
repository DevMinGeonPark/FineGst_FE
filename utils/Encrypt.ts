import { ENCRYPT_SECRET_KEY } from "@env";
import cryptoJs from "crypto-js";

// 암호화
export const encrypt = (text: string) => {
  if (typeof text !== "string" || !text) {
    throw new Error("encrypt 함수에 잘못된 값이 들어왔습니다: " + text);
  }
  if (typeof ENCRYPT_SECRET_KEY !== "string" || !ENCRYPT_SECRET_KEY) {
    throw new Error("ENCRYPT_SECRET_KEY가 정의되지 않았습니다.");
  }
  const cipher = cryptoJs.AES.encrypt(text, cryptoJs.enc.Utf8.parse(ENCRYPT_SECRET_KEY.substring(0, 32)), {
    iv: cryptoJs.enc.Utf8.parse(""),
    padding: cryptoJs.pad.Pkcs7,
    mode: cryptoJs.mode.CBC,
  });
  return cipher.toString();
};
