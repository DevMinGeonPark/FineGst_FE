import { encrypt } from "./Encrypt";

export const getTime = (): string => {
  let date = new Date();
  let year = date.getFullYear();
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let day = ("0" + date.getDate()).slice(-2);
  let hours = ("0" + date.getHours()).slice(-2);
  let minute = ("0" + date.getMinutes()).slice(-2);
  let second = ("0" + date.getSeconds()).slice(-2);

  return year + month + day + hours + minute + second;
};

export const getKTShopKey = (): string => {
  // console.log(encrypt(getTime()));
  return encrypt(getTime());
};

export const encryptKTShopKey = (text: string): string => {
  return encrypt(text);
};
