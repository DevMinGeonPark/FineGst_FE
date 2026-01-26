# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

FineGst는 화인지에스티를 위한 React Native 모바일 앱으로, Expo (managed workflow)로 구축되었습니다. **WebView 중심의 하이브리드 애플리케이션**이며, 네이티브 코드는 iOS 앱스토어 심사용으로 유지됩니다.

## 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (터널 모드)
npm start

# 플랫폼별 실행
npm run android
npm run ios
npm run web

# 린트
npm run lint

# EAS 빌드 (테스트용)
npm run test:android   # eas build -p android --profile preview
npm run test:ios       # eas build -p ios --profile preview
```

## 환경 변수

`.env` 파일에 필요한 변수:
- `BASE_URL` - API 서버 기본 URL
- `WEB_URL` - WebView에서 로드할 웹 URL
- `ENCRYPT_SECRET_KEY` - AES 암호화 키
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` - 푸시 토큰 등록용 Supabase 설정

## 아키텍처

### 플랫폼별 레이아웃 분기
`app/_layout.tsx`에서 `Platform.OS`에 따라 다른 레이아웃을 로드:
- iOS → `_layout.ios.tsx`
- Android → `_layout.android.tsx`

각 플랫폼 레이아웃은 동일한 구조지만 플랫폼별 최적화가 적용됨.

### 라우팅 구조 (Expo Router - 파일 기반)
- `app/(app)/` - 메인 앱 그룹
  - `app-main.tsx` - 네이티브 상품 목록 화면 (심사용)
  - `(tab)/` - 탭 기반 네비게이션, WebView 화면 포함 (login, register, detail, find-info)
- `USE_APP_VIEW` 플래그로 네이티브/WebView 모드 전환

### 상태 관리
**Zustand** 스토어 (`store/` 디렉토리):
- `authStore.ts` - 사용자 인증 상태 (로그인/로그아웃, 유저 정보)
- `notificationStore.ts` - 푸시 알림 상태 (권한, 토큰, 등록 상태)
- `fixBarStore.ts` - FixBar 표시 제어
- `showToggleIconsStore.ts` - 토글 아이콘 표시 여부

### 데이터 페칭
- **TanStack React Query** 사용 (5분 refetch interval)
- API 클라이언트 (`api/client.ts`)는 Axios 사용
  - `KTShopKey` 헤더를 30초마다 갱신 (암호화된 타임스탬프)
  - **AppState 리스너**로 백그라운드 시 갱신 중지, 포그라운드 복귀 시 재시작
- Base URL은 `process.env.BASE_URL`로 설정

### 컴포넌트 구조
- `components/app-ui/atomic/` - 작은 재사용 UI 컴포넌트
- `components/app-ui/modules/` - 조합된 모듈 (header, footer, modals 등)
- `components/layout/CommonLayout.tsx` - 공통 레이아웃 래퍼
- `components/web-ui/` - WebView 컴포넌트 (플랫폼별 구현 분리)

### WebView 통합
`CommonWebView` 컴포넌트로 웹 콘텐츠 표시:
- 성능 최적화를 위한 JavaScript 인젝션 (`utils/webViewOptimizer.ts`)
- **useMemo로 JavaScript 캐싱**
- 외부 링크 처리 (카카오톡, 전화, 메일, 지도)
- iOS/Android 플랫폼별 설정 분리 (`web-main.ios.tsx`, `web-main.android.tsx`)
- **에러 UI 컴포넌트** (네트워크 에러 시 "다시 시도" 버튼)
- `mixedContentMode: "compatibility"` (보안 강화)
- **URL 기반 토글 제어**: `it_id=` 파라미터 포함 시 토글 아이콘 숨김

### OTA 업데이트 & 푸시 알림
**EAS Update** (`expo-updates`) - OTA JavaScript 번들 업데이트:
- `hooks/useAppUpdates.ts` - 업데이트 확인, 다운로드, 강제 적용
- `components/UpdateProvider.tsx` - 업데이트 상태 Context Provider
- 자동 확인 정책: `ON_LOAD`

**Push Notifications** (`expo-notifications`):
- `hooks/useNotifications.ts` - 권한 요청, 토큰 생성, 리스너 설정 (3회 재시도)
- `hooks/usePushToken.ts` - 서버 토큰 등록, 로그인 상태 동기화 (24시간 캐싱)
- `api/pushToken.ts` - Supabase Edge Functions 연동
- 딥링크: 알림의 `url` 필드 → `router.push()` 네비게이션

## 빌드 설정

- **EAS Build** 설정 (`eas.json`): development, preview, production 프로필
- Production 빌드는 `autoIncrement`로 버전 코드 자동 증가
- 앱 식별자:
  - iOS: `shop.kt-online.www.finegstApp`
  - Android: `com.finegst.mshop`

## 코드 컨벤션

### 로깅
프로덕션에서 로그를 숨기려면 `utils/logger.ts` 사용:
```typescript
import logger from "../utils/logger";
logger.log("개발 환경에서만 출력");
```

### 에러 처리
- API 호출 시 적절한 타임아웃 적용 (버전 체크: 5초)
- WebView 에러 시 사용자에게 UI 피드백 제공
- 푸시 토큰 등록 실패 시 재시도 로직 (3회, 2초 간격)

### 유틸리티
- `utils/KTShopKey.ts` - API 인증 키 생성 (암호화)
- `utils/Encrypt.ts` - crypto-es 기반 AES 암호화
- `utils/versionChecker.ts` - 앱 버전 비교 로직 (5초 타임아웃)
- `utils/notifications.ts` - 푸시 알림 유틸리티 (토큰 등록, 권한 요청, 딥링크 처리)

## Spec-Kit (Spec-Driven Development)

이 프로젝트는 Spec-Kit을 사용하여 명세 기반 개발을 지원합니다.

### 슬래시 명령어
- `/speckit.constitution` - 프로젝트 원칙 및 가이드라인 정의
- `/speckit.specify` - 요구사항 명세 작성
- `/speckit.plan` - 기술 구현 전략 수립
- `/speckit.tasks` - 실행 가능한 태스크 목록 생성
- `/speckit.implement` - 태스크 실행 및 구현
- `/speckit.clarify` - 모호한 부분에 대한 구조화된 질문
- `/speckit.analyze` - 아티팩트 간 일관성 검증
- `/speckit.checklist` - 품질 체크리스트 생성

### 디렉토리 구조
- `.claude/commands/` - 슬래시 명령어 정의
- `.specify/templates/` - 명세 템플릿
- `.specify/memory/` - 프로젝트 컨스티튜션

## 기술 스택
- TypeScript 5.9+, React 19, React Native 0.81, Expo SDK 54
- Zustand (상태 관리), TanStack React Query (데이터 페칭)
- expo-updates, expo-notifications, expo-device, expo-task-manager
- AsyncStorage (토큰 캐싱), crypto-es (암호화)
