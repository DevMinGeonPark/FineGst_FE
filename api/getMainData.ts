import client from "./client";

export async function getMainData() {
  const res = await client.post("main.php", {});
  return res.data;
}
