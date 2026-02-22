"use client";

interface FilterPillsProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterPills({
  options,
  selected,
  onSelect,
}: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[var(--color-acnh-green)] text-white shadow-sm"
                : "bg-white text-[#3d3225] hover:bg-[var(--color-acnh-green)]/10 border border-[#3d3225]/15"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
