# TODO - FineGst_FE

# 🚀 v11.0.0 출시 (2026-07-08 기준 — 내일 여기부터!)

> Android v11.0.0 **Play 스토어 제출까지 완료**된 상태. 아래 "해야 할 것"의 순서가 중요함.

## ✅ 완료된 것

### 플랫폼 업그레이드
- [x] Expo SDK 54 → 56 → 57 (RN 0.86, React 19.2, reanimated 4.5, worklets 0.10)
- [x] 스토어 요구사항 충족 — Play targetSdk 36 (2026-08-31 요구), App Store iOS 26 SDK
- [x] Xcode 26.6 업데이트로 simdiskimaged 크래시 루프(macOS 26.5 버그) 해결 — "Xcode 빌드 무한 대기" 문제의 원인이었음
- [x] iPhone 17 (iOS 26.5) 시뮬레이터 빌드·실행 검증
- [x] Android 실기기(SM-G977N) 검증 — WebView, 팝업, 푸시 토큰, 로그인

### 버전/강제 업데이트
- [x] 버전 10.0.0 → **11.0.0** (기존 배포 앱은 메이저 버전만 비교 → 강제 업데이트엔 메이저 상향 필수)
- [x] versionChecker 개선 — 전체 버전 semver 비교, 서버 > 로컬일 때만 업데이트 (앞으로는 마이너 버전으로도 강제 가능)
- [x] 강제 업데이트 모달 실기기 end-to-end 검증 (서버 12.0.0 시뮬레이션으로 모달 표시 확인)
- [x] runtimeVersion 정책 fingerprint → **appVersion** 전환 (EAS 빌드 2회 실패 원인이던 fingerprint 불일치 근본 해결)

### 빌드/제출
- [x] EAS 프로덕션 빌드 성공 — versionCode 32, v11.0.0 (빌드 ID: e72e5ba2-ec4b-4860-b858-9cb968aafc6a)
- [x] **Google Play production 트랙 제출 완료** (2026-07-08 새벽)

## 📋 해야 할 것 (⚠️ 순서 중요!)

