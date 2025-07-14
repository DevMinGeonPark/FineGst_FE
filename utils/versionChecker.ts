import { getShopVersion } from "../api/getShopVersion";
import LOCAL_VERSION from "./localVersion";

export interface VersionCheckResult {
  shopMajorVersion: string | undefined;
  localMajorVersion: string;
  isNetworkError: boolean;
  needsUpdate: boolean;
}

/**
 * 샵의 메이저 버전을 가져오는 함수
 * @returns 샵의 메이저 버전 (예: "5") 또는 undefined (네트워크 에러 시)
 */
export async function checkShopMajorVersion(): Promise<string | undefined> {
  try {
    const { ShopVersion } = await getShopVersion(); // ShopVersion 예시: "5.0.15"
    if (!ShopVersion) {
      // ShopVersion이 undefined면 네트워크 에러로 간주
      console.log("샵 버전이 undefined입니다. 네트워크 에러로 간주합니다.");
      return undefined;
    }
    const majorVersion = ShopVersion.split(".")[0]; // '5.0.15'을 '.'으로 분리하고 첫 번째 요소(메이저 버전)를 가져옵니다.

    console.log(`메이저 버전은 ${majorVersion}입니다.`);
    return majorVersion;
  } catch (error) {
    console.log("샵 버전을 가져오는 데 실패했습니다.", error);
    return undefined;
  }
}

/**
 * 로컬 버전과 샵 버전을 비교하는 함수
 * @returns VersionCheckResult 객체
 */
export async function compareVersions(): Promise<VersionCheckResult> {
  const shopMajorVersion = await checkShopMajorVersion(); // 비동기 결과 기다림
  const localMajorVersion = LOCAL_VERSION.split(".")[0]; // 로컬 메이저 버전

  const isNetworkError = !shopMajorVersion;
  const needsUpdate = shopMajorVersion !== undefined && shopMajorVersion !== localMajorVersion;

  if (isNetworkError) {
    console.log("네트워크 에러로 인해 버전 비교를 할 수 없습니다.");
  } else if (needsUpdate) {
    console.log(`APP: 두 메이저 버전이 다릅니다. 업데이트가 필요합니다.`);
  } else {
    console.log(`APP: 두 메이저 버전이 같습니다.`);
    // code push 에 의한 마이너 버전 자동 체크
  }

  return {
    shopMajorVersion,
    localMajorVersion,
    isNetworkError,
    needsUpdate,
  };
}

/**
 * 버전 문자열에서 메이저 버전을 추출하는 유틸리티 함수
 * @param version 버전 문자열 (예: "5.0.15")
 * @returns 메이저 버전 (예: "5")
 */
export function extractMajorVersion(version: string): string {
  return version.split(".")[0];
}
