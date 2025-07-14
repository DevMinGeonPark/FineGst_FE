import { create } from "zustand";
import { FixBarContextStateProps } from "../types/ContentTypes";

type FixBarState = {
  fixBarProps: FixBarContextStateProps | null;
  setFixBarProps: (props: FixBarContextStateProps | null) => void;
  showFixBar: boolean;
  setShowFixBar: (show: boolean) => void;
};

const useFixBarStore = create<FixBarState>((set) => ({
  fixBarProps: null,
  setFixBarProps: (props) => set({ fixBarProps: props }),
  showFixBar: false,
  setShowFixBar: (show) => set({ showFixBar: show }),
}));

export default useFixBarStore;
