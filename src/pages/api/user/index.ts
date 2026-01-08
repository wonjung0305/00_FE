import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 서버 주소 세팅 (없으면 오류 보내기)
  const base = process.env.SERVER_BASE_URL;
  if (!base) return res.status(500).send("SERVER_BASE_URL is not set");

  // PATCH만 허용
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).end();
  }

  try {
    // Authorization 헤더 전달 (JWT 필요) ****
    const auth = req.headers.authorization;

    const r = await axios.patch(`${base}/user`, req.body, {
      headers: {
        ...(auth ? { Authorization: auth } : {}),
      },
      validateStatus: () => true,
    });

    return res.status(r.status).json(r.data ?? null);
  } catch (e: any) {
    return res.status(500).json({ message: e?.message ?? "proxy error" });
  }
}