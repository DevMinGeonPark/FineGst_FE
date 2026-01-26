import { create } from "zustand";
import type {
  PermissionStatus,
  ReceivedNotification,
} from "../types/NotificationTypes";

interface NotificationState {
  // 권한 상태
  permissionStatus: PermissionStatus;
  // 푸시 토큰
  expoPushToken: string | null;
  // 서버 등록 상태
  isTokenRegistered: boolean;
  // 마지막 수신 알림
  lastNotification: ReceivedNotification | null;

  // Actions
  setPermissionStatus: (status: PermissionStatus) => void;
  setExpoPushToken: (token: string | null) => void;
  setTokenRegistered: (registered: boolean) => void;
  setLastNotification: (notification: ReceivedNotification | null) => void;
  reset: () => void;
}

const initialState = {
  permissionStatus: "undetermined" as PermissionStatus,
  expoPushToken: null,
  isTokenRegistered: false,
  lastNotification: null,
};

const useNotificationStore = create<NotificationState>((set) => ({
  ...initialState,

  setPermissionStatus: (status) => set({ permissionStatus: status }),

  setExpoPushToken: (token) => set({ expoPushToken: token }),

  setTokenRegistered: (registered) => set({ isTokenRegistered: registered }),

  setLastNotification: (notification) =>
    set({ lastNotification: notification }),

  reset: () => set(initialState),
}));

export default useNotificationStore;
