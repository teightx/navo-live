"use client";

import { Popover } from "./Popover";
import type { TripType } from "@/lib/types/search";
import { tripTypeLabels } from "@/lib/mocks/searchConfig";

interface TripTypePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  value: TripType;
  onChange: (value: TripType) => void;
}

export function TripTypePopover({
  isOpen,
  onClose,
  value,
  onChange,
}: TripTypePopoverProps) {
  const options: TripType[] = ["roundtrip", "oneway"];

  function handleSelect(type: TripType) {
    onChange(type);
    onClose();
  }

  return (
    <Popover isOpen={isOpen} onClose={onClose} className="min-w-[160px] p-2">
      <div className="flex flex-col gap-1">
        {options.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleSelect(type)}
            className={`
              w-full px-3 py-2 text-left text-sm rounded-lg
              transition-colors duration-100
              ${value === type 
                ? "bg-blue text-cream-soft font-medium" 
                : "text-ink hover:bg-cream"
              }
            `}
          >
            {tripTypeLabels[type]}
          </button>
        ))}
      </div>
    </Popover>
  );
}

