"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validations/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema as any), defaultValues: { password: "", confirm: "" } });

  async function submit(values: ResetPasswordFormValues) {
    const email = sessionStorage.getItem("foodirecipe.email") || "";
    const otp = sessionStorage.getItem("foodirecipe.otp") || "";
    setError("");
    try { await auth.resetPassword(email, otp, values.password); toast.success("Đổi mật khẩu thành công", { description: "Bạn có thể đăng nhập bằng mật khẩu mới." }); sessionStorage.removeItem("foodirecipe.email"); sessionStorage.removeItem("foodirecipe.otp"); sessionStorage.removeItem("foodirecipe.auth-flow"); router.push("/login"); }
    catch (error) { toast.error("Không thể đổi mật khẩu", { description: error instanceof Error ? error.message : "Vui lòng thử lại." }); setError(error instanceof Error ? error.message : "Không thể đổi mật khẩu"); }
  }

  return <AuthCard title="Tạo mật khẩu mới" description="Mật khẩu mới cần có ít nhất 8 ký tự." footer={<Link className="font-semibold text-orange-600 hover:underline" href="/login">Quay lại đăng nhập</Link>}>
    <form className="space-y-5" onSubmit={handleSubmit(submit)} noValidate>
      <AuthField id="password" label="Mật khẩu mới" type="password" placeholder="Ít nhất 8 ký tự" error={errors.password?.message} {...register("password")} />
      <AuthField id="confirm" label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" error={errors.confirm?.message} {...register("confirm")} />
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="h-11 w-full bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Đổi mật khẩu"}</Button>
    </form>
  </AuthCard>;
}
