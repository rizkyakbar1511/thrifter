import type { NextApiRequest, NextApiResponse } from "next";
import { isAuth } from "@utils/auth";
import nc from "next-connect";

const handler = nc<NextApiRequest, NextApiResponse>();

handler.use(isAuth);
handler.get((_, res) => res.send(process.env.PAYPAL_CLIENT_ID || "sb"));

export default handler;
