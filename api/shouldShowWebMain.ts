import client from "./client";

export async function shouldShowWebMain(): Promise<boolean> {
  try {
    const res = await client.get("data_ico.php");

    const data = res.data;

    return data.ico;
  } catch {
    return false;
  }
}
