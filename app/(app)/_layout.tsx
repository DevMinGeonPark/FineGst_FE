import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="app-main" />
      <Stack.Screen name="(tab)" />
    </Stack>
  );
}
