import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("X-Api-Hit", "pages-api-user-scrap");

  const auth = req.headers.authorization || "";

  // !!!!!!!!!!!! 밑에 console.log 디버깅 지우기
  console.log(
    "[api/user/scrap] auth header:",
    auth ? auth.slice(0, 20) + "..." : "(empty)"
  );
  console.log("[api/user/scrap] method:", req.method);

  const axiosOpt = {
    maxRedirects: 0,
    validateStatus: () => true,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
  } as const;

  // Get
  if (req.method === "GET") {
    const r = await axios.get(`${BASE}/user/scrap`, axiosOpt);

    if (r.status === 301 || r.status === 302) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    return res.status(r.status).json(r.data);
  }

  // Delete
  if (req.method === "DELETE") {
    // object, string 둘 다 고려
    const body = typeof req.body === "string"
      ? JSON.parse(req.body || "[]")
      : req.body ?? [];

    // 배열
    if (!Array.isArray(body)) {
      return res.status(400).json({ message: "array of ids required" });
    }

    const r = await axios.request({
      url: `${BASE}/user/scrap`,
      method: "DELETE",
      data: body, // 그대로 배열 전달
      maxRedirects: 0,
      validateStatus: () => true,
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
    });

    // 디버깅 지우기 !!!!!!
    console.log("[api/user/scrap] backend status:", r.status);
    console.log("[api/user/scrap] backend data:", r.data);

    // 백엔드가 301/302로 “로그인 필요”를 표현하는 케이스 처리
    if (
      r.status === 301 ||
      r.status === 302 ||
      r.status === 401 ||
      r.status === 403
    ) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }
    return res.status(r.status).json(r.data);
  }

  res.setHeader("Allow", "GET, DELETE");
  return res.status(405).end();
}
