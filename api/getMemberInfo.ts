import client from "./client";
import { ParamProps } from "../types/axiosTypes";

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

  console.log("getMemberInfo res.data:", res.data);
  return res.data;
}
