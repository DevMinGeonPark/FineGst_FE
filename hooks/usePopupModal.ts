import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { popupModal } from "../api/PopupModal";
import logger from "../utils/logger";

export default function usePopupModal() {
  const query = useQuery({
    queryKey: ["PopupModal"],
    queryFn: popupModal,
  });

  useEffect(() => {
    if (query.error) {
      logger.error("usePopupModal 데이터 불러오기 실패", query.error);
    }
  }, [query.error]);

  const { data: popupData, ...restQuery } = query;

  return { popupData, ...restQuery };
}
