import { create } from "zustand";

interface ShowToggleIconsState {
  // 상태
  showToggleIcons: boolean;

  // 액션
  setShowToggleIcons: (show: boolean) => void;
  toggleShowToggleIcons: () => void;
}

const useShowToggleIconsStore = create<ShowToggleIconsState>((set) => ({
  // 초기 상태
  showToggleIcons: false,

  // 액션들
  setShowToggleIcons: (show: boolean) => set({ showToggleIcons: show }),

  toggleShowToggleIcons: () =>
    set((state) => ({
      showToggleIcons: !state.showToggleIcons,
    })),
}));

export default useShowToggleIconsStore;
