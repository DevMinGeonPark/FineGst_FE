# Data Model: EAS Update & Push Notifications

**Feature Branch**: `001-codepush-push-notification`
**Date**: 2026-01-19

## Entities

### 1. UpdateState (Client-side)

OTA 업데이트 상태 관리를 위한 클라이언트 상태

```typescript
interface UpdateState {
  // 현재 실행 중인 업데이트 정보
  currentUpdate: {
    updateId: string | null;
    channel: string | null;
    runtimeVersion: string | null;
    isEmbedded: boolean;
  };

  // 업데이트 상태
  isUpdateAvailable: boolean;
  isUpdatePending: boolean;
  isDownloading: boolean;
  downloadProgress: number; // 0.0 ~ 1.0

  // 에러 상태
  error: Error | null;
}
```

**State Transitions**:
```
IDLE → CHECKING → UPDATE_AVAILABLE → DOWNLOADING → PENDING → APPLIED
                ↘ NO_UPDATE
DOWNLOADING → ERROR → IDLE (retry on next launch)
```

### 2. NotificationState (Client-side)

푸시 알림 상태 관리를 위한 클라이언트 상태

```typescript
interface NotificationState {
  // 권한 상태
  permissionStatus: 'undetermined' | 'granted' | 'denied';

  // 푸시 토큰
  expoPushToken: string | null;
  devicePushToken: string | null; // Native FCM/APNs token

  // 등록 상태
  isTokenRegistered: boolean;
  isRegistering: boolean;

  // 현재 알림
  lastNotification: Notification | null;

  // 에러 상태
  error: Error | null;
}
```

### 3. PushToken (Server-side)

서버에 저장되는 푸시 토큰 엔티티

```typescript
interface PushToken {
  id: string;              // 서버 생성 ID
  token: string;           // ExponentPushToken[xxx] 형식
  platform: 'ios' | 'android';
  userId: string | null;   // 로그인 사용자 ID (nullable)
  deviceId: string;        // 디바이스 고유 ID
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
  isActive: boolean;       // 유효한 토큰 여부
}
```

**Validation Rules**:
- `token`: ExponentPushToken 형식 필수 (ExponentPushToken[...])
- `platform`: 'ios' 또는 'android' 필수
- `deviceId`: 빈 문자열 불가

### 4. PushNotification (Received)

수신된 푸시 알림 데이터

```typescript
interface ReceivedNotification {
  // Expo Notification 정보
  requestId: string;
  date: number; // Unix timestamp

  // 알림 콘텐츠
  content: {
    title: string | null;
    body: string | null;
    data: NotificationData;
    sound: string | null;
    badge: number | null;
  };

  // 알림 트리거 정보
  trigger: {
    type: 'push' | 'calendar' | 'location' | 'timeInterval';
    remoteMessage?: object; // FCM/APNs raw message
  };
}

interface NotificationData {
  url?: string;           // 딥링크 URL (e.g., "/detail/123")
  type?: string;          // 알림 유형 (e.g., "promotion", "order")
  itemId?: string;        // 관련 상품/주문 ID
  [key: string]: unknown; // 추가 커스텀 데이터
}
```

## Zustand Stores

### notificationStore.ts

```typescript
interface NotificationStore {
  // State
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  expoPushToken: string | null;
  isTokenRegistered: boolean;
  lastNotification: ReceivedNotification | null;

  // Actions
  setPermissionStatus: (status: 'undetermined' | 'granted' | 'denied') => void;
  setExpoPushToken: (token: string | null) => void;
  setTokenRegistered: (registered: boolean) => void;
  setLastNotification: (notification: ReceivedNotification | null) => void;
  reset: () => void;
}
```

### updateStore.ts (Optional)

업데이트 상태가 복잡해지면 별도 스토어로 분리 가능. 초기 구현에서는 UpdateProvider 내부 상태로 충분.

## Relationships

```
┌─────────────────┐     ┌─────────────────┐
│   AuthStore     │────▶│ NotificationStore│
│   (userId)      │     │ (token, userId) │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Backend API    │
                        │  (PushToken)    │
                        └─────────────────┘
```

- AuthStore의 로그인/로그아웃 이벤트가 NotificationStore의 토큰-사용자 매핑에 영향
- 로그인 시: 토큰에 userId 연결
- 로그아웃 시: 토큰에서 userId 제거 (토큰 자체는 유지)

## AsyncStorage Keys

```typescript
const STORAGE_KEYS = {
  PUSH_TOKEN: '@finegst/push_token',           // 캐시된 푸시 토큰
  PUSH_PERMISSION_ASKED: '@finegst/push_perm', // 권한 요청 여부
  DEVICE_ID: '@finegst/device_id',             // 디바이스 고유 ID
} as const;
```
