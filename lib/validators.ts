import { z } from "zod";

export const searchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  genre: z.string().trim().optional(),
  engine: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  mature: z.enum(["all", "adult"]).optional(),
  sort: z.enum(["trending", "rating", "updated", "popular"]).optional()
});

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Tên người dùng cần ít nhất 3 ký tự")
    .max(24, "Tên người dùng tối đa 24 ký tự")
    .regex(/^[a-z0-9][a-z0-9_-]*$/, "Tên người dùng chỉ dùng chữ không dấu, số, gạch dưới hoặc gạch ngang"),
  password: z
    .string()
    .min(8, "Mật khẩu cần tối thiểu 8 ký tự")
    .max(128)
    .regex(/[a-z]/, "Mật khẩu cần có chữ thường")
    .regex(/[A-Z]/, "Mật khẩu cần có chữ hoa")
    .regex(/[0-9]/, "Mật khẩu cần có số"),
  rememberMe: z.boolean().optional()
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email()
});

export const commentSchema = z.object({
  gameSlug: z.string().optional(),
  postSlug: z.string().optional(),
  body: z.string().min(3).max(1200),
  parentId: z.string().optional()
});

export const reviewSchema = z.object({
  gameSlug: z.string(),
  rating: z.number().min(1).max(10),
  title: z.string().max(80).optional(),
  body: z.string().min(20).max(2000)
});