### Android 출시 마무리
- [ ] 1. Play Console(https://play.google.com/console)에서 심사 상태 확인
- [ ] 2. 심사 통과 시 **100% 전체 출시** (단계적 출시 금지 — 강제 업데이트와 충돌: 일부만 받을 수 있는데 전원에게 모달이 뜸)
- [ ] 3. Play 스토어 앱에서 11.0.0 업데이트가 **실제로 받아지는지 직접 확인**
- [ ] 4. **그 후에** 관리자 페이지 → 쇼핑몰관리 → 버전/메타관리(Android) → 버전 `11.0.0` 저장
  - → 이 순간 기존 10.x 사용자 전원에게 강제 업데이트 발동
  - ⚠️ **스토어 라이브 확인 전에 절대 먼저 올리지 말 것** (받을 수 없는 업데이트를 강제하게 됨)

### iOS 출시
- [x] iOS 앱뷰 모드에서 팝업 억제 수정 (커밋 6799c9b — 이 빌드부터 포함)
- [x] `eas build -p ios --profile production` — v11.0.0, buildNumber 17 (빌드 32404bde)
- [x] `eas submit -p ios` — App Store Connect 업로드 완료 (2026-07-08, ascAppId 6468455648을 eas.json에 저장 → 다음부턴 비대화형 가능)
- [ ] App Store Connect(https://appstoreconnect.apple.com/apps/6468455648)에서 버전 11.0.0 생성 → 릴리즈 노트 작성 → 빌드(11.0.0-17) 선택 → **심사를 위해 제출**
- [ ] 심사 통과 → 라이브 확인 → 관리자 페이지 버전/메타관리(**IOS**) 버전 `11.0.0` 저장

### 기타
- [ ] 로컬에서 앱 실행하려면 `npx expo prebuild` 먼저 (android/ios 폴더 삭제된 상태 — EAS fingerprint 문제 해결 과정에서 정리함)
- [ ] (선택) 구 iOS 26.3 시뮬레이터 런타임 + 중복 26.5 이미지 정리 ~8GB: `xcrun simctl runtime list` → `delete`
- [ ] (선택) eas.json에 시크릿 평문 커밋돼 있음 — EAS 환경변수로 이전 검토
- [ ] 출시 안정화 후 refactor/expo-sdk56-upgrade 브랜치 → main 머지

## 🔑 운영 규칙 (앞으로 1년)

- **JS만 고치는 수정** → `eas update --channel production --environment production` 한 줄로 OTA 배포. **app.json 버전은 11.0.0 그대로 유지!** (버전을 올리면 그 OTA는 아무에게도 전달 안 됨)
- **네이티브 변경** (라이브러리 추가, 권한, SDK 업그레이드, 아이콘 등) → 스토어 배포 필요. 그때 12.0.0으로 올리고, 출시 라이브 후 관리자 버전도 12.0.0으로
- OTA 호환 규칙 (appVersion 정책): **"11.0.0 바이너리에는 11.0.0으로 발행한 OTA만 들어간다"**
- EAS 계정: `finegst` (eas login 세션. EXPO_TOKEN은 .zshrc에서 제거했음 — 다시 넣으면 로그인보다 우선되니 주의)

---
---

# 기존 백로그 (v10 시절 작성 — 일부 항목은 이미 해결됐거나 구버전 기준)

## WebView 우선 로직 개선

> 현재 상태: 검토 대기
> 우선순위: 낮음 (추후 고민)

### 현재 문제점

```typescript
// 현재: 오버레이 방식 - 네이티브 앱이 항상 뒤에서 렌더링됨
<View style={{ flex: 1 }}>
  <AppMainApp />  {/* ← 항상 렌더링됨 (메모리 낭비) */}
  {!ico && <WebMainApp />}  {/* ← 위에 덮어씌움 */}
</View>
```

| 문제 | 설명 |
|------|------|
| 메모리 낭비 | 네이티브 앱이 항상 뒤에서 렌더링됨 |
| 매번 API 호출 | 앱 시작마다 서버 호출 필요 |
| 로딩 지연 | API 응답까지 화면 결정 대기 |
| 오프라인 대응 없음 | 네트워크 없으면 기본값 사용 |

---

### 개선 방안

#### 방법 1: 조건부 렌더링 (간단)

```typescript
return (
  <View style={{ flex: 1 }}>
    {ico ? <AppMainApp /> : <WebMainApp />}
  </View>
);
```

- 장점: 메모리 절약, 간단한 변경
- 단점: 여전히 매번 API 호출

---

#### 방법 2: AsyncStorage 캐싱 (권장)

```typescript
// 1. 저장된 값으로 즉시 표시
const cachedIco = await AsyncStorage.getItem('ico');
setIco(cachedIco === 'true');

// 2. 백그라운드에서 서버 값 확인 & 업데이트
const serverIco = await shouldShowWebMain();
if (serverIco !== (cachedIco === 'true')) {
  await AsyncStorage.setItem('ico', String(serverIco));
  setIco(serverIco);
}
```

- 장점: 즉시 로딩, 오프라인 대응, 서버 동기화
- 단점: AsyncStorage 의존성 추가

---

#### 방법 3: EAS Updates 활용

```typescript
// 환경변수로 관리, OTA 배포로 전환
const USE_WEBVIEW = process.env.USE_WEBVIEW === 'true';
```

- 장점: 서버 호출 불필요, 즉시 결정
- 단점: 전환 시 OTA 배포 필요

---

#### 방법 4: 하이브리드 (캐싱 + 부드러운 전환)

```typescript
function useAppMode() {
  const [mode, setMode] = useState<'native' | 'webview' | 'loading'>('loading');

  useEffect(() => {
    const init = async () => {
      const cached = await AsyncStorage.getItem('app_mode');
      if (cached) setMode(cached);

      const serverMode = await shouldShowWebMain() ? 'webview' : 'native';

      if (cached !== serverMode) {
        await AsyncStorage.setItem('app_mode', serverMode);
      }

      if (!cached) setMode(serverMode);
    };
    init();
  }, []);

  return mode;
}
```

---

### 결정 사항

- [ ] 방법 선택: _______________
- [ ] 구현 시기: _______________
- [ ] 담당자: _______________

---

## 보안 이슈 (높음)

- [ ] `.env` 파일 `.gitignore`에 추가 및 git 히스토리에서 제거
  - 현재 암호화 키가 노출됨: `ENCRYPT_SECRET_KEY=OSM7w50ck2h3V8svROUrd1LLWAGchuUJ`
- [ ] `api/client.ts:12` - `console.log(getKTShopKey())` 제거 (API 키 노출)
- [ ] `utils/Encrypt.ts:13` - 빈 IV 문제 해결 (고유한 IV 생성 필요)
  ```typescript
  iv: cryptoJs.enc.Utf8.parse(""), // 빈 IV는 보안 취약
  ```
- [ ] `CommonWebView.tsx` - mixedContentMode 보안 확인 (compatibility로 변경됨 — 재검토)

---

## 성능 개선 (중간)

- [ ] `api/client.ts:18` - setInterval 정리 메커니즘 추가 (AppState 리스너 도입됨 — 잔여 확인)
- [ ] `ProductList.tsx:41` - keyExtractor 개선
  ```typescript
  // 안티패턴
  keyExtractor={(item, index) => index.toString()}
  // 권장: 고유 ID 사용
  keyExtractor={(item) => item.uid.toString()}
  ```
- [ ] `CommonLayout.tsx:45` - 인라인 스타일 → StyleSheet.create()

---

## 코드 정리 (낮음)

### 중복 파일 삭제
- [ ] `utils/NumberPreprocesser copy.ts` 삭제
- [ ] `types/ContentTypes copy.ts` 삭제

### 미사용 코드 정리
- [ ] `types/ContentTypes.ts` - testType 제거
- [ ] `types/axiosTypes.ts` - LoginParams 확인 (미사용?)

### 주석 처리된 코드 정리
- [ ] `components/layout/CommonLayout.tsx:13-22` - 주석 코드 제거
- [ ] `components/app-ui/modules/RateCalculator.tsx:1-18` - 주석 코드 제거

### 기타
- [ ] `FixBar.tsx:53` - 카카오톡 URL 하드코딩 → 환경변수로 분리

---

## 에러 처리 개선

- [ ] `hooks/useProductData.ts` - 에러 상태 처리 추가
- [ ] 네트워크 오류 시 사용자 피드백 구현
