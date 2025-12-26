"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Airport } from "@/lib/mocks/airports";
import { AutocompleteField } from "./AutocompleteField";
import { DateField } from "./DateField";

interface SearchData {
  origin: Airport | null;
  destination: Airport | null;
  departDate: Date | null;
  returnDate: Date | null;
}

export function SearchForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SearchData>({
    origin: null,
    destination: null,
    departDate: null,
    returnDate: null,
  });

  const isFormValid =
    formData.origin !== null &&
    formData.destination !== null &&
    formData.departDate !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    const params = new URLSearchParams({
      from: formData.origin!.code.toLowerCase(),
      to: formData.destination!.code.toLowerCase(),
      depart: formData.departDate!.toISOString().split("T")[0],
    });

    if (formData.returnDate) {
      params.set("return", formData.returnDate.toISOString().split("T")[0]);
    }

    router.push(`/resultados?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="bg-cream-soft/80 backdrop-blur-sm border border-cream-dark rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <AutocompleteField
            label="saindo de"
            value={formData.origin}
            onChange={(airport) =>
              setFormData((prev) => ({ ...prev, origin: airport }))
            }
            placeholder="cidade ou aeroporto"
          />

          <AutocompleteField
            label="indo para"
            value={formData.destination}
            onChange={(airport) =>
              setFormData((prev) => ({ ...prev, destination: airport }))
            }
            placeholder="cidade ou aeroporto"
          />

          <DateField
            label="ida"
            value={formData.departDate}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, departDate: date }))
            }
            placeholder="selecionar"
          />

          <DateField
            label="volta"
            value={formData.returnDate}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, returnDate: date }))
            }
            otherDate={formData.departDate}
            isEndDate
            placeholder="opcional"
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`
            mt-6 w-full h-12 rounded-xl
            text-base font-medium lowercase
            transition-colors duration-150
            ${isFormValid
              ? "bg-blue text-white hover:bg-blue-soft cursor-pointer"
              : "bg-cream-dark text-ink-muted cursor-not-allowed"
            }
          `}
        >
          buscar
        </button>
      </div>
    </form>
  );
}
