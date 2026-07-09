import { useEffect, useRef, useCallback } from "react";
import * as Notifications from "expo-notifications";
import useNotificationStore from "../store/notificationStore";
import {
  registerForPushNotificationsAsync,
  getPermissionStatusString,
  handleNotificationNavigation,
} from "../utils/notifications";
import logger from "../utils/logger";
import type { ReceivedNotification } from "../types/NotificationTypes";

/**
 * 푸시 알림 관리를 위한 Hook
 * - 권한 요청 및 토큰 생성
 * - 포그라운드 알림 수신 리스너
 * - 알림 탭 응답 리스너
 */
export function useNotifications() {
  const {
    permissionStatus,
    expoPushToken,
    setPermissionStatus,
    setExpoPushToken,
    setLastNotification,
  } = useNotificationStore();

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // 초기화: 권한 요청 및 토큰 생성 (재시도 포함)
  const initialize = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2초

    try {
      // 현재 권한 상태 확인
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(getPermissionStatusString(status));
      logger.log("Push notification permission status:", status);

      // 토큰 생성 시도
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        logger.log("Push token initialized successfully");
      } else if (retryCount < MAX_RETRIES && status === "granted") {
        // 권한은 있는데 토큰 생성 실패 시 재시도
        logger.log(`Token generation failed, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => initialize(retryCount + 1), RETRY_DELAY);
      }
    } catch (error) {
      logger.error("Push notification initialization error:", error);
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => initialize(retryCount + 1), RETRY_DELAY);
      }
    }
  }, [setPermissionStatus, setExpoPushToken]);

  useEffect(() => {
    // 초기화
    initialize();

    // 포그라운드 알림 수신 리스너
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        logger.log("Notification received in foreground");

        const received: ReceivedNotification = {
          requestId: notification.request.identifier,
          date: notification.date,
          content: {
            title: notification.request.content.title,
            body: notification.request.content.body,
            data: notification.request.content.data || {},
            sound:
              typeof notification.request.content.sound === "string"
                ? notification.request.content.sound
                : null,
            badge: notification.request.content.badge ?? null,
          },
          trigger: {
            type: "push",
          },
        };

        setLastNotification(received);
      });

    // 알림 탭 응답 리스너
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        logger.log("User interacted with notification");

        const { data } = response.notification.request.content;
        const actionIdentifier = response.actionIdentifier;

        // 기본 탭 액션 처리
        if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          handleNotificationNavigation(data || {});
        }
      });

    // 클린업
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [initialize, setLastNotification]);

  // 권한 재요청
  const requestPermission = useCallback(async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setExpoPushToken(token);
      setPermissionStatus("granted");
      return true;
    }
    return false;
  }, [setExpoPushToken, setPermissionStatus]);

  return {
    permissionStatus,
    expoPushToken,
    requestPermission,
  };
}

export default useNotifications;
