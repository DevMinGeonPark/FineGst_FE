import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, Alert, Linking } from "react-native";
import { router } from "expo-router";
import logger from "./logger";
import type { NotificationData } from "../types/NotificationTypes";

/**
 * 설정 앱으로 이동 안내
 */
function showSettingsAlert(): void {
  Alert.alert(
    "알림 권한 필요",
    "푸시 알림을 받으려면 설정에서 알림을 허용해주세요.",
    [
      { text: "취소", style: "cancel" },
      {
        text: "설정으로 이동",
        onPress: () => {
          if (Platform.OS === "ios") {
            Linking.openURL("app-settings:");
          } else {
            Linking.openSettings();
          }
        },
      },
    ]
  );
}

/**
 * 푸시 알림 권한 요청 및 토큰 생성
 * @param showAlertOnDenied 권한 거부 시 설정 안내 Alert 표시 여부
 * @returns Expo Push Token 또는 null (실패 시)
 */
export async function registerForPushNotificationsAsync(
  showAlertOnDenied: boolean = false
): Promise<string | null> {
  // 물리 디바이스 확인
  if (!Device.isDevice) {
    logger.log("Push notifications require a physical device");
    return null;
  }

  // Android: 알림 채널 생성 (Android 13+ 필수)
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "기본 알림",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
      });
      logger.log("Android notification channel created");
    } catch (error) {
      logger.error("Failed to create notification channel:", error);
    }
  }

  // 기존 권한 확인
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  logger.log("Current permission status:", existingStatus);
  let finalStatus = existingStatus;

  // 권한이 없으면 요청
  if (existingStatus !== "granted") {
    logger.log("Requesting push notification permission...");
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowProvisional: false,
      },
      android: {},
    });
    finalStatus = status;
    logger.log("Permission request result:", finalStatus);
  }

  // 권한 거부됨
  if (finalStatus !== "granted") {
    logger.log("Push notification permission denied");
    // 권한이 거부된 경우 설정으로 안내
    if (showAlertOnDenied && existingStatus === "denied") {
      showSettingsAlert();
    }
    return null;
  }

  // Expo Push Token 획득
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    logger.error("Project ID not found in app config - check app.json extra.eas.projectId");
    return null;
  }

  try {
    logger.log("Getting Expo Push Token with projectId:", projectId);
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    logger.log("Expo Push Token generated successfully");
    return tokenData.data;
  } catch (error) {
    logger.error("Error getting push token:", error);
    return null;
  }
}

/**
 * 푸시 알림의 딥링크 URL 추출
 */
export function extractDeepLinkUrl(data: NotificationData): string | null {
  if (data.url && typeof data.url === "string") {
    return data.url;
  }
  return null;
}

/**
 * 푸시 알림 딥링크 네비게이션 처리
 */
export function handleNotificationNavigation(data: NotificationData): boolean {
  const url = extractDeepLinkUrl(data);

  if (!url) {
    return false;
  }

  try {
    // expo-router를 사용하여 네비게이션
    // setTimeout으로 navigation stack이 준비될 때까지 대기
    setTimeout(() => {
      router.push(url as never);
    }, 100);
    return true;
  } catch (error) {
    logger.log("Navigation error, falling back to home:", error);
    // fallback: 홈으로 이동
    setTimeout(() => {
      router.replace("/");
    }, 100);
    return false;
  }
}

/**
 * 권한 상태 문자열 반환
 */
export function getPermissionStatusString(
  status: Notifications.PermissionStatus
): "undetermined" | "granted" | "denied" {
  switch (status) {
    case Notifications.PermissionStatus.GRANTED:
      return "granted";
    case Notifications.PermissionStatus.DENIED:
      return "denied";
    default:
      return "undetermined";
  }
}
