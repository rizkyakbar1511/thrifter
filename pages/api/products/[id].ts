import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import db from "@utils/dbConnection";
import Product from "models/Product";

const handler = nc<NextApiRequest, NextApiResponse>();

handler.get(async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  await db.disconnect();
  res.send(product);
});

export default handler;
