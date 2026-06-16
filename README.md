한국어 | [English](README.en.md)

# FineGst (화인지에스티 모바일 쇼핑 앱)

(주)화인지에스티가 운영하는 KT 공식 온라인몰(kt-online.shop)의 모바일 앱입니다. 휴대폰 단말기를 둘러보고, 요금제와 가입 형태에 따라 월 납부 금액을 계산해 보고, 그대로 가입·주문까지 이어지도록 만든 안드로이드/iOS 앱입니다. 실제 서비스 중인 클라이언트 프로젝트입니다.

## 주요 기능

앱은 운영 중인 KT 공식몰 웹을 감싸는 WebView 화면과, 핵심 흐름을 네이티브로 다시 구현한 화면이 함께 들어 있는 하이브리드 구조입니다.

- **메인 / 상품 둘러보기**: 신제품과 카테고리별 단말기 목록을 보여줍니다. 상품 목록은 서버 API에서 받아와 카드 형태로 보여 줍니다.
- **단말기 상세 + 요금 계산기**: 단말기를 고른 뒤 가입형태(번호이동·기기변경 등), 지원형태(공시지원금·선택약정), 할부개월, 요금제를 선택하면 출고가, 공시지원금, 추가지원금, KT공식몰 추가할인, 할부원금, 요금할인까지 반영한 월 납부 금액을 실시간으로 계산해 줍니다.
- **주문하기**: 선택한 조건 그대로 공식몰 주문 페이지로 연결됩니다.
- **로그인 / 회원가입 / 정보찾기**: 아이디·비밀번호 로그인, 회원가입(공식몰 가입 폼을 WebView로 띄우되 앱에 맞게 헤더·푸터를 정리), 이름과 휴대폰 번호로 아이디·비밀번호를 문자로 받는 정보찾기를 지원합니다.
- **카카오톡·전화 바로가기**: 화면 하단의 토글 아이콘으로 카카오톡 상담과 전화 연결을 바로 띄웁니다.
- **팝업·공지·강제 업데이트**: 운영 팝업 모달, 네트워크 오류 안내, 앱 버전 점검 후 업데이트 유도 모달을 갖추고 있습니다.
- **보안 헤더(KTShopKey)**: 모든 API 요청에 현재 시각을 암호화한 KTShopKey 헤더를 붙이고, 앱이 포그라운드일 때 30초마다 키를 갱신합니다.

## 기술 스택

- **프레임워크**: Expo 54, React Native 0.81, React 19 (New Architecture 활성화)
- **언어**: TypeScript
- **라우팅**: Expo Router (파일 기반 라우팅, typed routes)
- **상태 관리**: Zustand
- **서버 통신**: Axios + TanStack Query (React Query)
- **WebView**: react-native-webview (공식몰 페이지 연동 및 메시지 브리지)
- **UI / 애니메이션**: react-native-reanimated, reanimated-carousel, expo-image, expo-blur, @expo/vector-icons
- **암호화**: crypto-es (KTShopKey 생성)
- **빌드 / 배포**: EAS Build (안드로이드 `com.finegst.mshop`, iOS `shop.kt-online.www.finegstApp`)

화면은 atomic / modules 단위로 컴포넌트를 나누고, API 호출은 `api/`와 `hooks/`로 분리해 관리합니다.

## 실행 방법

```bash
npm install
npx expo start
```

개발용으로 터널을 쓰려면 `npm run start`(`expo start --clear --tunnel`)를 사용합니다. 네이티브 빌드는 `npx expo run:android` / `npx expo run:ios`로 실행합니다.

`@env`의 `BASE_URL` 등 환경 변수가 필요하므로 `.env` 설정 후 실행해 주세요.
