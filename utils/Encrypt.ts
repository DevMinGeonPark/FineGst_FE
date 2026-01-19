import { ENCRYPT_SECRET_KEY } from "@env";
import { AES, Utf8, Pkcs7, CBC } from "crypto-es";

// 암호화
export const encrypt = (text: string) => {
  if (typeof text !== "string" || !text) {
    throw new Error("encrypt 함수에 잘못된 값이 들어왔습니다: " + text);
  }
  if (typeof ENCRYPT_SECRET_KEY !== "string" || !ENCRYPT_SECRET_KEY) {
    throw new Error("ENCRYPT_SECRET_KEY가 정의되지 않았습니다.");
  }
  const cipher = AES.encrypt(text, Utf8.parse(ENCRYPT_SECRET_KEY.substring(0, 32)), {
    iv: Utf8.parse(""),
    padding: Pkcs7,
    mode: CBC,
  });
  return cipher.toString();
};
