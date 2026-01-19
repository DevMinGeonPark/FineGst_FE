# FineGst 개선 TODO

> 분석일: 2025-01-19
> WebView 중심 서비스, 네이티브 코드는 iOS 심사용

## 완료

- [x] API 키 콘솔 노출 제거 (`api/client.ts`)
- [x] 버전 체크 타임아웃 추가 (`versionChecker.ts`, `_layout.*.tsx`)
- [x] setInterval 클린업 (`api/client.ts` - AppState 리스너)
- [x] WebView 에러 UI 추가 (`CommonWebView.tsx`)
- [x] WebView console.log 제거 (`CommonWebView.tsx`, `webViewOptimizer.ts`)
- [x] mixedContentMode 보안 강화 (`"compatibility"`로 변경)
- [x] WebView JavaScript 캐싱 (`useMemo` 적용)
- [x] 프로덕션 console.log 정리 (`utils/logger.ts` 생성)
- [x] 중복 파일 정리 (`*copy.ts` 파일 삭제)
- [x] 버전 번호 동기화 (`package.json` → 9.0.0)
- [x] 오타 수정 (`"defulat"` → `"default"`)
- [x] 남은 hooks console.log → logger 교체
- [x] 미사용 파일 삭제 (`utils/shouldShowWebMain.ts`)
- [x] 상품 상세 페이지 토글 숨김 (`it_id=` URL 감지, `useWebView.ts`, `web-main.*.tsx`)

---

## 코드 정리 완료

모든 주요 코드 정리 작업이 완료되었습니다.

---

## 향후 고려사항 (새 기능 개발 시)

| 항목 | 현재 상태 | 고려 사항 |
|------|----------|----------|
| 오프라인 처리 | 없음 | 네트워크 끊김 시 안내 화면 |
| 딥링크 | 확인 필요 | 외부에서 앱 진입 시 특정 페이지로 이동 |
| 웹→앱 통신 | 기본만 구현 | 로그인 상태 동기화 등 |
