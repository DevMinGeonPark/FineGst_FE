# Tasks: EAS Update & Push Notifications

**Input**: Design documents from `/specs/001-codepush-push-notification/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested - test tasks excluded (can be added later if needed)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile App**: Expo Router at `app/`, components at `components/`, hooks at `hooks/`
- Based on existing project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 패키지 설치 및 기본 설정

- [x] T001 Install expo-updates package via `npx expo install expo-updates`
- [x] T002 Install expo-notifications and related packages via `npx expo install expo-notifications expo-device expo-task-manager`
- [x] T003 [P] Configure EAS Update in app.json (runtimeVersion, updates.url, checkAutomatically)
- [x] T004 [P] Add channel configuration to eas.json (development, preview, production channels)
- [x] T005 [P] Add expo-notifications plugin to app.json with icon, color, enableBackgroundRemoteNotifications
- [x] T006 Add Android googleServicesFile path to app.json and place google-services.json in project root
- [x] T007 Add iOS UIBackgroundModes remote-notification to app.json infoPlist
- [x] T008 Run `eas update:configure` to complete EAS Update setup

**Checkpoint**: All packages installed and configuration files updated

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 User Story에서 공유하는 핵심 인프라

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create NotificationTypes interface in types/NotificationTypes.ts (ReceivedNotification, NotificationData)
- [x] T010 [P] Create notificationStore in store/notificationStore.ts (permissionStatus, expoPushToken, isTokenRegistered)
- [x] T011 [P] Create notifications utility functions in utils/notifications.ts (registerForPushNotificationsAsync, getNativeDeviceToken)
- [x] T012 Create useAppUpdates hook in hooks/useAppUpdates.ts (checkForUpdates, downloadUpdate, isUpdateAvailable)
- [x] T013 Create UpdateProvider component in components/UpdateProvider.tsx (wraps app, handles background download)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - OTA 업데이트 자동 수신 (Priority: P1) 🎯 MVP

**Goal**: 앱 실행 시 업데이트 확인, 백그라운드 다운로드, 다음 실행 시 자동 적용

**Independent Test**: EAS Update 배포 후 앱 재시작하여 새 버전 적용 확인

### Implementation for User Story 1

- [x] T014 [US1] Implement update check logic in hooks/useAppUpdates.ts (checkForUpdateAsync on app launch)
- [x] T015 [US1] Implement background download logic in hooks/useAppUpdates.ts (fetchUpdateAsync when available)
- [x] T016 [US1] Add download progress tracking in hooks/useAppUpdates.ts (useUpdates hook integration)
- [x] T017 [US1] Implement error handling for failed updates in hooks/useAppUpdates.ts (fallback to cached version)
- [x] T018 [US1] Integrate UpdateProvider in app/_layout.tsx (wrap root layout)
- [x] T019 [US1] Create UpdateBanner component in components/app-ui/modules/UpdateBanner.tsx (shows "Update ready" message)
- [x] T020 [US1] Add update state logging using utils/logger.ts (development only)

**Checkpoint**: OTA updates work - app downloads updates in background, applies on next launch

---

## Phase 4: User Story 2 - 푸시 알림 수신 (Priority: P1)

**Goal**: 알림 권한 요청, 포그라운드/백그라운드 알림 수신

**Independent Test**: Expo Push Notification Tool에서 알림 전송하여 디바이스 수신 확인

### Implementation for User Story 2

- [x] T021 [US2] Implement permission request in utils/notifications.ts (requestPermissionsAsync with iOS options)
- [x] T022 [US2] Implement push token generation in utils/notifications.ts (getExpoPushTokenAsync with projectId)
- [x] T023 [US2] Create Android notification channel in utils/notifications.ts (setNotificationChannelAsync for Android 13+)
- [x] T024 [US2] Create useNotifications hook in hooks/useNotifications.ts (permission request, token generation, listeners)
- [x] T025 [US2] Set notification handler at module level in app/_layout.tsx (setNotificationHandler for foreground)
- [x] T026 [US2] Add notification received listener in hooks/useNotifications.ts (addNotificationReceivedListener)
- [x] T027 [US2] Integrate useNotifications in app/(app)/_layout.tsx (initialize on app group mount)
- [x] T028 [US2] Handle permission denied state gracefully in utils/notifications.ts (return null, app continues)

**Checkpoint**: Push notifications work - permissions requested, tokens generated, notifications received

---

## Phase 5: User Story 3 - 푸시 알림 탭하여 앱 이동 (Priority: P2)

**Goal**: 푸시 알림 탭 시 딥링크로 상세 페이지 이동

**Independent Test**: URL 포함 푸시 알림 탭하여 해당 페이지 이동 확인

### Implementation for User Story 3

- [x] T029 [US3] Add notification response listener in hooks/useNotifications.ts (addNotificationResponseReceivedListener)
- [x] T030 [US3] Implement deep link navigation helper in utils/notifications.ts (handleNotificationNavigation with router.push)
- [x] T031 [US3] Handle cold start notification in app/_layout.tsx (getLastNotificationResponseAsync)
- [x] T032 [US3] Handle foreground notification tap in hooks/useNotifications.ts (navigate from response listener)
- [x] T033 [US3] Implement fallback for invalid deep links in utils/notifications.ts (redirect to home if page not found)
- [x] T034 [US3] Clear handled notification response in app/_layout.tsx (clearLastNotificationResponseAsync)

**Checkpoint**: Deep linking works - tapping notification navigates to correct page

---

## Phase 6: User Story 4 - 푸시 토큰 서버 등록 (Priority: P2)

**Goal**: 푸시 토큰을 서버에 등록하고 로그인 상태와 연동

**Independent Test**: 토큰 등록 API 호출 성공 및 서버 저장 확인

### Implementation for User Story 4

- [x] T035 [US4] Create push token API client in api/pushToken.ts (registerToken, updateToken, deleteToken)
- [x] T036 [US4] Create usePushToken hook in hooks/usePushToken.ts (register, update, sync with auth)
- [x] T037 [US4] Implement token registration on permission grant in hooks/usePushToken.ts (POST /api/push-tokens)
- [x] T038 [US4] Implement token refresh handling in hooks/usePushToken.ts (detect token change, update server)
- [x] T039 [US4] Integrate with authStore for login/logout in hooks/usePushToken.ts (subscribe to auth changes)
- [x] T040 [US4] Update token userId on login in hooks/usePushToken.ts (PUT /api/push-tokens/:token)
- [x] T041 [US4] Remove userId mapping on logout in hooks/usePushToken.ts (PUT with null userId)
- [x] T042 [US4] Add error handling for API failures in api/pushToken.ts (retry logic, graceful degradation)
- [x] T043 [US4] Cache token locally with AsyncStorage in hooks/usePushToken.ts (avoid duplicate registrations)

**Checkpoint**: Server integration works - tokens registered, synced with user login state

---

## Phase 7: User Story 5 - 중요 업데이트 강제 적용 (Priority: P3)

**Goal**: 긴급 업데이트 시 즉시 적용 (앱 재시작)

**Independent Test**: 강제 업데이트 배포 후 앱이 즉시 재시작되고 새 버전 적용 확인

### Implementation for User Story 5

- [x] T044 [US5] Add force update detection in hooks/useAppUpdates.ts (check isRollBackToEmbedded or custom flag)
- [x] T045 [US5] Create ForceUpdateModal component in components/app-ui/modules/ForceUpdateModal.tsx (blocking modal UI)
- [x] T046 [US5] Implement immediate reload in hooks/useAppUpdates.ts (Updates.reloadAsync with reloadScreenOptions)
- [x] T047 [US5] Add force update trigger in UpdateProvider component (show modal, trigger reload)
- [x] T048 [US5] Style ForceUpdateModal with progress indicator in components/app-ui/modules/ForceUpdateModal.tsx

**Checkpoint**: Force updates work - critical updates apply immediately with user notification

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 마무리 작업 및 품질 개선

- [x] T049 [P] Review and clean up unused imports across all new files
- [x] T050 [P] Ensure all console.log replaced with logger.ts in production paths
- [x] T051 Verify TypeScript strict mode compliance for all new files
- [ ] T052 Test on physical iOS device (push notifications, updates)
- [ ] T053 Test on physical Android device (push notifications, updates)
- [ ] T054 Run quickstart.md validation steps
- [x] T055 Update CLAUDE.md with new components and hooks documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority - can proceed in parallel
  - US3 and US4 depend on US2 (push notification infrastructure)
  - US5 depends on US1 (OTA update infrastructure)
- **Polish (Phase 8)**: Depends on desired user stories being complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational
    ↓
    ├── Phase 3: US1 (OTA 업데이트) ──────────────────┐
    │       ↓                                        │
    │   Phase 7: US5 (강제 업데이트) ←───────────────┤
    │                                                │
    └── Phase 4: US2 (푸시 알림 수신) ───┐           │
            ↓                            │           │
        Phase 5: US3 (딥링크) ←──────────┤           │
            ↓                            │           │
        Phase 6: US4 (서버 등록) ←───────┘           │
                                                     ↓
                                            Phase 8: Polish
```

