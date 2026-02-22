"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <svg
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-acnh-brown)] opacity-50"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border-2 border-[var(--color-acnh-green)] bg-white py-2.5 pl-10 pr-4 text-sm text-[#3d3225] placeholder-[#3d3225]/40 outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(120,194,87,0.3)]"
      />
    </div>
  );
}
