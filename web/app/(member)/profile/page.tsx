/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/incompatible-library */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Camera, CheckCircle2, ChefHat, Heart, ImagePlus, Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth, type AuthUser } from "@/lib/auth";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { toast } from "sonner";

const cardClass = "rounded-3xl border-stone-200 bg-white shadow-[0_12px_40px_-24px_rgba(120,53,15,0.35)]";

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema as any), defaultValues: { username: "", bio: "", avatarUrl: "" } });

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        await auth.bootstrap();
        const profile = await auth.getProfile();
        if (mounted && profile) { setUser(profile); reset({ username: profile.username, bio: profile.bio || "", avatarUrl: profile.avatarUrl || "" }); }
      } catch (error) { toast.error("Không thể tải hồ sơ", { description: error instanceof Error ? error.message : "Vui lòng đăng nhập lại." }); }
      finally { if (mounted) setLoading(false); }
    }
    loadProfile();
    return () => { mounted = false; };
  }, [reset]);

  async function submit(values: ProfileFormValues) {
    try {
      const updated = await auth.updateProfile(values, selectedFile || undefined);
      setUser(updated); reset({ username: updated.username, bio: updated.bio || "", avatarUrl: updated.avatarUrl || "" }); setSelectedFile(null); toast.success("Đã cập nhật hồ sơ");
    } catch (error) { toast.error("Cập nhật thất bại", { description: error instanceof Error ? error.message : "Vui lòng thử lại." }); }
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) return toast.error("Vui lòng nhập đầy đủ thông tin mật khẩu");
    if (newPassword.length < 8) return toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
    if (newPassword !== confirmPassword) return toast.error("Mật khẩu xác nhận không khớp");
    try { setChangingPassword(true); await auth.changePassword(currentPassword, newPassword); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setPasswordOpen(false); toast.success("Đổi mật khẩu thành công", { description: "Các phiên đăng nhập khác đã được đăng xuất." }); }
    catch (error) { toast.error("Đổi mật khẩu thất bại", { description: error instanceof Error ? error.message : "Vui lòng thử lại." }); }
    finally { setChangingPassword(false); }
  }

  function selectAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("File không hợp lệ", { description: "Vui lòng chọn file ảnh PNG, JPG, WEBP hoặc GIF." }); event.target.value = ""; return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Ảnh quá lớn", { description: "Ảnh đại diện không được lớn hơn 2MB." }); event.target.value = ""; return; }
    const reader = new FileReader(); reader.onload = () => { setValue("avatarUrl", String(reader.result || ""), { shouldDirty: true, shouldValidate: true }); setSelectedFile(file); }; reader.readAsDataURL(file);
  }

  function closePasswordDialog(open: boolean) { setPasswordOpen(open); if (!open && !changingPassword) setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }

  if (loading) return <main className="grid min-h-[calc(100vh-9rem)] place-items-center bg-[#fffaf5]"><div className="flex flex-col items-center gap-3 text-stone-500"><Loader2 className="size-8 animate-spin text-orange-500" /><p className="text-sm">Đang tải hồ sơ của bạn...</p></div></main>;
  if (!user) return <main className="grid min-h-[calc(100vh-9rem)] place-items-center bg-[#fffaf5] px-5"><Card className={`${cardClass} max-w-md text-center`}><CardContent className="p-8"><UserRound className="mx-auto size-12 text-orange-500" /><h1 className="mt-4 text-xl font-bold">Bạn chưa đăng nhập</h1><p className="mt-2 text-sm text-stone-500">Đăng nhập để xem và chỉnh sửa hồ sơ của bạn.</p><Link href="/login" className="mt-6 inline-flex h-10 items-center rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600">Đăng nhập</Link></CardContent></Card></main>;

  const initials = user.username.slice(0, 2).toUpperCase();
  const count = (user as any)?._count || {};
  return (
    <main className="min-h-[calc(100vh-9rem)] bg-[#fffaf5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-4"><div><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-orange-600"><Sparkles className="size-4" /> Khu vực cá nhân</div><h1 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">Hồ sơ của bạn</h1><p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">Giữ thông tin của bạn luôn mới để cộng đồng FoodiRecipe hiểu bạn hơn.</p></div><ChefHat className="hidden size-14 text-orange-200 sm:block" /></div>
        <div className="grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <Card className={`${cardClass} overflow-hidden`}><div className="relative h-28 overflow-hidden bg-[linear-gradient(135deg,#f97316,#fb923c_55%,#facc15)]"><div className="absolute -right-8 -top-12 size-40 rounded-full border-[20px] border-white" /><div className="absolute -bottom-14 -left-8 size-32 rounded-full border-[16px] border-white" /></div><CardContent className="relative px-6 pb-6"><Avatar className="-mt-14 size-28 border-4 border-white bg-orange-100 text-3xl font-bold text-orange-600 shadow-lg"><AvatarImage src={watch("avatarUrl") || user.avatarUrl || undefined} alt={user.username} /><AvatarFallback>{initials}</AvatarFallback></Avatar><h2 className="mt-4 text-xl font-black text-stone-900">{user.username}</h2><p className="mt-1 truncate text-sm text-stone-500">{user.email}</p><div className="mt-4 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><CheckCircle2 className="size-3.5" /> Đang hoạt động</span><span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold capitalize text-orange-700"><ShieldCheck className="size-3.5" /> {user.role.toLowerCase()}</span></div><div className="mt-6 grid grid-cols-2 divide-x divide-orange-200 rounded-2xl border border-orange-100 bg-orange-50 py-3 text-center"><div><p className="text-xl font-black text-stone-900">{count.followers || 0}</p><p className="mt-0.5 text-[11px] font-semibold text-stone-500">Người theo dõi</p></div><div><p className="text-xl font-black text-stone-900">{count.following || 0}</p><p className="mt-0.5 text-[11px] font-semibold text-stone-500">Đang theo dõi</p></div></div><div className="mt-5 space-y-3 border-t border-stone-100 pt-5 text-sm text-stone-600"><div className="flex items-center gap-3"><Mail className="size-4 text-orange-500" /><span className="truncate">{user.email}</span></div><div className="flex items-center gap-3"><Camera className="size-4 text-orange-500" /><span>{user.avatarUrl ? "Đã cập nhật ảnh đại diện" : "Chưa có ảnh đại diện"}</span></div></div></CardContent></Card>
            <Card className={cardClass}><CardContent className="space-y-1 p-3"><Link href="/my-recipes" className="group flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-bold text-stone-700 hover:bg-orange-50 hover:text-orange-600"><span className="flex items-center gap-3"><ChefHat className="size-4 text-orange-500" /> Công thức của tôi</span><ArrowRight className="size-4 text-stone-300 transition-transform group-hover:translate-x-1" /></Link><Link href="/favorites" className="group flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-bold text-stone-700 hover:bg-red-50 hover:text-red-600"><span className="flex items-center gap-3"><Heart className="size-4 fill-red-500 text-red-500" /> Món ăn yêu thích</span><ArrowRight className="size-4 text-stone-300 transition-transform group-hover:translate-x-1" /></Link></CardContent></Card>
            <Card className={cardClass}><CardContent className="flex items-center justify-between gap-4 p-5"><div><div className="flex items-center gap-2 text-sm font-bold text-stone-800"><LockKeyhole className="size-4 text-orange-500" /> Bảo mật tài khoản</div><p className="mt-1 text-xs leading-5 text-stone-500">Đổi mật khẩu để giữ tài khoản an toàn.</p></div><Button type="button" variant="outline" className="shrink-0 rounded-xl border-stone-200 bg-white text-xs font-bold hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600" onClick={() => setPasswordOpen(true)}>Đổi mật khẩu</Button></CardContent></Card>
          </aside>
          <Card className={cardClass}><CardHeader className="border-b border-stone-100 px-6 py-6 sm:px-8"><CardTitle className="text-xl">Thông tin tài khoản</CardTitle><CardDescription>Hãy chia sẻ một chút về bạn và niềm yêu thích nấu ăn.</CardDescription></CardHeader><CardContent className="px-6 py-6 sm:px-8 sm:py-8"><form className="space-y-7" onSubmit={handleSubmit(submit)} noValidate><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="username">Tên người dùng</Label><Input id="username" className="h-11 rounded-xl" {...register("username")} aria-invalid={Boolean(errors.username)} />{errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}</div><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" className="h-11 rounded-xl bg-stone-50 text-stone-500" value={user.email} disabled /><p className="text-xs text-stone-400">Email không thể chỉnh sửa.</p></div></div><div className="space-y-2"><Label htmlFor="avatarFile">Ảnh đại diện</Label><label htmlFor="avatarFile" className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-4 transition hover:border-orange-400 hover:bg-orange-50"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm"><ImagePlus className="size-5 transition group-hover:scale-110" /></span><span><span className="block truncate text-sm font-bold text-stone-700">{selectedFile?.name || "Chọn ảnh từ máy tính"}</span><span className="mt-1 block text-xs text-stone-400">PNG, JPG, WEBP hoặc GIF · tối đa 2MB</span></span></label><input id="avatarFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={selectAvatar} />{errors.avatarUrl && <p className="text-xs text-red-600">{errors.avatarUrl.message}</p>}</div><div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="bio">Giới thiệu</Label><span className="text-xs text-stone-400">Tối đa 500 ký tự</span></div><Textarea id="bio" rows={6} className="resize-none rounded-2xl" placeholder="Chia sẻ một chút về bạn và niềm yêu thích nấu ăn..." {...register("bio")} aria-invalid={Boolean(errors.bio)} />{errors.bio && <p className="text-xs text-red-600">{errors.bio.message}</p>}</div><div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:justify-end"><Button type="button" variant="outline" className="rounded-xl border-stone-200" onClick={() => { reset(); setSelectedFile(null); }} disabled={!isDirty}>Hủy thay đổi</Button><Button type="submit" className="rounded-xl bg-orange-500 px-6 hover:bg-orange-600" disabled={isSubmitting || !isDirty}>{isSubmitting ? <><Loader2 className="mr-2 size-4 animate-spin" /> Đang lưu...</> : "Lưu thay đổi"}</Button></div></form></CardContent></Card>
        </div>
      </div>
      <Dialog open={passwordOpen} onOpenChange={closePasswordDialog}><DialogContent className="max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-0 shadow-[0_24px_80px_-24px_rgba(28,25,23,0.35)] ring-0"><DialogHeader className="border-b-0 bg-white px-6 pb-2 pt-6 pr-12 sm:px-7"><div className="flex items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><LockKeyhole className="size-5" /></div><DialogTitle className="text-xl font-black text-stone-900">Đổi mật khẩu</DialogTitle></div><DialogDescription className="mt-3 max-w-sm leading-5 text-stone-500">Dùng mật khẩu mới để giữ tài khoản FoodiRecipe an toàn hơn.</DialogDescription></DialogHeader><form className="space-y-4 bg-white px-6 pb-6 pt-4 sm:px-7" onSubmit={submitPassword}><div className="space-y-1.5"><Label htmlFor="currentPassword" className="text-sm font-semibold text-stone-700">Mật khẩu hiện tại</Label><Input id="currentPassword" type="password" autoComplete="current-password" className="h-11 rounded-2xl border-stone-300 focus-visible:border-orange-500 focus-visible:ring-0 focus-visible:ring-offset-0" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))} /></div><div className="space-y-1.5"><Label htmlFor="newPassword" className="text-sm font-semibold text-stone-700">Mật khẩu mới</Label><Input id="newPassword" type="password" autoComplete="new-password" className="h-11 rounded-2xl border-stone-300 focus-visible:border-orange-500 focus-visible:ring-0 focus-visible:ring-offset-0" placeholder="Ít nhất 8 ký tự" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))} /></div><div className="space-y-1.5"><Label htmlFor="confirmPassword" className="text-sm font-semibold text-stone-700">Xác nhận mật khẩu mới</Label><Input id="confirmPassword" type="password" autoComplete="new-password" className="h-11 rounded-2xl border-stone-300 focus-visible:border-orange-500 focus-visible:ring-0 focus-visible:ring-offset-0" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} /></div><DialogFooter className="mx-0 mb-0 mt-2 rounded-b-2xl border-t border-stone-200 bg-white px-0 pb-0 pt-4"><DialogClose render={<Button type="button" variant="outline" className="rounded-2xl border-stone-200 bg-white px-4" />}><X className="mr-2 size-4" /> Hủy</DialogClose><Button type="submit" className="rounded-2xl bg-orange-500 px-4 font-semibold text-white hover:bg-orange-600" disabled={changingPassword}>{changingPassword ? <><Loader2 className="mr-2 size-4 animate-spin" /> Đang cập nhật...</> : "Cập nhật mật khẩu"}</Button></DialogFooter></form></DialogContent></Dialog>
    </main>
  );
}
