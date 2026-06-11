import { getShopVersion } from "../api/getShopVersion";
import LOCAL_VERSION from "./localVersion";
import logger from "./logger";

const VERSION_CHECK_TIMEOUT = 5000; // 5초 타임아웃

export interface VersionCheckResult {
  shopMajorVersion: string | undefined;
  localMajorVersion: string;
  isNetworkError: boolean;
  isTimeout: boolean;
  needsUpdate: boolean;
}

/**
 * Promise에 타임아웃을 적용하는 유틸리티 함수
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("TIMEOUT")), ms)
  );
  return Promise.race([promise, timeout]);
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
      logger.log("샵 버전이 undefined입니다. 네트워크 에러로 간주합니다.");
      return undefined;
    }
    const majorVersion = ShopVersion.split(".")[0]; // '5.0.15'을 '.'으로 분리하고 첫 번째 요소(메이저 버전)를 가져옵니다.

    logger.log(`메이저 버전은 ${majorVersion}입니다.`);
    return majorVersion;
  } catch (error) {
    logger.log("샵 버전을 가져오는 데 실패했습니다.", error);
    return undefined;
  }
}

/**
 * 로컬 버전과 샵 버전을 비교하는 함수
 * @returns VersionCheckResult 객체
 */
export async function compareVersions(): Promise<VersionCheckResult> {
  const localMajorVersion = LOCAL_VERSION.split(".")[0];

  let shopMajorVersion: string | undefined;
  let isTimeout = false;
  let isNetworkError = false;

  try {
    shopMajorVersion = await withTimeout(checkShopMajorVersion(), VERSION_CHECK_TIMEOUT);
    isNetworkError = !shopMajorVersion;
  } catch (error) {
    if (error instanceof Error && error.message === "TIMEOUT") {
      logger.log("버전 체크 타임아웃 - 기본값으로 앱 진입");
      isTimeout = true;
    } else {
      logger.log("버전 체크 실패:", error);
      isNetworkError = true;
    }
  }

  const needsUpdate = shopMajorVersion !== undefined && shopMajorVersion !== localMajorVersion;

  if (isTimeout) {
    logger.log("타임아웃으로 인해 버전 비교를 건너뜁니다.");
  } else if (isNetworkError) {
    logger.log("네트워크 에러로 인해 버전 비교를 할 수 없습니다.");
  } else if (needsUpdate) {
    logger.log(`APP: 두 메이저 버전이 다릅니다. 업데이트가 필요합니다.`);
  } else {
    logger.log(`APP: 두 메이저 버전이 같습니다.`);
  }

  return {
    shopMajorVersion,
    localMajorVersion,
    isNetworkError,
    isTimeout,
    needsUpdate,
  };
}
