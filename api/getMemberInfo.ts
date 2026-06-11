import client from "./client";
import { ParamProps } from "../types/axiosTypes";
import logger from "../utils/logger";

export async function getMemberInfo(params: ParamProps) {
  // const res = await client.post("memberinfo.php", params);

  // hard code , 변경 요
  // const res = await client.post("memberinfo.php", {
  //   KTShopID: "web366",
  //   KTShopPW: "123456",
  // });
  const res = await client.post("memberinfo.php", {
    KTShopID: params.KTShopID,
    KTShopPW: params.KTShopPW,
  });

  // 회원 정보 응답 로깅 — 개인정보 노출 방지를 위해 개발 환경에서만 출력
  logger.log("getMemberInfo res.data:", res.data);
  return res.data;
}
