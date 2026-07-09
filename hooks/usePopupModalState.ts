import { useCallback, useState } from "react";
import usePopupModal from "./usePopupModal";
import { GongContent } from "../types/processGongContent";

interface UsePopupModalStateReturn {
  modal: boolean;
  setModal: (visible: boolean) => void;
  closeModal: () => void;
  popupData: GongContent[] | undefined;
  defaultPopupData: GongContent[];
}

// 렌더마다 새 배열이 만들어지면 PopupModal이 불필요하게 재렌더되므로 모듈 상수로 유지
const DEFAULT_POPUP_DATA: GongContent[] = [
  {
    GongLinkUrl: "https://kt-online.shop/bbs/board.php?bo_table=event_gift&wr_id=12",
    GongImgUrl: "https://www.kt-online.shop/data/newwin/nw_image4_1.jpg",
  },
];

export const usePopupModalState = (): UsePopupModalStateReturn => {
  const [modal, setModal] = useState<boolean>(true);
  const { popupData } = usePopupModal();

  const closeModal = useCallback(() => {
    setModal(false);
  }, []);

  return {
    modal,
    setModal,
    closeModal,
    popupData,
    defaultPopupData: DEFAULT_POPUP_DATA,
  };
};
