import { Globe, LockKey } from "@phosphor-icons/react";

interface Props {
  visibility: "PUBLIC" | "PRIVATE";
}

export default function VisibilityBadge({ visibility }: Props) {
  if (visibility === "PUBLIC") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        <Globe size={16} weight="duotone" className="mr-1" aria-hidden="true" /> Public
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
      <LockKey size={16} weight="duotone" className="mr-1" aria-hidden="true" /> Private
    </span>
  );
}
