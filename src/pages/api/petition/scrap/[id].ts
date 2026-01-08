import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// 혹시 모를 / eoql
const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("X-Api-Hit", "pages-api-petition-scrap-id");

  const auth = req.headers.authorization || "";
  const idRaw = typeof req.query.id === "string" ? req.query.id : "";

  if (!idRaw) return res.status(400).json({ message: "id is required" });

  const axiosOpt = {
    maxRedirects: 0,
    validateStatus: () => true,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
  } as const;

  if (req.method === "POST") {
    const r = await axios.post(`${BASE}/petition/scrap/${idRaw}`, null, axiosOpt);

    if (r.status === 301 || r.status === 302) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    return res.status(r.status).json(r.data);
  }

  res.setHeader("Allow", "POST");
  return res.status(405).end();
}
