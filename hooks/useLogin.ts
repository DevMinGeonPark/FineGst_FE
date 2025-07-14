import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";
import useAuthStore from "../store/authStore";
import { useRouter } from "expo-router";
import useMemberInfoData from "./useMemberInfoData";

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
      console.log("onSuccess:");
      if (data.Status === "A10" || data.Status === "A50") {
        console.log("로그인 성공 정보:", JSON.stringify(data, null, 2));
        console.log("setLogin 시작");

        // 먼저 기본 사용자 정보로 로그인 처리
        // loginUser({ UserId: id, UserNm: data.UserNm, Point: 0 });
        console.log("setLogin 완료 & refetch 시작");

        // 회원 정보 조회를 통해 포인트 업데이트
        try {
          const memberInfoResult = await refetch();
          if (memberInfoResult.data) {
            loginUser({ UserId: id, UserNm: data.UserNm, Point: memberInfoResult.data.UserPoint });
            console.log("회원 정보 조회 성공, 포인트 업데이트:", memberInfoResult.data);
          }
        } catch (error) {
          console.error("회원 정보 조회 실패:", error);
        }

        router.replace("/");
      } else {
        console.log("beforeOnError:", JSON.stringify(data, null, 2));
        throw new Error(data.ErrMsg); //onError로 헨들링
      }
    },
    onError: (error: { message: string }) => {
      const handle = error.message;
      console.log(`로그인 실패 [${handle}]`);
      if (handle === "로그인 정보 없음") {
        // alert({
        //   title: "로그인 실패",
        //   message: "로그인 정보가 없습니다.\n 아이디 혹은 비밀번호를 확인해주세요",
        // });
      } else if (handle === "Password Input") {
        // alert({
        //   title: "로그인 실패",
        //   message: "아이디 혹은 비밀번호를 입력해주세요",
        // });
      } else if (handle === "ID Input") {
        // alert({
        //   title: "로그인 실패",
        //   message: "아이디를 입력해주세요.",
        // });
      } else {
        console.log(handle);
        // alert({
        //   title: "로그인 실패",
        //   message: "원인불명 관리자에게 문의하세요!",
        // });
        console.log(handle);
      }
    },
  });
  return mutation;
}
