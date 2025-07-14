import client from "./client";
import { encrypt } from "../utils/Encrypt";
import { LoginParams } from "../types/axiosTypes";

export async function login(params: LoginParams) {
  // hard code , 변경 요

  // 실제 API 호출을 주석처리
  const data = {
    KTShopID: params.id,
    KTShopPW: encrypt(params.password),
  };
  const res = await client.post("login.php", data);
  return res.data;

  // 더미 응답 데이터
  // return {
  //   Status: "A10",
  //   UserNm: "webMaster",
  //   ErrMsg: "",
  // };
}
