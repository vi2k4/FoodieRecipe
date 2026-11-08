interface DifficultyDotProps {
  difficulty?: string | null;
  className?: string;
}

export function DifficultyDot({
  difficulty,
  className = "",
}: DifficultyDotProps) {
  const color =
    difficulty === "EASY"
      ? "bg-emerald-500"
      : difficulty === "MEDIUM"
        ? "bg-amber-400"
        : "bg-red-500";
  const label =
    difficulty === "EASY"
      ? "Dễ"
      : difficulty === "MEDIUM"
        ? "Trung bình"
        : "Khó";

  return (
    <span
      title={`Độ khó: ${label}`}
      aria-label={`Độ khó: ${label}`}
      className={`inline-block size-4 rounded-full border-2 border-white/90 shadow-md dark:border-stone-700 ${color} ${className}`}
    />
  );
}
