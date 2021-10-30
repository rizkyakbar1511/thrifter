import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import db from "@utils/dbConnection";
import { data } from "@utils/data";
import User from "@models/User";
import Product from "models/Product";

const handler = nc<NextApiRequest, NextApiResponse>();

handler.get(async (_, res) => {
  await db.connect();
  await User.deleteMany();
  await User.insertMany(data.users);
  await Product.deleteMany();
  await Product.insertMany(data.products);
  await db.disconnect();
  res.send({ message: "seed successfully" });
});

export default handler;