### Within Each User Story

- Core utilities before hooks
- Hooks before components
- Components before layout integration
- Story complete before moving to dependent stories

### Parallel Opportunities

**Phase 1 (Setup)**:
```bash
# Can run in parallel after T001, T002:
Task: T003 "Configure EAS Update in app.json"
Task: T004 "Add channel configuration to eas.json"
Task: T005 "Add expo-notifications plugin to app.json"
```

**Phase 2 (Foundational)**:
```bash
# Can run in parallel:
Task: T010 "Create notificationStore"
Task: T011 "Create notifications utility"
```

**Phase 3-4 (US1 + US2) - Parallel Execution**:
```bash
# US1 and US2 can run in parallel as they use different files:
# US1 focused on: hooks/useAppUpdates.ts, components/UpdateProvider.tsx
# US2 focused on: hooks/useNotifications.ts, utils/notifications.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup (패키지 설치, 설정)
2. Complete Phase 2: Foundational (공통 인프라)
3. Complete Phase 3: User Story 1 (OTA 업데이트)
4. Complete Phase 4: User Story 2 (푸시 알림 수신)
5. **STOP and VALIDATE**: 물리 디바이스에서 테스트
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → 기반 완료
2. Add US1 (OTA) → 테스트 → Preview 빌드 배포
3. Add US2 (푸시 수신) → 테스트 → Preview 빌드 배포
4. Add US3 (딥링크) → 테스트 → Preview 빌드 배포
5. Add US4 (서버 연동) → 테스트 → Preview 빌드 배포
6. Add US5 (강제 업데이트) → 테스트 → Production 빌드 배포

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Physical device required for push notification and update testing
- EAS Build (Preview profile) needed for full integration testing
