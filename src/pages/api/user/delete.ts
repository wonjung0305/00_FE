import type { NextApiRequest, NextApiResponse } from "next";
import backendApi from "@/lib/backendApi";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") return res.status(405).end();

  const r = await backendApi.delete("/user/delete", {
    headers: {
      // 프론트에서 넘어온 Authorization 그대로 전달
      Authorization: req.headers.authorization || "",
    },
    validateStatus: () => true,
  });

  return res.status(r.status).send(r.data);
}
