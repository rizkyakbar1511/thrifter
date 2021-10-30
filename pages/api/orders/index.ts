import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import db from "@utils/dbConnection";
import Order from "models/Order";
import { onError } from "@utils/helper";
import { isAuth } from "@utils/auth";

type CustomApiRequest = NextApiRequest & { user: { _id: string } };

const handler = nc<CustomApiRequest, NextApiResponse>({ onError });

handler.use(isAuth);

handler.post(async (req, res) => {
  await db.connect();
  const newOrder = new Order({ ...req.body, user: req.user._id });
  const order = await newOrder.save();
  res.status(201).send(order);
});

export default handler;
