import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const base = process.env.SERVER_BASE_URL;
  if (!base) return res.status(500).send("SERVER_BASE_URL is not set");

  const idRaw = typeof req.query.id === "string" ? req.query.id : "";
  const id = Number(idRaw);
  if (!idRaw || Number.isNaN(id)) return res.status(400).send("Invalid id");

  const auth = req.headers.authorization ?? "";

  if (req.method === "GET") {
    const r = await axios.get(`${base}/petition/comment/${id}`, {
      headers: { authorization: auth, cookie: req.headers.cookie ?? "" },
      validateStatus: () => true,
    });
    return res.status(r.status).json(r.data ?? []);
  }

  if (req.method === "DELETE") {
    const r = await axios.delete(`${base}/petition/comment/${id}`, { 
      headers: { authorization: auth, cookie: req.headers.cookie ?? "" }, 
      validateStatus: () => true,
    });
    return res.status(r.status).json(r.data ?? null);
  }

  res.setHeader("Allow", "GET, DELETE");
  return res.status(405).end();
}
