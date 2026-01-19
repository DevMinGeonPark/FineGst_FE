import client from "./client";
import { ShopVersion } from "../types/CommonTypes";
import { Platform } from "react-native";
import logger from "../utils/logger";

export async function getShopVersion(): Promise<ShopVersion> {
  let reqPath = "shopversion.php";
  if (Platform.OS === "android") {
    reqPath = "android-shop-version.php";
  } else if (Platform.OS === "ios") {
    reqPath = "ios-shop-version.php";
  }
  const res = await client.post(reqPath, {});
  logger.log(reqPath, res.data);
  return res.data;
}
