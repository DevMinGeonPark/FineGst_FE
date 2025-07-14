import { GongContent, processGongContent } from "../types/processGongContent";
import client from "./client";

export async function popupModal(): Promise<GongContent[]> {
  const res = await client.post("pushgonggi.php", {});

  return processGongContent(res.data);
}
