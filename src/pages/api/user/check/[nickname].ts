import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const base = process.env.SERVER_BASE_URL;
  if (!base) return res.status(500).send("SERVER_BASE_URL is not set");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const nickname =
    typeof req.query.nickname === "string" ? req.query.nickname : "";
  if (!nickname) return res.status(400).send("Invalid nickname");

  try {
    const r = await axios.get(`${base}/user/check/${encodeURIComponent(nickname)}`, {
      maxRedirects: 0,
      // 어떤 상태코드든 throw하지 않게
      validateStatus: () => true,
    });

    // 백엔드가 준 상태코드를 그대로 전달
    return res.status(r.status).json(r.data ?? null);
  } catch (e: any) {
    // 네트워크/서버 다운 같은 "진짜 예외"만 502로
    return res.status(502).json({ message: e?.message ?? "proxy error" });
  }
}
