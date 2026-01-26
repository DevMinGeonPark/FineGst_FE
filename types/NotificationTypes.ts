/**
 * 푸시 알림 관련 타입 정의
 */

/**
 * 푸시 알림 데이터 (서버에서 전송하는 custom data)
 */
export interface NotificationData {
  /** 딥링크 URL (e.g., "/detail/123") */
  url?: string;
  /** 알림 유형 (e.g., "promotion", "order") */
  type?: string;
  /** 관련 상품/주문 ID */
  itemId?: string;
  /** 추가 커스텀 데이터 */
  [key: string]: unknown;
}

/**
 * 수신된 푸시 알림 데이터
 */
export interface ReceivedNotification {
  /** Expo Notification request ID */
  requestId: string;
  /** 수신 시간 (Unix timestamp) */
  date: number;
  /** 알림 콘텐츠 */
  content: {
    title: string | null;
    body: string | null;
    data: NotificationData;
    sound: string | null;
    badge: number | null;
  };
  /** 알림 트리거 정보 */
  trigger: {
    type: "push" | "calendar" | "location" | "timeInterval";
    remoteMessage?: object;
  };
}

/**
 * 알림 권한 상태
 */
export type PermissionStatus = "undetermined" | "granted" | "denied";

/**
 * 푸시 토큰 (서버 등록용)
 */
export interface PushTokenPayload {
  /** Expo Push Token (ExponentPushToken[xxx]) */
  token: string;
  /** 디바이스 플랫폼 */
  platform: "ios" | "android";
  /** 디바이스 고유 ID */
  deviceId: string;
  /** 로그인된 사용자 ID (선택) */
  userId?: string | null;
}

/**
 * 서버에서 반환하는 푸시 토큰 응답
 */
export interface PushTokenResponse {
  id: string;
  token: string;
  platform: "ios" | "android";
  userId: string | null;
  deviceId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
