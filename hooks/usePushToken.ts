import { useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useNotificationStore from "../store/notificationStore";
import useAuthStore from "../store/authStore";
import { registerToken, updateToken } from "../api/pushToken";
import logger from "../utils/logger";

const STORAGE_KEY = "@push_token_registered";

/**
 * 푸시 토큰 서버 등록 관리 Hook
 * - 권한 획득 후 자동 등록
 * - 로그인/로그아웃 시 userId 매핑 동기화
 * - 토큰 변경 감지 및 재등록
 */
export function usePushToken() {
  const { expoPushToken, isTokenRegistered, setTokenRegistered } =
    useNotificationStore();
  const { isLoggedIn, user } = useAuthStore();

  const previousTokenRef = useRef<string | null>(null);
  // undefined = 아직 한 번도 동기화되지 않음 (첫 마운트 감지용 센티널)
  const previousUserIdRef = useRef<string | null | undefined>(undefined);

  /**
   * 토큰이 이미 등록되었는지 확인
   * 24시간 이내에 등록된 경우에만 true 반환 (주기적 재등록)
   */
  const checkIfRegistered = useCallback(async (token: string): Promise<boolean> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const isTokenMatch = data.token === token;
        // 24시간(86400000ms) 이내에 등록된 경우에만 스킵
        const registeredAt = data.registeredAt || 0;
        const isRecent = Date.now() - registeredAt < 86400000;
        return isTokenMatch && isRecent;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  /**
   * 등록 상태 저장
   */
  const saveRegistrationStatus = useCallback(
    async (token: string, userId: string | null) => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ token, userId, registeredAt: Date.now() })
        );
        setTokenRegistered(true);
      } catch {
        logger.error("Failed to save token registration status");
      }
    },
    [setTokenRegistered]
  );

  /**
   * 토큰 등록
   */
  const register = useCallback(
    async (token: string, userId?: string | null) => {
      // 이미 등록된 토큰인지 확인
      const alreadyRegistered = await checkIfRegistered(token);
      if (alreadyRegistered && !userId) {
        logger.log("Token already registered, skipping");
        setTokenRegistered(true);
        return;
      }

      const response = await registerToken(token, userId);
      if (response) {
        await saveRegistrationStatus(token, userId || null);
        logger.log("Push token registration complete");
      }
    },
    [checkIfRegistered, saveRegistrationStatus, setTokenRegistered]
  );

  /**
   * 토큰 userId 업데이트
   */
  const updateUserId = useCallback(
    async (token: string, userId: string | null) => {
      const response = await updateToken(token, userId);
      if (response) {
        await saveRegistrationStatus(token, userId);
        logger.log(`Push token userId updated to: ${userId || "null"}`);
      } else {
        // 토큰이 서버에 없으면 재등록
        await register(token, userId);
      }
    },
    [saveRegistrationStatus, register]
  );

  // 토큰이 생성되면 서버에 등록
  useEffect(() => {
    if (!expoPushToken) return;

    // 토큰이 변경된 경우 또는 처음 등록인 경우
    if (previousTokenRef.current !== expoPushToken) {
      previousTokenRef.current = expoPushToken;
      const userId = user?.UserId || null;
      register(expoPushToken, userId);
    }
  }, [expoPushToken, user?.UserId, register]);

  // 로그인/로그아웃 상태 변경 감지
  useEffect(() => {
    if (!expoPushToken || !isTokenRegistered) return;

    const currentUserId = user?.UserId || null;

    // userId가 변경된 경우에만 업데이트
    if (previousUserIdRef.current !== currentUserId) {
      const prevUserId = previousUserIdRef.current;
      previousUserIdRef.current = currentUserId;

      // 첫 마운트 시에는 업데이트 스킵 (등록 시 이미 userId 포함)
      if (prevUserId !== undefined) {
        updateUserId(expoPushToken, currentUserId);
      }
    }
  }, [expoPushToken, isTokenRegistered, user?.UserId, isLoggedIn, updateUserId]);

  return {
    isTokenRegistered,
    register,
    updateUserId,
  };
}

export default usePushToken;
