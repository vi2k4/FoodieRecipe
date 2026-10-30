"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";

const slides = [
  {
    eyebrow: "Cảm hứng mỗi ngày",
    title: "Món ngon bắt đầu từ căn bếp của bạn",
    description: "Khám phá công thức dễ làm, ngon miệng và phù hợp với nguyên liệu bạn đang có.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1600&q=85",
  },
  {
    eyebrow: "Nấu ăn thông minh",
    title: "Để AI gợi ý món ăn cho bạn",
    description: "Chụp ảnh nguyên liệu và nhận những gợi ý công thức thú vị chỉ trong vài giây.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=85",
  },
  {
    eyebrow: "Chia sẻ đam mê",
    title: "Lưu giữ công thức của riêng bạn",
    description: "Chia sẻ món ăn yêu thích và kết nối với cộng đồng yêu bếp FoodiRecipe.",
    image: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=1600&q=85",
  },
];

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[activeIndex];

  const goTo = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  return (
    <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-0">
        {slides.map((item, index) => (
          <img
            key={item.image}
            src={item.image}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/55 to-neutral-950/10" />
      </div>

      <div className="relative mx-auto flex min-h-[440px] max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-200 ring-1 ring-inset ring-orange-300/30">
            <Flame className="h-3.5 w-3.5" /> {slide.eyebrow}
          </span>
          <div key={activeIndex} className="animate-in fade-in slide-in-from-left-3 duration-500">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              {slide.title}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
              {slide.description}
            </p>
          </div>
          <Link
            href="/recipes"
            className="inline-flex items-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/30 transition hover:bg-orange-400"
          >
            Khám phá công thức
          </Link>
        </div>

        <div className="absolute bottom-7 left-4 right-4 flex items-center justify-between sm:left-6 sm:right-6 lg:left-8 lg:right-8">
          <div className="flex items-center gap-2" aria-label="Điều hướng slider">
            {slides.map((item, index) => (
              <button
                key={item.eyebrow}
                type="button"
                aria-label={`Chuyển đến slide ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-8 bg-orange-400" : "w-2 bg-white/50 hover:bg-white"}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button type="button" aria-label="Slide trước" onClick={() => goTo(activeIndex - 1)} className="rounded-full bg-white/15 p-2 backdrop-blur transition hover:bg-white/30">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Slide tiếp theo" onClick={() => goTo(activeIndex + 1)} className="rounded-full bg-white/15 p-2 backdrop-blur transition hover:bg-white/30">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
