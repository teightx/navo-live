"use client";

import { useState } from "react";
import { Field } from "./Field";
import { DateField } from "./DateField";

interface SearchData {
  origin: string;
  destination: string;
  departDate: Date | null;
  returnDate: Date | null;
}

export function SearchForm() {
  const [formData, setFormData] = useState<SearchData>({
    origin: "",
    destination: "",
    departDate: null,
    returnDate: null,
  });

  const isFormValid =
    formData.origin.trim() !== "" &&
    formData.destination.trim() !== "" &&
    formData.departDate !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const output = {
      origin: formData.origin,
      destination: formData.destination,
      departDate: formData.departDate?.toISOString().split("T")[0] || null,
      returnDate: formData.returnDate?.toISOString().split("T")[0] || null,
    };
    
    console.log("busca:", output);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="bg-white/60 backdrop-blur-sm border border-cream-dark rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <Field
            label="saindo de"
            placeholder="são paulo (gru)"
            value={formData.origin}
            onChange={(e) =>
              setFormData({ ...formData, origin: e.target.value.toLowerCase() })
            }
          />

          <Field
            label="indo para"
            placeholder="rio de janeiro (gig)"
            value={formData.destination}
            onChange={(e) =>
              setFormData({ ...formData, destination: e.target.value.toLowerCase() })
            }
          />

          <DateField
            label="ida"
            value={formData.departDate}
            onChange={(date) => setFormData({ ...formData, departDate: date })}
            otherDate={formData.returnDate}
            placeholder="selecionar"
          />

          <DateField
            label="volta"
            value={formData.returnDate}
            onChange={(date) => setFormData({ ...formData, returnDate: date })}
            otherDate={formData.departDate}
            isEndDate
            placeholder="opcional"
          />
        </div>

        <div className="mt-6 sm:mt-8 flex justify-center">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`
              h-12 px-10 rounded-lg font-medium text-base lowercase
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
      </div>
    </form>
  );
}

