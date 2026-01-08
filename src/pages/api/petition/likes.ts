import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("X-Api-Hit", "pages-api-petition-likes");

  const auth = req.headers.authorization || "";

  const axiosOpt = {
    maxRedirects: 0,
    validateStatus: () => true,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
  } as const;

  try {
    if (req.method === "POST") {
      const r = await axios.post(`${BASE}/petition/likes`, req.body, axiosOpt);

      if (r.status === 301 || r.status === 302) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      return res.status(r.status).json(r.data ?? null);
    }

    res.setHeader("Allow", "POST");
    return res.status(405).end();
  } catch (e: any) {
    return res.status(500).json({ message: e?.message ?? "proxy error" });
  }
}
