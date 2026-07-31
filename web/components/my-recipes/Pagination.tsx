"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import PaginationButton from "./PaginationButton";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  const pages = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (page > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      {/* Desktop */}

      <div className="hidden md:flex items-center gap-2">
        <PaginationButton
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={18} />
        </PaginationButton>

        {pages.map((item, index) => {
          if (item === "...") {
            return (
              <span key={index} className="px-2 text-gray-500">
                ...
              </span>
            );
          }

          return (
            <PaginationButton
              key={item}
              active={page === item}
              onClick={() => onPageChange(Number(item))}
            >
              {item}
            </PaginationButton>
          );
        })}

        <PaginationButton
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={18} />
        </PaginationButton>
      </div>

      {/* Mobile */}

      <div className="flex w-full items-center justify-between rounded-xl border bg-white p-4 md:hidden">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-2 disabled:opacity-40"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <span className="font-semibold">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-2 disabled:opacity-40"
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
