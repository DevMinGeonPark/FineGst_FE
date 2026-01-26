import React, { createContext, useContext, ReactNode } from "react";
import { useAppUpdates } from "../hooks/useAppUpdates";
import ForceUpdateModal from "./app-ui/modules/ForceUpdateModal";

interface UpdateContextType {
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
  /** 강제 업데이트 (즉시 재시작) */
  forceUpdate: () => Promise<void>;
}

const UpdateContext = createContext<UpdateContextType | null>(null);

interface UpdateProviderProps {
  children: ReactNode;
}

/**
 * OTA 업데이트 상태를 관리하는 Provider
 * 앱 실행 시 자동으로 업데이트를 확인하고 백그라운드에서 다운로드합니다.
 */
export function UpdateProvider({ children }: UpdateProviderProps) {
  const {
    isUpdateAvailable,
    isUpdatePending,
    isDownloading,
    downloadProgress,
    isForceUpdateRequired,
    error,
    checkForUpdate,
    forceUpdate,
  } = useAppUpdates();

  return (
    <UpdateContext.Provider
      value={{
        isUpdateAvailable,
        isUpdatePending,
        isDownloading,
        downloadProgress,
        isForceUpdateRequired,
        error,
        checkForUpdate,
        forceUpdate,
      }}
    >
      {children}
      <ForceUpdateModal />
    </UpdateContext.Provider>
  );
}

/**
 * 업데이트 상태에 접근하는 Hook
 */
export function useUpdate(): UpdateContextType {
  const context = useContext(UpdateContext);
  if (!context) {
    throw new Error("useUpdate must be used within UpdateProvider");
  }
  return context;
}

export default UpdateProvider;
