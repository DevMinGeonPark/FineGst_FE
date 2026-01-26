import { Stack } from "expo-router";
import { useNotifications } from "../../hooks/useNotifications";
import { usePushToken } from "../../hooks/usePushToken";

export default function AppLayout() {
  // 푸시 알림 초기화 (권한 요청, 토큰 생성, 리스너 설정)
  const { expoPushToken } = useNotifications();

  // 푸시 토큰 서버 등록 (Supabase)
  usePushToken();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="app-main" />
      <Stack.Screen name="(tab)" />
    </Stack>
  );
}
