import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="relative mt-8">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        size={20}
      />

      <input
        placeholder="Search recipes..."
        className="w-full rounded-xl border bg-white py-4 pl-12 pr-4 outline-none focus:border-orange-500"
      />
    </div>
  );
}
