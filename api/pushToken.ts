import { Platform } from "react-native";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
import logger from "../utils/logger";
import type { PushTokenResponse } from "../types/NotificationTypes";

/**
 * 푸시 토큰 API 클라이언트 (Supabase Edge Functions)
 * - 토큰 등록, 업데이트, 삭제 기능 제공
 * - 재시도 로직 포함
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

// Supabase Edge Functions URL
const getFunctionsUrl = () => `${SUPABASE_URL}/functions/v1`;

/**
 * 지연 유틸리티
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Supabase fetch wrapper
 */
async function supabaseFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${getFunctionsUrl()}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { response: { status: response.status, data: error } };
  }

  // 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * 디바이스 ID 생성
 * - expo-device를 사용하여 고유 ID 생성
 */
export async function getDeviceId(): Promise<string> {
  try {
    const Device = await import("expo-device");
    // modelId가 없으면 랜덤 UUID 생성
    const baseId =
      Device.modelId ||
      `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    return baseId;
  } catch {
    // fallback: 플랫폼 + 타임스탬프 기반 ID
    return `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}

/**
 * 푸시 토큰 등록
 * @param token Expo Push Token
 * @param userId 사용자 ID (선택)
 * @returns 서버 응답 또는 null (실패 시)
 */
export async function registerToken(
  token: string,
  userId?: string | null
): Promise<PushTokenResponse | null> {
  const deviceId = await getDeviceId();

  const payload = {
    token,
    platform: Platform.OS as "ios" | "android",
    deviceId,
    userId: userId || null,
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await supabaseFetch<PushTokenResponse>("/register-token", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      logger.log("Push token registered successfully");
      return response;
    } catch (error: unknown) {
      const fetchError = error as { response?: { status?: number } };

      // 재시도 가능한 에러인 경우
      if (attempt < MAX_RETRIES) {
        logger.log(`Token registration attempt ${attempt} failed, retrying...`);
        await delay(RETRY_DELAY * attempt);
      } else {
        logger.error("Failed to register push token after retries", error);
      }
    }
  }

  return null;
}

/**
 * 푸시 토큰 업데이트 (사용자 ID 매핑)
 * @param token Expo Push Token
 * @param userId 새로운 사용자 ID (null로 연결 해제)
 * @returns 서버 응답 또는 null (실패 시)
 */
export async function updateToken(
  token: string,
  userId: string | null
): Promise<PushTokenResponse | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const encodedToken = encodeURIComponent(token);
      const response = await supabaseFetch<PushTokenResponse>(
        `/update-token?token=${encodedToken}`,
        {
          method: "PUT",
          body: JSON.stringify({ userId }),
        }
      );
      logger.log("Push token updated successfully");
      return response;
    } catch (error: unknown) {
      const fetchError = error as { response?: { status?: number } };

      // 404는 토큰이 없는 경우 - 재등록 필요
      if (fetchError.response?.status === 404) {
        logger.log("Token not found, needs re-registration");
        return null;
      }

      if (attempt < MAX_RETRIES) {
        logger.log(`Token update attempt ${attempt} failed, retrying...`);
        await delay(RETRY_DELAY * attempt);
      } else {
        logger.error("Failed to update push token after retries", error);
      }
    }
  }

  return null;
}

/**
 * 푸시 토큰 삭제 (로그아웃 시 사용)
 * @param token Expo Push Token
 * @returns 성공 여부
 */
export async function deleteToken(token: string): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const encodedToken = encodeURIComponent(token);
      await supabaseFetch(`/delete-token?token=${encodedToken}`, {
        method: "DELETE",
      });
      logger.log("Push token deleted successfully");
      return true;
    } catch (error: unknown) {
      const fetchError = error as { response?: { status?: number } };

      // 404는 이미 삭제된 경우 - 성공으로 처리
      if (fetchError.response?.status === 404) {
        logger.log("Token already deleted or not found");
        return true;
      }

      if (attempt < MAX_RETRIES) {
        logger.log(`Token deletion attempt ${attempt} failed, retrying...`);
        await delay(RETRY_DELAY * attempt);
      } else {
        logger.error("Failed to delete push token after retries", error);
      }
    }
  }

  return false;
}
