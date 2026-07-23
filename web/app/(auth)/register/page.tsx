"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { GuestOnly } from "@/components/auth/GuestOnly";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: { username: "", email: "", password: "", confirm: "" },
  });

  async function submit(values: RegisterFormValues) {
    setError("");
    try {
      const result = await auth.register(values.username, values.email, values.password);
      sessionStorage.setItem("foodirecipe.email", result.email);
      sessionStorage.setItem("foodirecipe.auth-flow", "register");
      if (result.developmentOtp) sessionStorage.setItem("foodirecipe.otp", result.developmentOtp);
      toast.success("Tài khoản đã được tạo", { description: result.developmentOtp ? `OTP development: ${result.developmentOtp}` : "Vui lòng xác minh email bằng OTP." });
      router.push(`/verify-otp?email=${encodeURIComponent(result.email)}`);
    }
    catch (error) { toast.error("Không thể tạo tài khoản", { description: error instanceof Error ? error.message : "Vui lòng thử lại." }); setError(error instanceof Error ? error.message : "Không thể tạo tài khoản"); }
  }

  return <GuestOnly><AuthCard title="Tạo tài khoản mới" description="Tham gia cộng đồng FoodiRecipe hôm nay." footer={<>Đã có tài khoản? <Link className="font-semibold text-orange-600 hover:underline" href="/login">Đăng nhập</Link></>}>
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <AuthField id="username" label="Tên người dùng" placeholder="chef-linh" error={errors.username?.message} {...register("username")} />
      <AuthField id="email" label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
      <AuthField id="password" label="Mật khẩu" type="password" placeholder="Ít nhất 8 ký tự" error={errors.password?.message} {...register("password")} />
      <AuthField id="confirm" label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" error={errors.confirm?.message} {...register("confirm")} />
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="h-11 w-full bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>{isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</Button>
    </form>
  </AuthCard></GuestOnly>;
}
