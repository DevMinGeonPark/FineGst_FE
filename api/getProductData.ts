import client from "./client";
import { ParamProps } from "../types/ProductTypes";
import { CommonProps } from "../types/CommonTypes";

export async function getProductData(params: ParamProps | CommonProps) {
  const res = await client.post("subpage.php", params);
  // console.log("res", JSON.stringify(res.data));

  return res.data;
}

// subpage.php
// {
//   MenuType: 'ca_id',
//   MenuVar: '20',
//   sort: '',
//   sortodr: ''
// }
