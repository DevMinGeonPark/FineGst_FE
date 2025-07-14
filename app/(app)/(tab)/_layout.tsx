import { Stack } from "expo-router";

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="detail" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="find-info" />
    </Stack>
  );
}
