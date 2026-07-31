/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema as any), defaultValues: { email: "" } });

  async function submit(values: ForgotPasswordFormValues) {
    setError("");
    try {
      const result = await auth.forgotPassword(values.email);
      if (result.developmentOtp) sessionStorage.setItem("foodirecipe.otp", result.developmentOtp);
      sessionStorage.setItem("foodirecipe.email", values.email);
      sessionStorage.setItem("foodirecipe.auth-flow", "reset");
      setMessage(result.developmentOtp ? `${result.message} OTP phát triển: ${result.developmentOtp}` : result.message);
      toast.success("Đã gửi mã OTP", { description: result.developmentOtp ? `OTP development: ${result.developmentOtp}` : result.message });
      setTimeout(() => router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`), 900);
    } catch (error) { toast.error("Không thể gửi mã OTP", { description: error instanceof Error ? error.message : "Vui lòng thử lại." }); setError(error instanceof Error ? error.message : "Không thể gửi mã OTP"); }
  }

  return <AuthCard title="Quên mật khẩu?" description="Nhập email để nhận mã OTP khôi phục tài khoản." footer={<Link className="font-semibold text-orange-600 hover:underline" href="/login">Quay lại đăng nhập</Link>}>
    <form className="space-y-5" onSubmit={handleSubmit(submit)} noValidate>
      <AuthField id="email" label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
      {message && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="h-11 w-full bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>{isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}</Button>
    </form>
  </AuthCard>;
}
