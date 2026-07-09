import { useEffect, useCallback, useState } from "react";
import * as Updates from "expo-updates";
import { UpdateInfoType } from "expo-updates";
import type { CurrentlyRunningInfo } from "expo-updates";
import logger from "../utils/logger";

interface UseAppUpdatesReturn {
  /** 현재 실행 중인 업데이트 정보 */
  currentlyRunning: CurrentlyRunningInfo;
  /** 업데이트 사용 가능 여부 */
  isUpdateAvailable: boolean;
  /** 업데이트 다운로드 완료 (다음 실행 시 적용) */
  isUpdatePending: boolean;
  /** 다운로드 진행 중 여부 */
  isDownloading: boolean;
  /** 다운로드 진행률 (0.0 ~ 1.0) */
  downloadProgress: number;
  /** 강제 업데이트 필요 여부 */
  isForceUpdateRequired: boolean;
  /** 에러 상태 */
  error: Error | null;
  /** 수동으로 업데이트 확인 */
  checkForUpdate: () => Promise<boolean>;
  /** 업데이트 다운로드 */
  downloadUpdate: () => Promise<boolean>;
  /** 강제 업데이트 (즉시 재시작) */
  forceUpdate: () => Promise<void>;
}

export function useAppUpdates(): UseAppUpdatesReturn {
  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    downloadProgress,
    availableUpdate,
  } = Updates.useUpdates();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isForceUpdateRequired, setIsForceUpdateRequired] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 앱 실행 시 업데이트 확인
  useEffect(() => {
    if (__DEV__) {
      logger.log("Skipping update check in development mode");
      return;
    }

    checkForUpdateInternal();
  }, []);

  // 업데이트 사용 가능 시 자동 다운로드
  useEffect(() => {
    if (isUpdateAvailable && !isDownloading && !__DEV__) {
      downloadUpdateInternal();
    }
  }, [isUpdateAvailable]);

  // 강제 업데이트 감지 (rollback directive 또는 emergency launch인 경우)
  useEffect(() => {
    if (__DEV__) return;

    // Rollback directive 감지
    if (availableUpdate?.type === UpdateInfoType.ROLLBACK) {
      logger.log("Critical update detected - rollback directive");
      setIsForceUpdateRequired(true);
    }

    // Emergency launch 감지 (embedded로 fallback된 경우)
    if (currentlyRunning.isEmergencyLaunch) {
      logger.log("Emergency launch detected");
      setIsForceUpdateRequired(true);
    }
  }, [availableUpdate, currentlyRunning.isEmergencyLaunch]);

  const checkForUpdateInternal = async (): Promise<boolean> => {
    if (__DEV__) return false;

    try {
      logger.log("Checking for updates...");
      const result = await Updates.checkForUpdateAsync();
      return result.isAvailable;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      logger.log("Error checking for updates:", err.message);
      setError(err);
      return false;
    }
  };

  const downloadUpdateInternal = async (): Promise<boolean> => {
    if (__DEV__) return false;

    try {
      setIsDownloading(true);
      setError(null);
      logger.log("Downloading update...");

      await Updates.fetchUpdateAsync();

      logger.log("Update downloaded, will apply on next launch");
      setIsDownloading(false);
      return true;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      logger.log("Error downloading update:", err.message);
      setError(err);
      setIsDownloading(false);
      return false;
    }
  };

  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    return checkForUpdateInternal();
  }, []);

  const downloadUpdate = useCallback(async (): Promise<boolean> => {
    return downloadUpdateInternal();
  }, []);

  const forceUpdate = useCallback(async (): Promise<void> => {
    if (__DEV__) {
      logger.log("Force update skipped in development");
      return;
    }

    try {
      logger.log("Forcing update reload...");
      await Updates.reloadAsync();
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      logger.log("Error forcing update:", err.message);
      setError(err);
    }
  }, []);

  return {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    isDownloading,
    downloadProgress: downloadProgress ?? 0,
    isForceUpdateRequired,
    error,
    checkForUpdate,
    downloadUpdate,
    forceUpdate,
  };
}

export default useAppUpdates;
