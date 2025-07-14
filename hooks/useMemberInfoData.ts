import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getMemberInfo } from "../api/getMemberInfo";
import { ParamProps } from "../types/axiosTypes";
import useAuthStore from "../store/authStore";

export default function useMemberInfoData(params: ParamProps) {
  const { user, login, isLoggedIn } = useAuthStore();

  const query = useQuery({
    queryKey: ["getMemberInfo", params],
    queryFn: () => getMemberInfo(params),
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (query.data && query.isSuccess) {
      console.log(`MemberInfoData 데이터 불러오기 성공\n${JSON.stringify(query.data, null, 2)}`);

      login({
        UserId: params.KTShopID,
        UserNm: user?.UserNm || query.data.UserNm || "",
        Point: query.data?.UserPoint || 0,
      });
    }
  }, [query.data, query.isSuccess, login, query.data?.UserPoint, params.KTShopID]);

  useEffect(() => {
    if (query.error) {
      console.error(`MemberInfoData 데이터 불러오기 실패`);
      console.error(query.error);
    }
  }, [query.error]);

  return query;
}
