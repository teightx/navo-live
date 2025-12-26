"use client";

import type { TripType } from "@/lib/types/search";
import { tripTypeLabels } from "@/lib/mocks/searchConfig";

interface TripTypeSelectProps {
  value: TripType;
  onChange: (value: TripType) => void;
}

export function TripTypeSelect({ value, onChange }: TripTypeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TripType)}
      className="
        h-10 px-4 rounded-xl
        bg-cream border border-cream-dark
        text-sm text-ink font-medium
        focus:outline-none focus:ring-1 focus:ring-blue-soft
        transition-all duration-150
        appearance-none cursor-pointer
      "
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%235a5a5a' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: "36px",
      }}
    >
      <option value="roundtrip">{tripTypeLabels.roundtrip}</option>
      <option value="oneway">{tripTypeLabels.oneway}</option>
    </select>
  );
}

