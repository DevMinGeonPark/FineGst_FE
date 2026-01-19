import axios, { AxiosInstance } from "axios";
import { AppState, AppStateStatus } from "react-native";
import { BASE_URL } from "@env";
import logger from "../utils/logger";
import { getKTShopKey } from "../utils/KTShopKey";

const KEY_REFRESH_INTERVAL = 30000; // 30초

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "ktshopkey",
  "password",
  "ktshoppw",
  "token",
  "refresh_token",
  "access_token",
]);

const normalizeHeaders = (headers: unknown): Record<string, unknown> => {
  if (!headers) return {};
  const maybeHeaders = headers as { toJSON?: () => Record<string, unknown> };
  if (typeof maybeHeaders.toJSON === "function") {
    return maybeHeaders.toJSON();
  }
  return { ...(headers as Record<string, unknown>) };
};

const sanitizeValue = (value: unknown): unknown => {
  if (value instanceof FormData) {
    return "[FormData]";
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, childValue] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = sanitizeValue(childValue);
      }
    }
    return result;
  }
  return value;
};

const parseJsonIfPossible = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const buildFullUrl = (baseURL?: string, url?: string) => {
  if (!url) return baseURL || "";
  if (/^https?:\/\//i.test(url)) return url;
  if (!baseURL) return url;
  return `${baseURL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
};

// TODO: 필요할 때 주석을 해제해서 에러 상세 로그를 확인하세요.
// client.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const config = error?.config;
//     const response = error?.response;
//     const headers = sanitizeValue(normalizeHeaders(config?.headers));
//     const params = sanitizeValue(config?.params);
//     const data = sanitizeValue(parseJsonIfPossible(config?.data));
//     const responseData = sanitizeValue(response?.data);
//
//     logger.error("API Error", {
//       message: error?.message,
//       method: config?.method?.toUpperCase(),
//       url: buildFullUrl(config?.baseURL, config?.url),
//       baseURL: config?.baseURL,
//       headers,
//       params,
//       data,
//       status: response?.status,
//       statusText: response?.statusText,
//       response: responseData,
//     });
//
//     return Promise.reject(error);
//   }
// );

// Set initial common headers
client.defaults.headers.common["Content-Type"] = "application/json";
client.defaults.headers.common["KTShopKey"] = getKTShopKey();

// KTShopKey 갱신 로직
const updateKTShopKey = () => {
  client.defaults.headers.common["KTShopKey"] = getKTShopKey();
};

// 인터벌 관리
let keyRefreshInterval: ReturnType<typeof setInterval> | null = null;

const startKeyRefresh = () => {
  if (keyRefreshInterval) return; // 이미 실행 중이면 무시
  updateKTShopKey(); // 시작 시 즉시 갱신
  keyRefreshInterval = setInterval(updateKTShopKey, KEY_REFRESH_INTERVAL);
};

const stopKeyRefresh = () => {
  if (keyRefreshInterval) {
    clearInterval(keyRefreshInterval);
    keyRefreshInterval = null;
  }
};

// AppState 리스너 - 백그라운드/포그라운드 전환 감지
const handleAppStateChange = (nextAppState: AppStateStatus) => {
  if (nextAppState === "active") {
    startKeyRefresh();
  } else if (nextAppState === "background" || nextAppState === "inactive") {
    stopKeyRefresh();
  }
};

// AppState 구독 시작 (한 번만 등록되도록 보장)
let isAppStateListenerRegistered = false;

export const initializeClient = () => {
  if (!isAppStateListenerRegistered) {
    AppState.addEventListener("change", handleAppStateChange);
    isAppStateListenerRegistered = true;
  }
  startKeyRefresh();
};

// 초기 실행 (앱 시작 시)
initializeClient();

export default client;
