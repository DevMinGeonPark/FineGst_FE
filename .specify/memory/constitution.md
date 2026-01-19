# FineGst Constitution

## Core Principles

### I. WebView-First Architecture
- 주요 서비스는 WebView를 통해 제공
- 네이티브 코드는 iOS 앱스토어 심사용으로 최소한 유지
- WebView와 네이티브 간 명확한 역할 분리
- URL 기반 UI 제어 (`it_id=` 포함 시 토글 아이콘 숨김 등)

### II. Performance & Reliability
- API 호출에 적절한 타임아웃 적용 (기본 5초)
- 백그라운드 상태에서 불필요한 작업 중지 (AppState 리스너)
- 에러 발생 시 사용자에게 명확한 UI 피드백 제공
- 네트워크 불안정 시 앱이 블로킹되지 않도록 처리

### III. Security
- 민감한 정보 콘솔 노출 금지
- 프로덕션 빌드에서 디버그 로그 비활성화 (`utils/logger.ts` 사용)
- HTTPS 콘텐츠 우선 (`mixedContentMode: "compatibility"`)
- 환경 변수로 민감한 설정 관리

### IV. Code Quality
- TypeScript strict 모드 사용
- 불필요한 코드/파일 제거
- 일관된 코드 스타일 유지
- 플랫폼별 코드 분리 (iOS/Android)

### V. Simplicity
- 과도한 추상화 지양
- 필요한 기능만 구현 (YAGNI)
- 심사용 네이티브 코드는 최소한으로 유지

## Technology Stack

### Core
- **Framework**: React Native 0.81+ with Expo SDK 54+
- **Language**: TypeScript 5.9+
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios

### Key Libraries
- `expo-router` - 파일 기반 라우팅
- `react-native-webview` - WebView 통합
- `crypto-es` - AES 암호화
- `react-native-safe-area-context` - Safe Area 처리

## Development Workflow

### 새 기능 개발
1. `/speckit.specify` - 요구사항 명세 작성
2. `/speckit.plan` - 기술 구현 전략 수립
3. `/speckit.tasks` - 태스크 목록 생성
4. `/speckit.implement` - 구현

### 코드 리뷰 체크리스트
- [ ] 타임아웃 적용 여부
- [ ] 에러 처리 및 사용자 피드백
- [ ] console.log 대신 logger 사용
- [ ] 민감한 정보 노출 여부
- [ ] 불필요한 코드 제거

## Governance

이 Constitution은 프로젝트의 핵심 원칙을 정의합니다.
- 모든 PR은 이 원칙을 준수해야 함
- 원칙 변경 시 문서화 및 승인 필요

**Version**: 1.0.0 | **Ratified**: 2025-01-19
