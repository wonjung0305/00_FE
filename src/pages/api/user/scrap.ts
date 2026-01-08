import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("X-Api-Hit", "pages-api-user-scrap");

  const auth = req.headers.authorization || "";

  const axiosOpt = {
    maxRedirects: 0,
    validateStatus: () => true,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
  } as const;

  if (req.method === "GET") {
    const r = await axios.get(`${BASE}/user/scrap`, axiosOpt);

    if (r.status === 301 || r.status === 302) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    return res.status(r.status).json(r.data);
  }

  if (req.method === "DELETE") {

    const r = await axios.delete("/api/user/scrap", {
      ...axiosOpt,
      data: req.body,
    });

    if (r.status === 301 || r.status === 302) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    return res.status(r.status).json(r.data);
  }

  res.setHeader("Allow", "GET, DELETE");
  return res.status(405).end();
}
