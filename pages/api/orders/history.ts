import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import db from "@utils/dbConnection";
import Order from "models/Order";
import { onError } from "@utils/helper";
import { isAuth } from "@utils/auth";

type CustomApiRequest = NextApiRequest & { user: { _id: string } };

const handler = nc<CustomApiRequest, NextApiResponse>({ onError });

handler.use(isAuth);

handler.get(async (req, res) => {
  await db.connect();
  const orders = await Order.find({ user: req.user._id });
  res.send(orders);
});

export default handler;
