import axios, { AxiosInstance } from "axios";
import { getKTShopKey } from "../utils/KTShopKey";

const client: AxiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
});

// Set initial common headers
client.defaults.headers.common["Content-Type"] = "application/json";
client.defaults.headers.common["KTShopKey"] = getKTShopKey();

console.log(getKTShopKey());

// Update KTShopKey value every 10 seconds
const updateKTShopKey = () => {
  client.defaults.headers.common["KTShopKey"] = getKTShopKey();
};
setInterval(updateKTShopKey, 30000);

export default client;
