import { ParamProps, MachineCalResType, ChargeCalResType } from "../types/RateCalculatorTypes";
import client from "./client";

export async function getRateData(body: ParamProps): Promise<MachineCalResType | ChargeCalResType | undefined> {
  const res = await client.post("calcharge.php", body);
  return res.data as MachineCalResType | ChargeCalResType | undefined;
}
