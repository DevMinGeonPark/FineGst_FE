import { useMutation } from "@tanstack/react-query";
import { DeleteParamProps } from "../types/MemberTypes";
import { DeleteMember } from "../api/DeleteMember";

export default function useDeleteMember() {
  const mutation = useMutation({
    mutationFn: (params: DeleteParamProps) => DeleteMember(params),
    onSuccess: (data) => {
      console.log("멤버 삭제 완료");
      console.log("status:", data);
    },
    onError: (error) => {
      console.log("멤버 삭제 실패", error);
    },
  });

  return mutation;
}
