import { useState } from "react";
import usePopupModal from "./usePopupModal";

interface UsePopupModalStateReturn {
  modal: boolean;
  setModal: (visible: boolean) => void;
  closeModal: () => void;
  popupData: any;
  defaultPopupData: any[];
}

export const usePopupModalState = (): UsePopupModalStateReturn => {
  const [modal, setModal] = useState<boolean>(true);
  const { popupData } = usePopupModal();

  const closeModal = () => {
    setModal(false);
  };

  const defaultPopupData = [
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
