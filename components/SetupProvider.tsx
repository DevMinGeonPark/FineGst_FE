import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DefaultTheme, ThemeProvider } from "expo-router";
import * as Notifications from "expo-notifications";
import { UpdateProvider } from "./UpdateProvider";

// 포그라운드 알림 표시 설정 (모듈 레벨에서 설정)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// QueryClient 인스턴스
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 1000 * 60 * 5,
    },
  },
});

interface SetupProviderProps {
  children: React.ReactNode;
}

/**
 * 공통 프로바이더 (React Query + Theme + OTA Update)
 * iOS/Android 루트 레이아웃에서 공용으로 사용합니다.
 */
export function SetupProvider({ children }: SetupProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DefaultTheme}>
        <UpdateProvider>{children}</UpdateProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default SetupProvider;
