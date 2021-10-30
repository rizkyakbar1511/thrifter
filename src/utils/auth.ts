import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { IUser } from "./types";

type CustomApiRequest = NextApiRequest & { user: {} | undefined };

export const signToken = (user: IUser) =>
  jwt.sign({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });

export const isAuth = (req: CustomApiRequest, res: NextApiResponse, next: any) => {
  const { authorization } = req.headers;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET as string, (err, decode) => {
      if (err) {
        res.status(401).send({ message: "Token is not valid" });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: "Token is not supplied" });
  }
};
