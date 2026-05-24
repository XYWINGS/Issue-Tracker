import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";

export const authCookieName = "issue_tracker_token";

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SECURE ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/"
};

export function setAuthCookie(res: Response, token: string) {
  res.cookie(authCookieName, token, authCookieOptions);
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(authCookieName, {
    ...authCookieOptions,
    maxAge: undefined
  });
}
