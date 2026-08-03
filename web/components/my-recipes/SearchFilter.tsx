"use client";

import { History, RotateCcw, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api, type SearchHistoryEntry } from "@/lib/api-client";
import { CalendarBlank, CaretDown, Clock, CookingPot, Fire, FunnelSimple, Globe, LockKey, SortAscending, TextAa } from "@phosphor-icons/react";

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
  const [sortOpen, setSortOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
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
          <span className="text-orange-500">⌕</span> Tìm kiếm nâng cao
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
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <SortAscending size={18} weight="duotone" className="text-orange-500" aria-hidden="true" />
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
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FunnelSimple size={18} weight="duotone" className="text-orange-500" aria-hidden="true" />
          Danh mục
        </label>

        <div className="relative mb-2">
          <button
            type="button"
            onClick={() => setCategoryOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={categoryOpen}
            className="flex w-full items-center justify-between rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50/70 to-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm transition hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <span className="flex items-center gap-2">
              <CookingPot size={19} weight="duotone" className="text-orange-500" aria-hidden="true" />
              <span>{categoryId ? categories.find((cat) => String(cat.id) === categoryId)?.name || "Danh mục" : "Tất cả danh mục"}</span>
            </span>
            <CaretDown size={18} weight="bold" className={`text-orange-500 transition-transform ${categoryOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {categoryOpen && (
            <div role="listbox" aria-label="Danh mục" className="absolute inset-x-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-xl border border-orange-100 bg-white p-1.5 shadow-xl shadow-orange-500/10">
              {[["", "Tất cả danh mục"], ...categories.map((cat) => [String(cat.id), cat.name])].map(([value, label]) => (
                <button
                  key={value || "all"}
                  type="button"
                  role="option"
                  aria-selected={categoryId === value}
                  onClick={() => { setCategoryId(value); setCategoryOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${categoryId === value ? "bg-orange-50 font-semibold text-orange-700" : "text-gray-600 hover:bg-orange-50/60 hover:text-orange-700"}`}
                >
                  <CookingPot size={18} weight="duotone" className="text-orange-500" />
                  <span>{label}</span>
                  {categoryId === value && <span className="ml-auto text-orange-500">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="hidden
            w-full
            rounded-xl
            border border-orange-100
            bg-gradient-to-r from-orange-50/70 to-white
            px-4 py-3 pr-10
            text-sm font-medium text-gray-700 shadow-sm
            outline-none
            transition
            hover:border-orange-300
            focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
          "
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={String(cat.id)} value={String(cat.id)}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Visibility */}
      <div className="mb-4">
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          {visibility === "PRIVATE" ? <LockKey size={18} weight="duotone" className="text-slate-500" aria-hidden="true" /> : <Globe size={18} weight="duotone" className="text-emerald-500" aria-hidden="true" />}
          Quyền riêng tư
        </label>

        <div className="relative mb-2">
          <button
            type="button"
            onClick={() => setVisibilityOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={visibilityOpen}
            className="flex w-full items-center justify-between rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50/70 to-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm transition hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <span className="flex items-center gap-2">
              {visibility === "PRIVATE" ? <LockKey size={19} weight="duotone" className="text-slate-500" /> : <Globe size={19} weight="duotone" className="text-emerald-500" />}
              <span>{visibility === "PUBLIC" ? "Công khai" : visibility === "PRIVATE" ? "Riêng tư" : "Tất cả"}</span>
            </span>
            <CaretDown size={18} weight="bold" className={`text-orange-500 transition-transform ${visibilityOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {visibilityOpen && (
            <div role="listbox" aria-label="Quyền riêng tư" className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-orange-100 bg-white p-1.5 shadow-xl shadow-orange-500/10">
              {[["", "Tất cả"], ["PUBLIC", "Công khai"], ["PRIVATE", "Riêng tư"]].map(([value, label]) => (
                <button
                  key={value || "all"}
                  type="button"
                  role="option"
                  aria-selected={visibility === value}
                  onClick={() => { setVisibility(value); setVisibilityOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${visibility === value ? "bg-orange-50 font-semibold text-orange-700" : "text-gray-600 hover:bg-orange-50/60 hover:text-orange-700"}`}
                >
                  {value === "PRIVATE" ? <LockKey size={18} weight="duotone" className="text-slate-500" /> : <Globe size={18} weight="duotone" className="text-emerald-500" />}
                  <span>{label}</span>
                  {visibility === value && <span className="ml-auto text-orange-500">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="hidden
            w-full
            rounded-xl
            border border-orange-100
            bg-gradient-to-r from-orange-50/70 to-white
            px-4 py-3 pr-10
            text-sm font-medium text-gray-700 shadow-sm
            outline-none
            transition
            hover:border-orange-300
            focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
          "
        >
          <option value="">Tất cả</option>
          <option value="PUBLIC">Công khai</option>
          <option value="PRIVATE">Riêng tư</option>
        </select>
      </div>


      {/* Calories */}
      <div className="mb-4">
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Fire size={18} weight="duotone" className="text-red-500" aria-hidden="true" />
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
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Clock size={18} weight="duotone" className="text-blue-500" aria-hidden="true" />
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
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <SortAscending size={18} weight="duotone" className="text-orange-500" aria-hidden="true" />
          Sắp xếp theo
        </label>

        <div className="relative mb-2">
          <button
            type="button"
            onClick={() => setSortOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            className="flex w-full items-center justify-between rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50/70 to-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm transition hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <span className="flex items-center gap-2">
              {sortBy === "newest" && <CalendarBlank size={19} weight="duotone" className="text-orange-500" />}
              {sortBy === "oldest" && <CalendarBlank size={19} weight="duotone" className="text-slate-500" />}
              {sortBy === "cookTime" && <Clock size={19} weight="duotone" className="text-blue-500" />}
              {sortBy === "calories" && <Fire size={19} weight="duotone" className="text-red-500" />}
              {sortBy === "name" && <TextAa size={19} weight="duotone" className="text-violet-500" />}
              <span>{sortBy === "newest" ? "Mới nhất" : sortBy === "oldest" ? "Cũ nhất" : sortBy === "cookTime" ? "Thời gian nấu" : sortBy === "calories" ? "Lượng calo" : "Tên món (A-Z)"}</span>
            </span>
            <CaretDown size={18} weight="bold" className={`text-orange-500 transition-transform ${sortOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {sortOpen && (
            <div role="listbox" aria-label="Sắp xếp theo" className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-orange-100 bg-white p-1.5 shadow-xl shadow-orange-500/10">
              {([
                ["newest", "Mới nhất", CalendarBlank, "text-orange-500"],
                ["oldest", "Cũ nhất", CalendarBlank, "text-slate-500"],
                ["cookTime", "Thời gian nấu", Clock, "text-blue-500"],
                ["calories", "Lượng calo", Fire, "text-red-500"],
                ["name", "Tên món (A-Z)", TextAa, "text-violet-500"],
              ] as const).map(([value, label, Icon, color]) => (
                <button
                  key={value}
                  type="button"
                  role="option"
                  aria-selected={sortBy === value}
                  onClick={() => { setSortBy(value); setSortOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${sortBy === value ? "bg-orange-50 font-semibold text-orange-700" : "text-gray-600 hover:bg-orange-50/60 hover:text-orange-700"}`}
                >
                  <Icon size={19} weight="duotone" className={color} />
                  <span>{label}</span>
                  {sortBy === value && <span className="ml-auto text-xs text-orange-500">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="hidden"
        >
          <option value="newest">🆕 Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="cookTime">⏱️ Thời gian nấu</option>
          <option value="calories">Lượng calo</option>
          <option value="name">Tên món (A-Z)</option>
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
