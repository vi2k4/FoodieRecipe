import { z } from "zod";

const emailSchema = z.string().trim().email("Email không hợp lệ").superRefine((value, ctx) => {
  const suggestions: Record<string, string> = {
    "gamil.com": "gmail.com",
    "gmail.co": "gmail.com",
    "yahooo.com": "yahoo.com",
    "yaho.com": "yahoo.com",
    "hotmial.com": "hotmail.com",
    "outlook.co": "outlook.com",
  };
  const domain = value.split("@")[1]?.toLowerCase();
  if (domain && suggestions[domain]) {
    ctx.addIssue({ code: "custom", message: `Có phải bạn muốn dùng ${suggestions[domain]}?` });
  }
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export const registerSchema = z
  .object({
    username: z.string().trim().min(3, "Tên người dùng phải có ít nhất 3 ký tự").max(50, "Tên người dùng quá dài"),
    email: emailSchema,
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirm: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Mật khẩu xác nhận không khớp",
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/, "OTP phải gồm 6 chữ số"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirm: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Mật khẩu xác nhận không khớp",
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
