import { useQuery } from "@tanstack/react-query";
import { ParamProps } from "../types/RateCalculatorTypes";
import { getRateData } from "../api/getRateData";

export default function useRateData(params: ParamProps) {
  const query = useQuery({
    queryKey: ["getItemInfoData", params],
    queryFn: () => getRateData(params),
    notifyOnChangeProps: ["data"],
  });
  return query;
}
