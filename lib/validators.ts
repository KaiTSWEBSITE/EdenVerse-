import { z } from "zod";

export const captchaSchema = z.object({
  captchaAnswer: z.string().trim().max(64).optional(),
  captchaToken: z.string().trim().max(4096).optional()
});

export const searchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  genre: z.string().trim().optional(),
  engine: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  mature: z.enum(["all", "adult"]).optional(),
  sort: z.enum(["trending", "rating", "updated", "popular"]).optional()
});

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[0-9]/, "Password must include at least one number"),
  ...captchaSchema.shape,
  rememberMe: z.boolean().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  ...captchaSchema.shape,
  rememberMe: z.boolean().optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  ...captchaSchema.shape
});

export const commentSchema = z.object({
  gameSlug: z.string().optional(),
  postSlug: z.string().optional(),
  body: z.string().min(3).max(1200),
  ...captchaSchema.shape,
  parentId: z.string().optional()
});

export const reviewSchema = z.object({
  gameSlug: z.string(),
  rating: z.number().min(1).max(10),
  title: z.string().max(80).optional(),
  body: z.string().min(20).max(2000),
  ...captchaSchema.shape
});
