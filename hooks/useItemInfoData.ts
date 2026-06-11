import { useQuery } from "@tanstack/react-query";
import { ItemDetail, ParamProps } from "../types/DetailTypes";
import { getItemInfo } from "../api/getItemInfo";
import logger from "../utils/logger";
// import { useUserStore } from '@src/Store/userStore';

export default function useItemInfoData(params: ParamProps) {
  // const { user } = useUserStore();

  const query = useQuery<ItemDetail, Error>({
    queryKey: ["getItemInfoData", params],
    queryFn: () => getItemInfo({ ...params, LogInID: "web366" }),
    notifyOnChangeProps: ["data"],
  });

  // 쿼리 상태에 따른 로깅
  if (query.isSuccess) {
    logger.log(`ItemInfoData 데이터 불러오기 성공 `);
  }

  if (query.isError) {
    logger.error(`ItemInfoData 데이터 불러오기 실패`);
    logger.error(query.error);
  }

  return query;
}
