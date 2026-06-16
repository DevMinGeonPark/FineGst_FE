[한국어](README.md) | English

# FineGst (FineGST Mobile Shopping App)

The mobile app for the KT official online mall (kt-online.shop) operated by FineGST Co., Ltd. It lets you browse phone handsets, estimate the monthly payment based on the rate plan and contract type you pick, and go straight through to sign-up and ordering. This is a live client project shipped for Android and iOS.

## Features

The app is a hybrid: WebView screens that wrap the live KT official mall site, plus the core flows rebuilt natively.

- **Home / browsing**: Shows new arrivals and handsets by category. Product lists come from a server API and render as cards.
- **Handset detail + rate calculator**: After choosing a handset, you select the contract type (number portability, device change, etc.), support type (public subsidy or contract discount), installment months, and rate plan. The calculator then computes the monthly payment in real time, factoring in the retail price, public subsidy, additional subsidy, the KT official mall extra discount, installment principal, and plan discounts.
- **Ordering**: Carries your selected options straight to the official mall's order page.
- **Login / sign-up / account recovery**: ID and password login, sign-up (the official mall's registration form shown in a WebView with the header and footer trimmed to fit the app), and account recovery that texts your ID and password after you enter your name and phone number.
- **KakaoTalk / phone shortcuts**: A toggle at the bottom of the screen opens KakaoTalk consultation or a phone call directly.
- **Popups / notices / forced update**: Operational popup modals, a network-error notice, and an update modal that checks the app version and prompts an update.
- **Security header (KTShopKey)**: Every API request carries a KTShopKey header that encrypts the current timestamp, refreshed every 30 seconds while the app is in the foreground.

## Tech Stack

- **Framework**: Expo 54, React Native 0.81, React 19 (New Architecture enabled)
- **Language**: TypeScript
- **Routing**: Expo Router (file-based routing, typed routes)
- **State**: Zustand
- **Networking**: Axios + TanStack Query (React Query)
- **WebView**: react-native-webview (official mall integration and message bridge)
- **UI / animation**: react-native-reanimated, reanimated-carousel, expo-image, expo-blur, @expo/vector-icons
- **Crypto**: crypto-es (KTShopKey generation)
- **Build / release**: EAS Build (Android `com.finegst.mshop`, iOS `shop.kt-online.www.finegstApp`)

Screens are split into atomic / module components, and API calls are kept separate under `api/` and `hooks/`.

## Getting Started

```bash
npm install
npx expo start
```

For tunneled development use `npm run start` (`expo start --clear --tunnel`). For native builds run `npx expo run:android` / `npx expo run:ios`.

Environment variables such as `BASE_URL` (via `@env`) are required, so set up your `.env` before running.
