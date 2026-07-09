# Research: EAS Update & Push Notifications

**Feature Branch**: `001-codepush-push-notification`
**Date**: 2026-01-19

## 1. EAS Update (OTA Updates)

### Decision
Expo EAS Update를 사용하여 OTA 업데이트 기능 구현

### Rationale
- Expo SDK 54 managed workflow와 완벽 호환
- Microsoft CodePush와 달리 별도 설정 없이 Expo 생태계에 통합
- 채널 기반 배포로 production/preview 분리 가능
- 자동 롤백 및 점진적 롤아웃 지원
- EAS CLI를 통한 간편한 배포

### Alternatives Considered
- **Microsoft CodePush**: Expo managed workflow에서 지원 안함
- **Direct APK/IPA updates**: 스토어 정책 위반

### Key Implementation Details

#### Required Packages
```bash
npx expo install expo-updates
```

#### app.json Configuration
```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "fingerprint"
    },
    "updates": {
      "enabled": true,
      "url": "https://u.expo.dev/98a9da2b-eba2-4045-ae34-cd3f861b4c4c",
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0
    }
  }
}
```

#### eas.json Channel Configuration
```json
{
  "build": {
    "development": {
      "channel": "development"
    },
    "preview": {
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

#### Runtime Version Policies
| Policy | Description |
|--------|-------------|
| `fingerprint` | 자동 해시 계산 (권장) |
| `appVersion` | 프로젝트 version 사용 |
| `nativeVersion` | version + 플랫폼별 빌드 번호 조합 |

#### Update Flow
1. 앱 실행 시 `checkAutomatically: "ON_LOAD"`로 자동 체크
2. 업데이트 발견 시 백그라운드 다운로드
3. `fallbackToCacheTimeout: 0`으로 즉시 기존 버전 실행
4. 다음 앱 실행 시 새 버전 적용
5. 강제 업데이트 시 `Updates.reloadAsync()` 호출

#### Rollback Handling
- 앱 실행 10초 내 크래시 시 자동 롤백
- `eas update:rollback` 명령으로 수동 롤백
- `eas update:republish` 로 특정 버전 재배포

---

## 2. Push Notifications

### Decision
expo-notifications + Expo Push Service 사용

### Rationale
- Expo SDK 54 managed workflow 지원
- FCM/APNs 추상화로 단일 API 사용
- Expo Push Token으로 간편한 푸시 전송
- 백그라운드 알림 처리 지원
- Deep linking 통합 용이

### Alternatives Considered
- **Firebase SDK 직접 사용**: 복잡한 설정 필요, expo-notifications가 FCM 추상화
- **OneSignal**: 외부 서비스 의존성 추가

### Key Implementation Details

#### Required Packages
```bash
npx expo install expo-notifications expo-device expo-constants expo-task-manager
```

#### app.json Configuration
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "defaultChannel": "default",
          "enableBackgroundRemoteNotifications": true
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "useNextNotificationsApi": true
    }
  }
}
```

#### FCM/APNs Setup
- **Android**: Firebase Console에서 google-services.json 다운로드 및 FCM V1 서비스 계정 키 Expo 업로드
- **iOS**: EAS Build 시 자동 APNs 설정 (Apple Developer Account 필요)

#### Token Flow
1. 물리 디바이스 확인 (`Device.isDevice`)
2. Android 채널 생성 (Android 13+ 필수)
3. 권한 요청 (`Notifications.requestPermissionsAsync`)
4. Expo Push Token 획득 (`Notifications.getExpoPushTokenAsync`)
5. 서버에 토큰 등록

#### Notification Handling
| 상태 | Handler |
|------|---------|
| Foreground | `Notifications.addNotificationReceivedListener` |
| Background/Killed Tap | `Notifications.addNotificationResponseReceivedListener` |
| Background Data | `TaskManager.defineTask` + `Notifications.registerTaskAsync` |
| Cold Start | `Notifications.getLastNotificationResponseAsync` |

#### Deep Linking
- 알림 data에 `url` 필드 포함
- `expo-router`의 `router.push(url)` 사용
- 앱 종료 상태: `getLastNotificationResponseAsync`로 초기 URL 확인

---

## 3. Dependencies Summary

| Package | Purpose | Version |
|---------|---------|---------|
| expo-updates | OTA 업데이트 | ^0.28.x (SDK 54) |
| expo-notifications | 푸시 알림 | ^0.30.x (SDK 54) |
| expo-device | 디바이스 정보 | ^7.0.x (SDK 54) |
| expo-task-manager | 백그라운드 작업 | ^12.0.x (SDK 54) |
| expo-constants | 앱 설정 접근 | Already installed |

---

## 4. Backend Requirements

### Push Token Registration API
```
POST /api/push-tokens
{
  "token": "ExponentPushToken[xxx]",
  "platform": "ios" | "android",
  "userId": "optional-user-id"
}
```

### Push Token Update API
```
PUT /api/push-tokens/:token
{
  "userId": "new-user-id"
}
```

### Delete Token API (Logout)
```
DELETE /api/push-tokens/:token
```

---

## Sources
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [expo-updates API](https://docs.expo.dev/versions/latest/sdk/updates/)
- [expo-notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Push Notifications Setup Guide](https://docs.expo.dev/push-notifications/push-notifications-setup/)
