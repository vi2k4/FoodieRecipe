/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/incompatible-library */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  ChefHat,
  CheckCircle2,
  ChevronRight,
  Heart,
  ImagePlus,
  LockKeyhole,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth, type AuthUser } from "@/lib/auth";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import { toast } from "sonner";

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema as any),
    defaultValues: { username: "", bio: "", avatarUrl: "" },
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        await auth.bootstrap();
        const profile = await auth.getProfile();
        if (mounted && profile) {
          setUser(profile);
          reset({
            username: profile.username,
            bio: profile.bio || "",
            avatarUrl: profile.avatarUrl || "",
          });
        }
      } catch (error) {
        toast.error("Không thể tải hồ sơ", {
          description:
            error instanceof Error ? error.message : "Vui lòng đăng nhập lại.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      mounted = false;
    };
  }, [reset]);

  async function submit(values: ProfileFormValues) {
    try {
      const updated = await auth.updateProfile(values, selectedFile || undefined);
      setUser(updated);
      reset({
        username: updated.username,
        bio: updated.bio || "",
        avatarUrl: updated.avatarUrl || "",
      });
      setSelectedFile(null);
      toast.success("Đã cập nhật hồ sơ");
    } catch (error) {
      toast.error("Cập nhật thất bại", {
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    }
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin mật khẩu");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setChangingPassword(true);
      await auth.changePassword(currentPassword, newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Đổi mật khẩu thành công", {
        description: "Phiên đăng nhập khác đã được đăng xuất. Vui lòng đăng nhập lại khi cần.",
      });
    } catch (error) {
      toast.error("Đổi mật khẩu thất bại", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  function selectAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File không hợp lệ", {
        description: "Vui lòng chọn file ảnh PNG, JPG, WEBP hoặc GIF.",
      });
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh quá lớn", {
        description: "Ảnh đại diện không được lớn hơn 2MB.",
      });
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      setValue("avatarUrl", value, { shouldDirty: true, shouldValidate: true });
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return (
      <main className="grid min-h-[calc(100vh-9rem)] place-items-center bg-[#fffaf5]">
        <Loader2 className="size-8 animate-spin text-orange-500" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-[calc(100vh-9rem)] place-items-center bg-[#fffaf5] px-5">
        <Card className="max-w-md border-orange-100 text-center">
          <CardContent className="p-8">
            <UserRound className="mx-auto size-12 text-orange-500" />
            <h1 className="mt-4 text-xl font-bold">Bạn chưa đăng nhập</h1>
            <p className="mt-2 text-sm text-stone-500">
              Đăng nhập để xem và chỉnh sửa hồ sơ của bạn.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              Đăng nhập
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <main className="min-h-[calc(100vh-9rem)] bg-[#fffaf5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
              Tài khoản
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">
              Hồ sơ cá nhân
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Quản lý thông tin và dấu ấn của bạn trong cộng đồng FoodiRecipe.
            </p>
          </div>
          <ChefHat className="hidden size-12 text-orange-200 sm:block" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-orange-100 shadow-sm">
              <div className="h-32 bg-linear-to-br from-orange-400 via-orange-500 to-amber-400" />
              <CardContent className="relative px-6 pb-6">
                <Avatar
                  // size="lg"
                  className="-mt-16 size-28 border-4 border-white bg-orange-100 text-3xl font-bold text-orange-600 shadow-md"
                >
                  <AvatarImage
                    src={watch("avatarUrl") || user.avatarUrl || undefined}
                    alt={user.username}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-bold text-stone-900">
                  {user.username}
                </h2>
                <p className="mt-1 text-sm text-stone-500">{user.email}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                    <CheckCircle2 className="size-3.5" />
                    Đang hoạt động
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold capitalize text-orange-700">
                    <ShieldCheck className="size-3.5" />
                    {user.role.toLowerCase()}
                  </span>
                </div>

                {/* Followers & Following Stats Counter */}
                <div className="mt-5 flex items-center justify-around rounded-xl bg-orange-50/70 p-3 text-center border border-orange-100/80">
                  <div className="flex-1">
                    <p className="text-lg font-extrabold text-stone-900">{(user as any)?._count?.followers || 0}</p>
                    <p className="text-xs font-semibold text-stone-500">Người theo dõi</p>
                  </div>
                  <div className="h-8 w-px bg-orange-200/60" />
                  <div className="flex-1">
                    <p className="text-lg font-extrabold text-stone-900">{(user as any)?._count?.following || 0}</p>
                    <p className="text-xs font-semibold text-stone-500">Đang theo dõi</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3 border-t border-orange-100 pt-5 text-sm">
                  <div className="flex items-center gap-3 text-stone-600">
                    <Mail className="size-4 text-orange-500" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-600">
                    <Camera className="size-4 text-orange-500" />
                    <span>
                      {user.avatarUrl
                        ? "Đã cập nhật ảnh đại diện"
                        : "Chưa có ảnh đại diện"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-100 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <Link
                  href="/my-recipes"
                  className="flex items-center justify-between text-sm font-semibold text-stone-700 transition-colors hover:text-orange-600"
                >
                  <span className="flex items-center gap-2">
                    <ChefHat className="size-4 text-orange-500" />
                    Công thức của tôi
                  </span>
                  <ChevronRight className="size-4 text-stone-400" />
                </Link>
                <div className="border-t border-orange-100/60 pt-3" />
                <Link
                  href="/favorites"
                  className="flex items-center justify-between text-sm font-semibold text-stone-700 transition-colors hover:text-red-600"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="size-4 text-red-500 fill-red-500" />
                    Món ăn yêu thích
                  </span>
                  <ChevronRight className="size-4 text-stone-400" />
                </Link>
              </CardContent>
            </Card>
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="px-5 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LockKeyhole className="size-5 text-orange-500" />
                  Đổi mật khẩu
                </CardTitle>
                <CardDescription>
                  Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <form className="space-y-4" onSubmit={submitPassword}>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.currentPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={changingPassword}
                  >
                    {changingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className="border-orange-100 shadow-sm">
            <CardHeader className="border-b border-orange-100 px-6 py-5 sm:px-8">
              <CardTitle className="text-xl">Thông tin tài khoản</CardTitle>
              <CardDescription>
                Cập nhật thông tin để mọi người hiểu bạn hơn.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-6 sm:px-8 sm:py-8">
              <form
                className="space-y-6"
                onSubmit={handleSubmit(submit)}
                noValidate
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên người dùng</Label>
                    <Input
                      id="username"
                      className="h-10"
                      {...register("username")}
                      aria-invalid={Boolean(errors.username)}
                    />
                    {errors.username && (
                      <p className="text-xs text-red-600">
                        {errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      className="h-10 bg-stone-50 text-stone-500"
                      value={user.email}
                      disabled
                    />
                    <p className="text-xs text-stone-400">
                      Email không thể chỉnh sửa.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatarFile">Ảnh đại diện</Label>
                  <label
                    htmlFor="avatarFile"
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-orange-200 bg-orange-50/50 p-4 transition-colors hover:border-orange-400 hover:bg-orange-50"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-orange-500 shadow-sm">
                      <ImagePlus className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-stone-700">
                        {selectedFile?.name || "Chọn ảnh từ máy tính"}
                      </span>
                      <span className="mt-1 block text-xs text-stone-400">
                        PNG, JPG, WEBP hoặc GIF · tối đa 2MB
                      </span>
                    </span>
                  </label>
                  <input
                    id="avatarFile"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={selectAvatar}
                  />
                  {errors.avatarUrl && (
                    <p className="text-xs text-red-600">
                      {errors.avatarUrl.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Giới thiệu</Label>
                    <span className="text-xs text-stone-400">
                      Tối đa 500 ký tự
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    rows={5}
                    placeholder="Chia sẻ một chút về bạn và niềm yêu thích nấu ăn..."
                    {...register("bio")}
                    aria-invalid={Boolean(errors.bio)}
                  />
                  {errors.bio && (
                    <p className="text-xs text-red-600">{errors.bio.message}</p>
                  )}
                </div>
                <div className="flex flex-col-reverse gap-3 border-t border-orange-100 pt-6 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-orange-200"
                    onClick={() => {
                      reset();
                      setSelectedFile(null);
                    }}
                    disabled={!isDirty}
                  >
                    Hủy thay đổi
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={isSubmitting || !isDirty}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
