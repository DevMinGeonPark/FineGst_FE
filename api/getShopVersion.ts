import client from "./client";
import { ShopVersion } from "../types/CommonTypes";
import { Platform } from "react-native";

export async function getShopVersion(): Promise<ShopVersion> {
  let reqPath = "shopversion.php";
  if (Platform.OS === "android") {
    reqPath = "android-shop-version.php";
  } else if (Platform.OS === "ios") {
    reqPath = "ios-shop-version.php";
  }
  const res = await client.post(reqPath, {});
  console.log(reqPath, res.data);
  return res.data;
}
