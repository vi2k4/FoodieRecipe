interface Props {
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function PaginationButton({
  active = false,
  disabled = false,
  children,
  onClick,
}: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        h-11
        min-w-[44px]
        rounded-xl
        border
        px-4
        text-sm
        font-medium
        transition

        ${
          active
            ? "border-orange-500 bg-orange-500 text-white"
            : "border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:text-orange-500"
        }

        ${disabled ? "cursor-not-allowed opacity-40" : ""}
      `}
    >
      {children}
    </button>
  );
}
