import { useQuery } from "@tanstack/react-query";
import { ItemDetail, ParamProps } from "../types/DetailTypes";
import { getItemInfo } from "../api/getItemInfo";
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
    console.log(`ItemInfoData 데이터 불러오기 성공 `);
  }

  if (query.isError) {
    console.log(`ItemInfoData 데이터 불러오기 실패`);
    console.log(query.error);
  }

  return query;
}
