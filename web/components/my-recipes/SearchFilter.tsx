"use client";

import { History, RotateCcw, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api, type SearchHistoryEntry } from "@/lib/api-client";

interface FilterValues {
  keyword: string;
  categoryId: string;
  visibility: string;
  minCalories: string;
  maxCalories: string;
  minCookTime: string;
  maxCookTime: string;
  sortBy: string;
}

interface Props {
  onSearch?: (filters: FilterValues) => void;
  onReset?: () => void;
  categories?: { id: number | string; name: string; icon?: string }[];
  historyEnabled?: boolean;
}

export default function SearchFilter({
  onSearch,
  onReset,
  categories = [],
  historyEnabled = false,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [visibility, setVisibility] = useState("");
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [minCookTime, setMinCookTime] = useState("");
  const [maxCookTime, setMaxCookTime] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);

  const loadSearchHistory = useCallback(async () => {
    try {
      setSearchHistory(await api.searchHistory.list());
    } catch {
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
    if (!historyEnabled) return;

    let active = true;

    void api.searchHistory
      .list()
      .then((items) => {
        if (active) setSearchHistory(items);
      })
      .catch(() => {
        if (active) setSearchHistory([]);
      });

    return () => {
      active = false;
    };
  }, [historyEnabled]);

  const currentFilters = (nextKeyword = keyword): FilterValues => ({
    keyword: nextKeyword,
    categoryId,
    visibility,
    minCalories,
    maxCalories,
    minCookTime,
    maxCookTime,
    sortBy,
  });

  const handleReset = () => {
    setKeyword("");
    setCategoryId("");
    setVisibility("");
    setMinCalories("");
    setMaxCalories("");
    setMinCookTime("");
    setMaxCookTime("");
    setSortBy("newest");
    onReset?.();
  };

  const handleSearch = () => {
    const normalizedKeyword = keyword.trim();
    onSearch?.(currentFilters(normalizedKeyword));

    if (normalizedKeyword && historyEnabled) {
      void api.searchHistory
        .create(normalizedKeyword)
        .then(loadSearchHistory)
        .catch(() => undefined);
    }
  };

  const applyHistoryKeyword = (historyKeyword: string) => {
    setKeyword(historyKeyword);
    onSearch?.(currentFilters(historyKeyword));
  };

  const removeHistory = async (id: string) => {
    try {
      await api.searchHistory.remove(id);
      setSearchHistory((items) => items.filter((item) => item.id !== id));
    } catch {
      // Không chặn thao tác tìm kiếm nếu API lịch sử tạm thời lỗi.
    }
  };

  const clearHistory = async () => {
    try {
      await api.searchHistory.clear();
      setSearchHistory([]);
    } catch {
      // Không chặn thao tác tìm kiếm nếu API lịch sử tạm thời lỗi.
    }
  };

  const hasActiveFilters =
    keyword ||
    categoryId ||
    visibility ||
    minCalories ||
    maxCalories ||
    minCookTime ||
    maxCookTime ||
    sortBy !== "newest";

  return (
    <div
      className="
        rounded-2xl
        border border-orange-100
        bg-white
        shadow-sm
        p-6
        xl:sticky
        xl:top-6
      "
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>🎯</span> Tìm kiếm nâng cao
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-orange-500 hover:text-orange-600 font-medium"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-5">
        Lọc công thức của bạn theo nhiều điều kiện.
      </p>

      {/* Keyword */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Từ khóa
        </label>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Nhập tên công thức..."
            className="
              w-full
              rounded-xl
              border border-gray-300
              py-3
              pl-10
              pr-3
              outline-none
              transition
              focus:border-orange-500 focus:ring-1 focus:ring-orange-500
            "
          />
        </div>
      </div>

      {searchHistory.length > 0 && (
        <div className="mb-5 rounded-xl border border-orange-100 bg-orange-50/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
              <History size={14} /> Tìm kiếm gần đây
            </span>
            <button
              type="button"
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-red-500"
            >
              <Trash2 size={13} /> Xóa tất cả
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item) => (
              <span
                key={item.id}
                className="inline-flex overflow-hidden rounded-full border border-orange-200 bg-white text-xs text-gray-600"
              >
                <button
                  type="button"
                  onClick={() => applyHistoryKeyword(item.keyword)}
                  className="max-w-36 truncate px-3 py-1.5 hover:bg-orange-100"
                  title={`Tìm kiếm ${item.keyword}`}
                >
                  {item.keyword}
                </button>
                <button
                  type="button"
                  onClick={() => void removeHistory(item.id)}
                  className="border-l border-orange-100 px-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  aria-label={`Xóa ${item.keyword} khỏi lịch sử tìm kiếm`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Danh mục
        </label>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="
            w-full
            rounded-xl
            border border-gray-300
            p-3
            outline-none
            transition
            focus:border-orange-500 focus:ring-1 focus:ring-orange-500
            bg-white
          "
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={String(cat.id)} value={String(cat.id)}>
              {cat.icon || "📂"} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Visibility */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Quyền riêng tư
        </label>

        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="
            w-full
            rounded-xl
            border border-gray-300
            p-3
            outline-none
            transition
            focus:border-orange-500 focus:ring-1 focus:ring-orange-500
            bg-white
          "
        >
          <option value="">Tất cả</option>
          <option value="PUBLIC">🌍 Công khai</option>
          <option value="PRIVATE">🔒 Riêng tư</option>
        </select>
      </div>

      {/* Calories */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Lượng calo (kcal)
        </label>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={minCalories}
            onChange={(e) => setMinCalories(e.target.value)}
            placeholder="Tối thiểu"
            className="
              rounded-xl
              border border-gray-300
              p-3
              outline-none
              transition
              focus:border-orange-500 focus:ring-1 focus:ring-orange-500
            "
          />

          <input
            type="number"
            value={maxCalories}
            onChange={(e) => setMaxCalories(e.target.value)}
            placeholder="Tối đa"
            className="
              rounded-xl
              border border-gray-300
              p-3
              outline-none
              transition
              focus:border-orange-500 focus:ring-1 focus:ring-orange-500
            "
          />
        </div>
      </div>

      {/* Cooking Time */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Thời gian nấu (phút)
        </label>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={minCookTime}
            onChange={(e) => setMinCookTime(e.target.value)}
            placeholder="Tối thiểu"
            className="
              rounded-xl
              border border-gray-300
              p-3
              outline-none
              transition
              focus:border-orange-500 focus:ring-1 focus:ring-orange-500
            "
          />

          <input
            type="number"
            value={maxCookTime}
            onChange={(e) => setMaxCookTime(e.target.value)}
            placeholder="Tối đa"
            className="
              rounded-xl
              border border-gray-300
              p-3
              outline-none
              transition
              focus:border-orange-500 focus:ring-1 focus:ring-orange-500
            "
          />
        </div>
      </div>

      {/* Sort */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Sắp xếp theo
        </label>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="
            w-full
            rounded-xl
            border border-gray-300
            p-3
            outline-none
            transition
            focus:border-orange-500 focus:ring-1 focus:ring-orange-500
            bg-white
          "
        >
          <option value="newest">🆕 Mới nhất</option>
          <option value="oldest">📅 Cũ nhất</option>
          <option value="cookTime">⏱️ Thời gian nấu</option>
          <option value="calories">🔥 Lượng calo</option>
          <option value="name">📝 Tên món (A-Z)</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="mt-6 space-y-3">
        <button
          onClick={handleSearch}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-orange-500
            py-3.5
            font-medium
            text-white
            transition
            hover:bg-orange-600
            hover:shadow-md hover:shadow-orange-500/25
          "
        >
          <Search size={18} />
          Tìm kiếm
        </button>

        <button
          onClick={handleReset}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border border-gray-300
            py-3.5
            font-medium
            transition
            hover:bg-gray-50
          "
        >
          <RotateCcw size={18} />
          Đặt lại
        </button>
      </div>
    </div>
  );
}
