import { useQuery } from "@tanstack/react-query";
import { getProductData } from "../api/getProductData";
import { CommonProps } from "../types/CommonTypes";
import { ParamProps } from "../types/ProductTypes";
// import { useUserStore } from '../store/userStore';

export default function useProductData(params: CommonProps | ParamProps) {
  const query = useQuery({
    queryKey: ["getProductData", params],
    queryFn: async () => {
      const result = await getProductData(params);
      return result;
    },
  });
  // return mutation;
  return query;
}
