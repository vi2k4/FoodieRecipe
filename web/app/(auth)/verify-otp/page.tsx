"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { verifyOtpSchema, type VerifyOtpFormValues } from "@/lib/validations/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [flow, setFlow] = useState<"register" | "reset">("register");
  const [resending, setResending] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<VerifyOtpFormValues>({ resolver: zodResolver(verifyOtpSchema as any), defaultValues: { email: params.get("email") || "", otp: "" } });

  useEffect(() => {
    setFlow(sessionStorage.getItem("foodirecipe.auth-flow") === "reset" ? "reset" : "register");
  }, []);

  async function resendCode() {
    setError(""); setResending(true);
    try {
      const result = await auth.resendVerification(watch("email"));
      if (result.developmentOtp) sessionStorage.setItem("foodirecipe.otp", result.developmentOtp);
      toast.success("Đã gửi lại mã OTP", { description: result.developmentOtp ? `OTP development: ${result.developmentOtp}` : result.message });
    } catch (error) {
      toast.error("Không thể gửi lại mã OTP", { description: error instanceof Error ? error.message : "Vui lòng thử lại." });
      setError(error instanceof Error ? error.message : "Không thể gửi lại mã OTP");
    } finally { setResending(false); }
  }

  async function submit(values: VerifyOtpFormValues) {
    setError("");
    try {
      await auth.verifyOtp(values.email, values.otp, flow === "reset" ? "reset" : "register");
      toast.success("Xác minh OTP thành công");
      sessionStorage.setItem("foodirecipe.email", values.email);
      sessionStorage.setItem("foodirecipe.otp", values.otp);
      if (flow === "register") {
        sessionStorage.removeItem("foodirecipe.auth-flow");
        sessionStorage.removeItem("foodirecipe.otp");
        router.push("/login");
      } else {
        router.push("/reset-password");
      }
    }
    catch (error) { toast.error("Xác minh OTP thất bại", { description: error instanceof Error ? error.message : "Mã OTP không hợp lệ." }); setError(error instanceof Error ? error.message : "Mã OTP không hợp lệ"); }
  }

  return <AuthCard title="Xác minh OTP" description="Nhập mã 6 chữ số đã được gửi đến email của bạn." footer={flow === "register" ? <button type="button" onClick={resendCode} disabled={resending} className="font-semibold text-orange-600 hover:underline disabled:opacity-50">{resending ? "Đang gửi lại..." : "Gửi lại mã xác minh"}</button> : <Link className="font-semibold text-orange-600 hover:underline" href="/forgot-password">Gửi lại mã</Link>}>
    <form className="space-y-5" onSubmit={handleSubmit(submit)} noValidate>
      <AuthField id="email" label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
      <AuthField id="otp" label="Mã OTP" inputMode="numeric" maxLength={6} placeholder="000000" error={errors.otp?.message} {...register("otp", { onChange: (event) => setValue("otp", event.target.value.replace(/\D/g, ""), { shouldValidate: true }) })} />
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="h-11 w-full bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>{isSubmitting ? "Đang xác minh..." : "Xác minh mã"}</Button>
    </form>
  </AuthCard>;
}
