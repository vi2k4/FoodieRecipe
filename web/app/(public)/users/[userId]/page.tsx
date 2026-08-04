"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { socialApi } from "@/lib/social-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  User, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Users, 
  Star, 
  Clock, 
  Flame,
  ChevronRight,
  UserCheck,
  UserPlus,
  AlertCircle,
  Eye,
  ThumbsUp
} from "lucide-react";
import { LikeButton } from "@/components/recipes/LikeButton";
import { FollowButton } from "@/components/recipes/FollowButton";

interface Recipe {
  id: number;
  title: string;
  description: string;
  calories: number | null;
  cookTime: number | null;
  difficulty: string;
  thumbnail: string | null;
  averageRating?: number | null;
  viewCount?: number | string | null;
  likeCount?: number | string | null;
  _count?: {
    likes?: number;
  };
}

interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  recipes: Recipe[];
  _count: {
    followers: number;
    following: number;
  };
}

interface FollowUser {
  id: number;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"recipes" | "about" | "followers" | "following">("recipes");

  // Track follow status of users in followers/following list
  const [followedUsers, setFollowedUsers] = useState<Record<number, boolean>>({});

  // Query profile details
  const profileQuery = useQuery<UserProfile>({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      return socialApi.getProfile(userId);
    },
    enabled: !!userId,
  });

  const profile = profileQuery.data;

  // Query followers
  const followersQuery = useQuery<FollowUser[]>({
    queryKey: ["followers", profile?.id],
    queryFn: async () => {
      return socialApi.getFollowers(profile!.id);
    },
    enabled: !!profile?.id,
  });

  // Query following
  const followingQuery = useQuery<FollowUser[]>({
    queryKey: ["following", profile?.id],
    queryFn: async () => {
      return socialApi.getFollowing(profile!.id);
    },
    enabled: !!profile?.id,
  });

  const handleFollowToggle = async () => {
    if (!profile) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    try {
      await socialApi.toggleFollow(profile.id, isFollowing);
    } catch (e) {
      console.error(e);
      setIsFollowing(!nextFollowing);
    }
  };

  const handleToggleFollowUserInList = async (targetId: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const isCurrentlyFollowed = !!followedUsers[targetId];
    setFollowedUsers(prev => ({
      ...prev,
      [targetId]: !isCurrentlyFollowed
    }));

    try {
      await socialApi.toggleFollow(targetId, isCurrentlyFollowed);
    } catch (e) {
      console.error(e);
      setFollowedUsers(prev => ({
        ...prev,
        [targetId]: isCurrentlyFollowed
      }));
    }
  };

  if (profileQuery.isError) {
    return (
      <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center p-4">
        <div className="bg-white border border-red-100 rounded-3xl py-12 px-6 text-center space-y-4 shadow-sm flex flex-col items-center justify-center max-w-md w-full">
          <div className="p-3 bg-red-50 rounded-full border border-red-100 text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-neutral-800">Không tìm thấy người dùng</h3>
            <p className="text-neutral-500 text-sm">
              Tài khoản người dùng này không tồn tại hoặc đã bị vô hiệu hóa khỏi hệ thống.
            </p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors block w-full text-center"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (profileQuery.isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const followers = followersQuery.data || [];
  const following = followingQuery.data || [];

  // Format joined date
  const joinedDate = new Date(profile.createdAt).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#fffaf5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-neutral-500 items-center gap-2">
          <Link href="/" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-800 font-medium">Đầu bếp {profile.fullName}</span>
        </nav>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-[#fed7aa]/50 p-8 shadow-sm mb-8 transition-all hover:shadow-md">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <Avatar className="relative w-32 h-32 border-4 border-white shadow-md">
                <AvatarImage 
                  src={profile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                  className="object-cover"
                />
                <AvatarFallback>{profile.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">{profile.fullName}</h1>
                  <p className="text-orange-600 font-semibold mt-1">@{profile.username}</p>
                </div>
                
                {/* Follow Button */}
                <FollowButton
                  targetUserId={profile.id}
                  targetUsername={profile.username}
                  className="px-6 py-2.5 text-sm font-bold shadow-md"
                />
              </div>

              {/* Bio */}
              <p className="text-neutral-600 leading-relaxed max-w-2xl mb-6 text-sm">
                {profile.bio || "Thành viên yêu thích nấu ăn của cộng đồng FoodiRecipe."}
              </p>

              {/* Stats & Meta info */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-neutral-500 border-t border-neutral-100 pt-6">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span>Việt Nam</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span>Tham gia từ {joinedDate}</span>
                </div>
                <div className="h-4 w-px bg-neutral-200 hidden sm:block"></div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab("followers")}
                    className="text-neutral-600 hover:text-orange-600 font-medium transition-colors"
                  >
                    <strong className="font-bold text-neutral-800 text-sm mr-1">{profile._count?.followers || 0}</strong> người theo dõi
                  </button>
                  <button 
                    onClick={() => setActiveTab("following")}
                    className="text-neutral-600 hover:text-orange-600 font-medium transition-colors"
                  >
                    <strong className="font-bold text-neutral-800 text-sm mr-1">{profile._count?.following || 0}</strong> đang theo dõi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs System */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <TabsList className="flex border-b border-neutral-200 mb-8 gap-6 overflow-x-auto whitespace-nowrap scrollbar-none bg-transparent h-auto p-0 rounded-none justify-start">
            <TabsTrigger
              value="recipes"
              className="flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:text-orange-600 text-neutral-500 hover:text-neutral-700 bg-transparent rounded-none shadow-none p-0"
            >
              <BookOpen className="w-4 h-4" />
              Công thức của tôi ({profile.recipes?.length || 0})
            </TabsTrigger>
            
            <TabsTrigger
              value="followers"
              className="flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:text-orange-600 text-neutral-500 hover:text-neutral-700 bg-transparent rounded-none shadow-none p-0"
            >
              <Users className="w-4 h-4" />
              Người theo dõi ({profile._count?.followers || 0})
            </TabsTrigger>

            <TabsTrigger
              value="following"
              className="flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:text-orange-600 text-neutral-500 hover:text-neutral-700 bg-transparent rounded-none shadow-none p-0"
            >
              <Users className="w-4 h-4" />
              Đang theo dõi ({profile._count?.following || 0})
            </TabsTrigger>

            <TabsTrigger
              value="about"
              className="flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:text-orange-600 text-neutral-500 hover:text-neutral-700 bg-transparent rounded-none shadow-none p-0"
            >
              <User className="w-4 h-4" />
              Thông tin thêm
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="outline-none mt-0">
            {!profile.recipes || profile.recipes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-neutral-100">
                <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">Người dùng này chưa đăng công thức nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {profile.recipes.map((recipe) => (
                  <div 
                    key={recipe.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-[#fed7aa]/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-neutral-50">
                      <img 
                        src={recipe.thumbnail || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80"} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 right-4 bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm hover:bg-orange-700 border-none">
                        {recipe.difficulty === "EASY" ? "Dễ" : recipe.difficulty === "MEDIUM" ? "Vừa" : "Khó"}
                      </Badge>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                          <Link href={`/recipes/${recipe.id}`}>
                            {recipe.title}
                          </Link>
                        </h3>
                        <p className="text-neutral-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center justify-between text-neutral-500 text-xs font-medium border-t border-neutral-50 pt-4 gap-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {recipe.cookTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-neutral-400" />
                              {recipe.cookTime} phút
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                            <Eye className="w-3.5 h-3.5 text-neutral-400" />
                            {Number(recipe.viewCount || 0)}
                          </span>
                          <LikeButton
                            recipeId={recipe.id}
                            initialCount={Number(recipe.likeCount ?? recipe._count?.likes ?? 0)}
                          />
                        </div>
                        <span className="flex items-center gap-1 text-amber-500 font-semibold bg-amber-50 px-2 py-1 rounded-md border border-amber-100/60 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {recipe.averageRating ? Number(recipe.averageRating).toFixed(1) : "5.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="followers" className="outline-none mt-0">
            <div className="space-y-4">
              {followersQuery.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(n => (
                    <div key={n} className="h-20 bg-neutral-200 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : followers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-[#fed7aa]/30 shadow-sm flex flex-col items-center justify-center">
                  <Users className="w-12 h-12 text-neutral-300 mb-4" />
                  <p className="text-neutral-500 font-medium text-sm">Chưa có người theo dõi nào.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {followers.map((u) => (
                    <div 
                      key={u.id}
                      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#fed7aa]/30 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Link href={`/users/${u.id}`} className="flex items-center gap-3 group">
                        <Avatar className="w-12 h-12 border border-neutral-100 group-hover:scale-105 transition-transform">
                          <AvatarImage src={u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} className="object-cover" />
                          <AvatarFallback>{u.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-bold text-neutral-800 group-hover:text-orange-600 transition-colors text-sm">{u.fullName}</h4>
                          <p className="text-xs text-neutral-400 line-clamp-1">@{u.username}</p>
                        </div>
                      </Link>
                      <Button
                        onClick={() => handleToggleFollowUserInList(u.id)}
                        variant={followedUsers[u.id] ? "secondary" : "default"}
                        className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all h-auto ${
                          followedUsers[u.id]
                            ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            : "bg-orange-600 text-white hover:bg-orange-700 hover:scale-105 active:scale-95"
                        }`}
                      >
                        {followedUsers[u.id] ? "Đang theo dõi" : "Theo dõi"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="following" className="outline-none mt-0">
            <div className="space-y-4">
              {followingQuery.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(n => (
                    <div key={n} className="h-20 bg-neutral-200 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : following.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-[#fed7aa]/30 shadow-sm flex flex-col items-center justify-center">
                  <Users className="w-12 h-12 text-neutral-300 mb-4" />
                  <p className="text-neutral-500 font-medium text-sm">Chưa theo dõi người dùng nào.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {following.map((u) => (
                    <div 
                      key={u.id}
                      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#fed7aa]/30 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Link href={`/users/${u.id}`} className="flex items-center gap-3 group">
                        <Avatar className="w-12 h-12 border border-neutral-100 group-hover:scale-105 transition-transform">
                          <AvatarImage src={u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} className="object-cover" />
                          <AvatarFallback>{u.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-bold text-neutral-800 group-hover:text-orange-600 transition-colors text-sm">{u.fullName}</h4>
                          <p className="text-xs text-neutral-400 line-clamp-1">@{u.username}</p>
                        </div>
                      </Link>
                      <Button
                        onClick={() => handleToggleFollowUserInList(u.id)}
                        variant={followedUsers[u.id] ? "secondary" : "default"}
                        className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all h-auto ${
                          followedUsers[u.id]
                            ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            : "bg-orange-600 text-white hover:bg-orange-700 hover:scale-105 active:scale-95"
                        }`}
                      >
                        {followedUsers[u.id] ? "Đang theo dõi" : "Theo dõi"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="about" className="outline-none mt-0">
            <div className="bg-white rounded-3xl border border-[#fed7aa]/30 p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-800 mb-3">Giới thiệu bản thân</h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  {profile.bio || "Thành viên chưa viết lời giới thiệu."}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-neutral-800 mb-3">Phương châm ẩm thực</h3>
                <p className="text-neutral-600 leading-relaxed text-sm italic border-l-4 border-orange-500 pl-4">
                  &ldquo;Nấu ăn không chỉ là việc tạo ra món ăn, mà còn là cách gửi gắm yêu thương và gìn giữ những giá trị văn hóa gia đình.&rdquo;
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
