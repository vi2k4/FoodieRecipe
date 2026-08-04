"use client";

import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  MessageCircle,
  Heart,
  Flag,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getDashboard, getStatistics } from "@/lib/admin-api";
import { toast } from "sonner";

type Stats = {
  totalUsers: number;
  totalRecipes: number;
  totalComments: number;
  totalLikes: number;
  totalReports: number;
  totalAiGenerations: number;
};

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
};

function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: bg }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {value.toLocaleString("vi-VN")}
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [highlighted, setHighlighted] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getStatistics()])
      .then(([dash, stats]) => {
        setStats(dash.stats);
        setHighlighted(dash.highlightedRecipes || []);
        setPendingReports(dash.pendingReports || []);
        setChartData(stats);
      })
      .catch(() => toast.error("Không thể tải dữ liệu dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "Tổng người dùng",
          value: stats.totalUsers,
          icon: Users,
          color: "#f97316",
          bg: "#fff7ed",
        },
        {
          label: "Tổng công thức",
          value: stats.totalRecipes,
          icon: BookOpen,
          color: "#3b82f6",
          bg: "#eff6ff",
        },
        {
          label: "Tổng bình luận",
          value: stats.totalComments,
          icon: MessageCircle,
          color: "#8b5cf6",
          bg: "#f5f3ff",
        },
        {
          label: "Tổng lượt thích",
          value: stats.totalLikes,
          icon: Heart,
          color: "#ec4899",
          bg: "#fdf2f8",
        },
        {
          label: "Tổng báo cáo",
          value: stats.totalReports,
          icon: Flag,
          color: "#dc2626",
          bg: "#fef2f2",
        },
        {
          label: "Lượt dùng AI",
          value: stats.totalAiGenerations,
          icon: Sparkles,
          color: "#059669",
          bg: "#ecfdf5",
        },
      ]
    : [];

  if (loading) {
    return (
      <div>
        <AdminHeader title="Dashboard" subtitle="Tổng quan hệ thống" />
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl"
                style={{ backgroundColor: "#f5f5f4" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Dashboard" subtitle="Tổng quan hệ thống FoodiRecipe" />
      <div className="p-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Chart */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" style={{ color: "var(--primary)" }} />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Tăng trưởng 7 ngày qua
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRecipes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#78716c" }}
                tickFormatter={(v: any) => {
                  if (typeof v !== 'string') return v;
                  const parts = v.split("-");
                  return `${parts[2]}/${parts[1]}`;
                }}
              />
              <YAxis tick={{ fontSize: 11, fill: "#78716c" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #fed7aa",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                labelFormatter={(v: any) => {
                  if (typeof v !== 'string') return v;
                  const parts = v.split("-");
                  return `Ngày ${parts[2]}/${parts[1]}`;
                }}
              />
              <Legend
                formatter={(value) => (value === "users" ? "Người dùng mới" : "Công thức mới")}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#colorUsers)"
                dot={{ fill: "#f97316", r: 3 }}
              />
              <Area
                type="monotone"
                dataKey="recipes"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorRecipes)"
                dot={{ fill: "#3b82f6", r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Highlighted Recipes */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h2 className="mb-4 flex items-center gap-2 font-semibold" style={{ color: "var(--text-primary)" }}>
              <BookOpen className="h-4 w-4" style={{ color: "var(--primary)" }} />
              Công thức nổi bật
            </h2>
            {highlighted.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Chưa có công thức nào
              </p>
            ) : (
              <ul className="space-y-3">
                {highlighted.map((r: any, idx: number) => (
                  <li key={r.id} className="flex items-center gap-3">
                    <span
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: idx === 0 ? "#f97316" : idx === 1 ? "#facc15" : "#d6d3d1" }}
                    >
                      {idx + 1}
                    </span>
                    {r.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.thumbnail}
                        alt={r.title}
                        className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {r.title}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {r.author?.username} · {r.likeCount} likes
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pending Reports */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h2 className="mb-4 flex items-center gap-2 font-semibold" style={{ color: "var(--text-primary)" }}>
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Báo cáo chưa xử lý
            </h2>
            {pendingReports.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Không có báo cáo nào cần xử lý
              </p>
            ) : (
              <ul className="space-y-3">
                {pendingReports.map((report: any) => (
                  <li
                    key={report.id}
                    className="flex items-start gap-3 rounded-xl p-3"
                    style={{ backgroundColor: "#fef2f2" }}
                  >
                    <Flag className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {report.recipe?.title}
                      </p>
                      <p className="text-xs" style={{ color: "#dc2626" }}>
                        {report.reason} · bởi {report.reporter?.username}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
