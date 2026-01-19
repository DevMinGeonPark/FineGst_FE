import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";
import useAuthStore from "../store/authStore";
import { useRouter } from "expo-router";
import useMemberInfoData from "./useMemberInfoData";
import logger from "../utils/logger";

interface LoginData {
  id: string;
  loginType: string;
}

export default function useLogin({ id, loginType }: LoginData) {
  const router = useRouter();

  const { refetch } = useMemberInfoData({
    KTShopID: id || "",
    KTShopPW: "",
  });

  // const alert = useAlert();

  const { login: loginUser } = useAuthStore();

  // const toast = useToast();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      if (data.Status === "A10" || data.Status === "A50") {
        logger.log("로그인 성공");

        // 회원 정보 조회를 통해 포인트 업데이트
        try {
          const memberInfoResult = await refetch();
          if (memberInfoResult.data) {
            loginUser({ UserId: id, UserNm: data.UserNm, Point: memberInfoResult.data.UserPoint });
          }
        } catch (error) {
          logger.error("회원 정보 조회 실패:", error);
        }

        router.replace("/");
      } else {
        throw new Error(data.ErrMsg);
      }
    },
    onError: (error: { message: string }) => {
      const handle = error.message;
      logger.log(`로그인 실패 [${handle}]`);
      // TODO: 사용자에게 에러 알림 표시
    },
  });
  return mutation;
}
