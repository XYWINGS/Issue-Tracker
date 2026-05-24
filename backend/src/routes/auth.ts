import type { AuthResponse } from "../domain.js";
import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { authenticate } from "../middleware/auth.js";
import { User, type UserDocument } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clearAuthCookie, setAuthCookie } from "../utils/cookies.js";
import { HttpError } from "../utils/httpError.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128)
});

function serializeUser(user: Pick<UserDocument, "_id" | "name" | "email">): AuthResponse {
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    }
  };
}

function signToken(user: Pick<UserDocument, "_id" | "email" | "name">) {
  const signOptions: SignOptions = {
    subject: user._id.toString(),
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };

  return jwt.sign(
    {
      email: user.email,
      name: user.name
    },
    env.JWT_SECRET,
    signOptions
  );
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const email = input.email.toLowerCase();
    const existingUser = await User.findOne({ email }).select("_id");

    if (existingUser) {
      throw new HttpError(409, "An account with that email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({
      name: input.name,
      email,
      passwordHash
    });

    setAuthCookie(res, signToken(user));
    res.status(201).json(serializeUser(user));
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await User.findOne({ email: input.email.toLowerCase() }).select(
      "+passwordHash name email"
    );

    if (!user) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new HttpError(401, "Invalid email or password.");
    }

    setAuthCookie(res, signToken(user));
    res.json(serializeUser(user));
  })
);

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.status(204).send();
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

export { router as authRouter };
