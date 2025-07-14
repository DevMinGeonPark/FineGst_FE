import { useQuery } from "@tanstack/react-query";
import getPlanDesc from "../api/getPlanDesc";

export default function usePlanDesc(RateCode: string | undefined, planVol: string | undefined) {
  return useQuery<string>({
    queryKey: ["planDesc", RateCode, planVol],
    queryFn: () => getPlanDesc(RateCode || "", planVol || ""),
    enabled: !!RateCode && !!planVol,
  });
}
