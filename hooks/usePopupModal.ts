import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { popupModal } from "../api/PopupModal";

export default function usePopupModal() {
  const query = useQuery({
    queryKey: ["PopupModal"],
    queryFn: popupModal,
  });

  useEffect(() => {
    if (query.data && query.isSuccess) {
      console.log("usePopupModal 데이터 불러오기 성공");
    }
  }, [query.data, query.isSuccess]);

  useEffect(() => {
    if (query.error) {
      console.error("usePopupModal 데이터 불러오기 실패", query.error);
    }
  }, [query.error]);

  // 원하는 이름으로 할당
  const { data: popupData, ...restQuery } = query;

  return { popupData, ...restQuery };
}
