import { Globe, LockKey } from "@phosphor-icons/react";

interface Props {
  visibility: "PUBLIC" | "PRIVATE";
}

export default function VisibilityBadge({ visibility }: Props) {
  if (visibility === "PUBLIC") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 shadow-sm dark:bg-green-950/80 dark:text-green-200">
        <Globe size={16} weight="duotone" className="mr-1" aria-hidden="true" /> Công khai
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm dark:bg-stone-800 dark:text-stone-200">
      <LockKey size={16} weight="duotone" className="mr-1" aria-hidden="true" /> Riêng tư
    </span>
  );
}
