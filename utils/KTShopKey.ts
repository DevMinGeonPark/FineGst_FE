import { encrypt } from "./Encrypt";

// 서버가 이 타임스탬프를 한국시간 기준으로 검증(약 3분 이내 과거만 허용)하므로
// 기기 시간대와 무관하게 항상 KST로 생성해야 함 — 로컬 시간을 쓰면 해외 사용자 전원이 API 거부됨
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export const getTime = (): string => {
  let date = new Date(Date.now() + KST_OFFSET_MS);
  let year = date.getUTCFullYear();
  let month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
  let day = ("0" + date.getUTCDate()).slice(-2);
  let hours = ("0" + date.getUTCHours()).slice(-2);
  let minute = ("0" + date.getUTCMinutes()).slice(-2);
  let second = ("0" + date.getUTCSeconds()).slice(-2);

  return year + month + day + hours + minute + second;
};

export const getKTShopKey = (): string => {
  // console.log(encrypt(getTime()));
  return encrypt(getTime());
};

export const encryptKTShopKey = (text: string): string => {
  return encrypt(text);
};
