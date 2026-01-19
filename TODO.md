# TODO - FineGst_FE

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

---

## 보안 이슈 (높음)

- [ ] `.env` 파일 `.gitignore`에 추가 및 git 히스토리에서 제거
  - 현재 암호화 키가 노출됨: `ENCRYPT_SECRET_KEY=OSM7w50ck2h3V8svROUrd1LLWAGchuUJ`
- [ ] `api/client.ts:12` - `console.log(getKTShopKey())` 제거 (API 키 노출)
- [ ] `utils/Encrypt.ts:13` - 빈 IV 문제 해결 (고유한 IV 생성 필요)
  ```typescript
  iv: cryptoJs.enc.Utf8.parse(""), // 빈 IV는 보안 취약
  ```
- [ ] `CommonWebView.tsx:203` - `mixedContentMode: "always"` → 보안 강화

---

## 성능 개선 (중간)

- [ ] `api/client.ts:18` - setInterval 정리 메커니즘 추가
  ```typescript
  setInterval(updateKTShopKey, 30000); // 앱 백그라운드에서도 계속 실행됨
  ```
- [ ] `CommonWebView.tsx` - JavaScript injection useMemo로 최적화
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
- [ ] `store/zustandStore.ts` - useCounterStore 제거 (미사용)
- [ ] `types/ContentTypes.ts` - testType 제거
- [ ] `types/axiosTypes.ts` - LoginParams 확인 (미사용?)

### 주석 처리된 코드 정리
- [ ] `components/layout/CommonLayout.tsx:13-22` - 주석 코드 제거
- [ ] `components/app-ui/modules/RateCalculator.tsx:1-18` - 주석 코드 제거

### 기타
- [ ] `utils/webViewOptimizer.ts:76,142` - 의미없는 `true;` 문 제거
- [ ] `FixBar.tsx:53` - 카카오톡 URL 하드코딩 → 환경변수로 분리

---

## 설정/버전 불일치

- [ ] 버전 동기화 필요
  | 파일 | 현재 | 수정 |
  |------|------|------|
  | package.json | 8.0.1 | 10.0.0 |
  | app.json | 9.0.0 | 10.0.0 |
  | localVersion.ts | 9.0.0 | 10.0.0 |

- [ ] `tsconfig.json:12` - 오타 수정
  ```json
  "app/_layout.androidtsx"  // → "app/_layout.android.tsx"
  ```

- [ ] tsconfig.json 경로 매핑 수정
  ```json
  "@/hooks/*": ["./app/hooks/*"]  // 실제는 ./hooks/
  ```

---

## 에러 처리 개선

- [ ] `hooks/useProductData.ts` - 에러 상태 처리 추가
- [ ] 네트워크 오류 시 사용자 피드백 구현

---

## 우선순위 요약

| 우선순위 | 항목 수 | 예상 작업량 |
|----------|---------|------------|
| 높음 (보안) | 4개 | 1-2시간 |
| 중간 (성능) | 4개 | 2-3시간 |
| 낮음 (정리) | 12개 | 1-2시간 |
