import { getShopVersion } from "../api/getShopVersion";
import LOCAL_VERSION from "./localVersion";
import logger from "./logger";

const VERSION_CHECK_TIMEOUT = 5000; // 5초 타임아웃

export interface VersionCheckResult {
  shopVersion: string | undefined;
  localVersion: string;
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
 * 서버 버전이 로컬 버전보다 높은지 세그먼트 단위로 비교하는 함수
 * (예: "11.0.0" > "10.1.0" → true, "10.1.0" > "10.1.0" → false)
 * 서버 버전이 로컬보다 낮은 경우(스토어 심사 중 등)에는 업데이트를 띄우지 않음
 */
function isNewerVersion(server: string, local: string): boolean {
  const serverParts = server.split(".").map((n) => parseInt(n, 10) || 0);
  const localParts = local.split(".").map((n) => parseInt(n, 10) || 0);
  const length = Math.max(serverParts.length, localParts.length);
  for (let i = 0; i < length; i++) {
    const s = serverParts[i] ?? 0;
    const l = localParts[i] ?? 0;
    if (s !== l) return s > l;
  }
  return false;
}

/**
 * 샵의 버전을 가져오는 함수
 * @returns 샵의 전체 버전 (예: "10.1.0") 또는 undefined (네트워크 에러 시)
 */
export async function checkShopVersion(): Promise<string | undefined> {
  try {
    const { ShopVersion } = await getShopVersion(); // ShopVersion 예시: "10.1.0"
    if (!ShopVersion) {
      // ShopVersion이 undefined면 네트워크 에러로 간주
      logger.log("샵 버전이 undefined입니다. 네트워크 에러로 간주합니다.");
      return undefined;
    }

    logger.log(`샵 버전은 ${ShopVersion}입니다.`);
    return ShopVersion;
  } catch (error) {
    logger.log("샵 버전을 가져오는 데 실패했습니다.", error);
    return undefined;
  }
}

/**
 * 로컬 버전과 샵 버전을 비교하는 함수
 * 샵 버전이 로컬 버전보다 높을 때만 업데이트 필요로 판단
 * @returns VersionCheckResult 객체
 */
export async function compareVersions(): Promise<VersionCheckResult> {
  const localVersion = LOCAL_VERSION;

  let shopVersion: string | undefined;
  let isTimeout = false;
  let isNetworkError = false;

  try {
    shopVersion = await withTimeout(checkShopVersion(), VERSION_CHECK_TIMEOUT);
    isNetworkError = !shopVersion;
  } catch (error) {
    if (error instanceof Error && error.message === "TIMEOUT") {
      logger.log("버전 체크 타임아웃 - 기본값으로 앱 진입");
      isTimeout = true;
    } else {
      logger.log("버전 체크 실패:", error);
      isNetworkError = true;
    }
  }

  const needsUpdate = shopVersion !== undefined && isNewerVersion(shopVersion, localVersion);

  if (isTimeout) {
    logger.log("타임아웃으로 인해 버전 비교를 건너뜁니다.");
  } else if (isNetworkError) {
    logger.log("네트워크 에러로 인해 버전 비교를 할 수 없습니다.");
  } else if (needsUpdate) {
    logger.log(`APP: 샵 버전(${shopVersion})이 로컬 버전(${localVersion})보다 높습니다. 업데이트가 필요합니다.`);
  } else {
    logger.log(`APP: 업데이트가 필요하지 않습니다. (샵: ${shopVersion}, 로컬: ${localVersion})`);
  }

  return {
    shopVersion,
    localVersion,
    isNetworkError,
    isTimeout,
    needsUpdate,
  };
}
