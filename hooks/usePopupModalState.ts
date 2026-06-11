import { useState } from "react";
import usePopupModal from "./usePopupModal";
import { GongContent } from "../types/processGongContent";

interface UsePopupModalStateReturn {
  modal: boolean;
  setModal: (visible: boolean) => void;
  closeModal: () => void;
  popupData: GongContent[] | undefined;
  defaultPopupData: GongContent[];
}

export const usePopupModalState = (): UsePopupModalStateReturn => {
  const [modal, setModal] = useState<boolean>(true);
  const { popupData } = usePopupModal();

  const closeModal = () => {
    setModal(false);
  };

  const defaultPopupData: GongContent[] = [
    {
      GongLinkUrl: "https://kt-online.shop/bbs/board.php?bo_table=event_gift&wr_id=12",
      GongImgUrl: "https://www.kt-online.shop/data/newwin/nw_image4_1.jpg",
    },
  ];

  return {
    modal,
    setModal,
    closeModal,
    popupData,
    defaultPopupData,
  };
};
