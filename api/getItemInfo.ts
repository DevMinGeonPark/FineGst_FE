import client from "./client";
import { ParamProps } from "../types/DetailTypes";

export async function getItemInfo(data: ParamProps) {
  // 05.07 버전
  const res = await client.post("iteminfo.php", data);

  return res.data;
}
