// @src/API/getPlanDesc.ts
import client from "./client";

const getPlanDesc = async (RateCode: string, plan: string): Promise<string> => {
  const body = {
    RateCode,
    Vol: plan,
  };
  const res = await client.post("rateinfo.php", body);

  return res.data.toString();
};

export default getPlanDesc;
