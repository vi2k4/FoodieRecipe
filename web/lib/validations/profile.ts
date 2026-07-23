import { z } from "zod";

export const profileSchema = z.object({
  username: z.string().trim().min(3, "Tên người dùng phải có ít nhất 3 ký tự").max(50, "Tên người dùng quá dài"),
  bio: z.string().max(500, "Giới thiệu tối đa 500 ký tự"),
  avatarUrl: z.union([
    z.literal(""),
    z.string().url("Ảnh đại diện không hợp lệ"),
    z.string().regex(/^data:image\/(jpeg|png|webp|gif);base64,/, "Ảnh đại diện không hợp lệ"),
  ]),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
