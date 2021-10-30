import createCache from "@emotion/cache";
import { EmotionCache } from "@emotion/utils";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import db from "./dbConnection";

export function createEmotionCache(): EmotionCache {
  return createCache({ key: "css" });
}

export function fixed2Number(num: number): number {
  return Math.round(num * 100 + Number.EPSILON) / 100;
}

export function getError(err: any): string {
  return err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message;
}

export async function onError(err: any, req: NextApiRequest, res: NextApiResponse) {
  await db.disconnect();
  res.status(500).send({ message: err.toString() });
}
