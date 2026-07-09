import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { handleNotificationNavigation } from "../utils/notifications";

/**
 * Cold start: 앱이 종료된 상태에서 알림을 탭하여 실행된 경우 딥링크 처리
 * iOS/Android 루트 레이아웃에서 공용으로 사용합니다.
 */
export function useColdStartNotification() {
  useEffect(() => {
    async function handleInitialNotification() {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        const { data } = response.notification.request.content;
        handleNotificationNavigation(data || {});
        // 처리 완료 후 응답 클리어
        await Notifications.clearLastNotificationResponseAsync();
      }
    }
    handleInitialNotification();
  }, []);
}

export default useColdStartNotification;
