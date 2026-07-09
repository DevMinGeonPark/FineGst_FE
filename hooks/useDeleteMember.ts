import { useMutation } from "@tanstack/react-query";
import { DeleteParamProps } from "../types/MemberTypes";
import { DeleteMember } from "../api/DeleteMember";
import logger from "../utils/logger";

export default function useDeleteMember() {
  const mutation = useMutation({
    mutationFn: (params: DeleteParamProps) => DeleteMember(params),
    onSuccess: (data) => {
      logger.log("멤버 삭제 완료");
      logger.log("status:", data);
    },
    onError: (error) => {
      logger.error("멤버 삭제 실패", error);
    },
  });

  return mutation;
}
