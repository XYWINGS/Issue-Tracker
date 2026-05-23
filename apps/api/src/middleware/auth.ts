import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { authCookieName } from "../utils/cookies.js";
import { HttpError } from "../utils/httpError.js";

type IssueTrackerJwtPayload = JwtPayload & {
  sub: string;
};

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const bearer = req.header("authorization");
    const bearerToken = bearer?.startsWith("Bearer ") ? bearer.slice(7) : undefined;
    const token = req.cookies?.[authCookieName] ?? bearerToken;

    if (!token) {
      throw new HttpError(401, "Authentication required.");
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as IssueTrackerJwtPayload;
    const user = await User.findById(payload.sub).select("_id name email");

    if (!user) {
      throw new HttpError(401, "Authentication required.");
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    };
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, "Authentication required."));
  }
};
