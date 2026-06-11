import React, { ReactNode } from "react";
import { useAppUpdates } from "../hooks/useAppUpdates";
import { UpdateContext } from "./UpdateContext";
import ForceUpdateModal from "./app-ui/modules/ForceUpdateModal";

// useUpdate 훅은 require cycle 방지를 위해 UpdateContext.ts에 정의되어 있습니다.
export { useUpdate } from "./UpdateContext";

interface UpdateProviderProps {
  children: ReactNode;
}

/**
 * OTA 업데이트 상태를 관리하는 Provider
 * 앱 실행 시 자동으로 업데이트를 확인하고 백그라운드에서 다운로드합니다.
 */
export function UpdateProvider({ children }: UpdateProviderProps) {
  const {
    currentlyRunning,
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
        currentlyRunning,
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

export default UpdateProvider;
