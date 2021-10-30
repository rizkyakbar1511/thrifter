import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import db from "@utils/dbConnection";
import Product from "models/Product";

const handler = nc<NextApiRequest, NextApiResponse>();

handler.get(async (_, res) => {
  await db.connect();
  const products = await Product.find({});
  await db.disconnect();
  res.send(products);
});

export default handler;
