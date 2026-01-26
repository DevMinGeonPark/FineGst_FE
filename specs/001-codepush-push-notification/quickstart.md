# Quickstart: EAS Update & Push Notifications

**Feature Branch**: `001-codepush-push-notification`
**Date**: 2026-01-19

## Prerequisites

- Expo SDK 54+ 프로젝트
- EAS CLI 설치 (`npm install -g eas-cli`)
- Expo 계정 로그인 (`eas login`)
- Apple Developer Account (iOS 푸시용)
- Firebase 프로젝트 (Android 푸시용)

## 1. EAS Update 설정

### 1.1 패키지 설치

```bash
npx expo install expo-updates
```

### 1.2 EAS Update 구성

```bash
eas update:configure
```

### 1.3 app.json 업데이트

```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "fingerprint"
    },
    "updates": {
      "enabled": true,
      "url": "https://u.expo.dev/YOUR_PROJECT_ID",
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0
    }
  }
}
```

### 1.4 eas.json 채널 설정

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

### 1.5 업데이트 배포

```bash
# Preview 채널에 배포
eas update --channel preview --message "Fix: 버그 수정"

# Production 채널에 배포
eas update --channel production --message "v9.0.1: 성능 개선"
```

## 2. Push Notifications 설정

### 2.1 패키지 설치

```bash
npx expo install expo-notifications expo-device expo-constants expo-task-manager
```

### 2.2 Firebase 설정 (Android)

1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트 생성
2. Android 앱 추가 (패키지명: `com.finegst.mshop`)
3. `google-services.json` 다운로드 → 프로젝트 루트에 저장
4. FCM V1 서비스 계정 키 생성 및 Expo에 업로드

### 2.3 app.json 업데이트

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
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### 2.4 기본 사용법

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// 권한 요청 및 토큰 획득
async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.warn('물리 디바이스에서만 푸시 알림이 지원됩니다');
    return null;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  return token.data;
}
```

## 3. 개발 빌드 생성

EAS Update와 Push Notifications는 Expo Go에서 테스트할 수 없습니다. 개발 빌드가 필요합니다.

```bash
# 개발 빌드 생성
eas build --profile development --platform all

# 또는 특정 플랫폼만
eas build --profile development --platform ios
eas build --profile development --platform android
```

## 4. 테스트

### EAS Update 테스트

```bash
# 1. 코드 변경 후 업데이트 배포
eas update --channel development --message "테스트 업데이트"

# 2. 앱 재시작하여 업데이트 확인
```

### Push Notification 테스트

1. [Expo Push Notification Tool](https://expo.dev/notifications) 접속
2. Expo Push Token 입력
3. 알림 제목/본문 입력 후 전송

## 5. 다음 단계

1. `/speckit.tasks` 실행하여 상세 구현 태스크 생성
2. 태스크 순서대로 구현 진행
3. Preview 빌드로 통합 테스트
4. Production 배포

## Useful Commands

```bash
# EAS Update 상태 확인
eas update:list

# 특정 업데이트 롤백
eas update:rollback

# 빌드 상태 확인
eas build:list

# 푸시 인증서 확인
eas credentials
```

## Troubleshooting

### "Push notifications require a physical device"
→ 에뮬레이터/시뮬레이터가 아닌 실제 디바이스에서 테스트

### "Project ID not found"
→ `app.json`의 `extra.eas.projectId` 확인

### Android에서 알림이 오지 않음
→ `google-services.json` 파일 경로 및 FCM 서비스 계정 키 확인

### iOS에서 권한 요청이 안 뜸
→ 개발 빌드에서 테스트 필요 (Expo Go 미지원)
