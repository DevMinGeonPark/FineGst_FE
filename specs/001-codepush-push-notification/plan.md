# Implementation Plan: EAS Update & Push Notifications

**Branch**: `001-codepush-push-notification` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-codepush-push-notification/spec.md`

## Summary

앱스토어 심사 없이 JavaScript 번들 업데이트를 배포할 수 있는 OTA(Over-The-Air) 업데이트 기능과, 마케팅 및 사용자 커뮤니케이션을 위한 푸시 알림 기능을 구현한다. Expo EAS Update와 expo-notifications를 활용하여 Expo managed workflow 내에서 구현한다.

## Technical Context

**Language/Version**: TypeScript 5.9+, React Native 0.81, Expo SDK 54
**Primary Dependencies**: expo-updates, expo-notifications, expo-device, expo-task-manager
**Storage**: AsyncStorage (토큰 캐싱), Zustand (상태 관리)
**Testing**: Jest + React Native Testing Library (단위 테스트), EAS Build Preview (통합 테스트)
**Target Platform**: iOS 15+, Android API 24+ (Android 7.0+)
**Project Type**: Mobile (React Native Expo)
**Performance Goals**: 업데이트 다운로드 완료율 95%+, 푸시 딥링크 3초 이내 도달
**Constraints**: 물리 디바이스 필수 (에뮬레이터 푸시 미지원), FCM/APNs 인프라 필요
**Scale/Scope**: 단일 모바일 앱, 기존 코드베이스 확장

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. WebView-First Architecture ✅
- OTA 업데이트와 푸시 알림은 네이티브 앱 레벨 기능
- WebView 동작에 영향 없음
- 네이티브 코드는 심사용으로 최소한 유지 (Expo managed workflow)

### II. Performance & Reliability ✅
- 업데이트 다운로드 실패 시 기존 버전으로 정상 동작 (rollback)
- 푸시 토큰 등록 실패 시 앱 정상 동작 유지
- 네트워크 불안정 시 비블로킹 처리

### III. Security ✅
- 푸시 토큰은 민감 정보로 취급, 콘솔 노출 금지
- logger.ts 사용하여 프로덕션에서 디버그 로그 비활성화
- 서버 통신은 HTTPS 필수

### IV. Code Quality ✅
- TypeScript strict 모드 사용
- 플랫폼별 코드 분리 불필요 (expo-notifications가 추상화)
- 기존 코드 스타일 준수

### V. Simplicity ✅
- Expo 공식 패키지만 사용 (외부 의존성 최소화)
- 필요한 기능만 구현 (YAGNI)
- 기존 authStore와 연동하여 중복 코드 방지

## Project Structure

### Documentation (this feature)

```text
specs/001-codepush-push-notification/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── push-token-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
# Mobile App Structure (Expo Router)
app/
├── _layout.tsx          # Root layout - notification observer 추가
└── (app)/
    └── _layout.tsx      # App group layout

components/
├── UpdateProvider.tsx   # OTA 업데이트 Provider (NEW)
└── app-ui/modules/
    └── UpdateBanner.tsx # 업데이트 알림 배너 (NEW)

hooks/
├── useAppUpdates.ts     # OTA 업데이트 hook (NEW)
├── useNotifications.ts  # 푸시 알림 hook (NEW)
└── usePushToken.ts      # 푸시 토큰 관리 hook (NEW)

store/
├── authStore.ts         # 기존 (푸시 토큰 연동)
└── notificationStore.ts # 알림 상태 store (NEW)

utils/
├── logger.ts            # 기존 로거 활용
└── notifications.ts     # 푸시 알림 유틸 (NEW)

api/
└── pushToken.ts         # 푸시 토큰 API (NEW)
```

**Structure Decision**: 기존 Expo Router 기반 구조 유지. 새 파일은 기존 디렉토리 패턴을 따르며 hooks/, components/, api/ 에 추가.

## Complexity Tracking

> 위반 사항 없음 - Constitution Check 모두 통과

## Phase 0: Research

**Status**: ✅ Complete

See [research.md](./research.md) for detailed findings:
- EAS Update 설정 및 구현 방법
- expo-notifications 설정 및 구현 방법
- FCM/APNs 연동 방법
- Backend API 요구사항

## Phase 1: Design Artifacts

### Generated Artifacts

1. **[data-model.md](./data-model.md)** - 엔티티 정의 및 상태 관리
2. **[contracts/push-token-api.yaml](./contracts/push-token-api.yaml)** - 푸시 토큰 API 명세
3. **[quickstart.md](./quickstart.md)** - 빠른 시작 가이드

## Implementation Phases

### Phase 1: EAS Update 기본 설정 (P1)
1. expo-updates 패키지 설치
2. app.json에 updates 설정 추가
3. eas.json에 채널 설정
4. UpdateProvider 컴포넌트 생성
5. 업데이트 체크 및 다운로드 로직 구현

### Phase 2: 푸시 알림 기본 설정 (P1)
1. expo-notifications 및 관련 패키지 설치
2. app.json에 notifications 플러그인 설정
3. FCM google-services.json 설정
4. 권한 요청 플로우 구현
5. 푸시 토큰 생성 및 관리

### Phase 3: 푸시 토큰 서버 연동 (P2)
1. 토큰 등록 API 연동
2. 토큰 갱신 처리
3. authStore 연동 (로그인/로그아웃)

### Phase 4: 딥링크 및 알림 처리 (P2)
1. Foreground 알림 핸들러
2. Background/Killed 상태 알림 처리
3. 딥링크 네비게이션 구현

### Phase 5: 강제 업데이트 (P3)
1. 강제 업데이트 UI 모달
2. 즉시 적용 로직

## Next Steps

`/speckit.tasks` 명령으로 상세 태스크 생성
