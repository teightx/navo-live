"use client";

import { FormEvent, useState } from "react";

interface FormData {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
}

export function SearchForm() {
  const [formData, setFormData] = useState<FormData>({
    origin: "",
    destination: "",
    departDate: "",
    returnDate: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("busca:", formData);
  };

  const inputClasses =
    "w-full px-4 py-3 bg-white border border-cream-dark rounded-lg text-ink placeholder:text-ink-muted focus:outline-none focus:border-blue-soft transition-colors";

  const labelClasses = "block text-xs text-ink-soft mb-1.5 lowercase";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="origin" className={labelClasses}>
            saindo de
          </label>
          <input
            type="text"
            id="origin"
            placeholder="cidade ou aeroporto"
            value={formData.origin}
            onChange={(e) =>
              setFormData({ ...formData, origin: e.target.value })
            }
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="destination" className={labelClasses}>
            indo para
          </label>
          <input
            type="text"
            id="destination"
            placeholder="cidade ou aeroporto"
            value={formData.destination}
            onChange={(e) =>
              setFormData({ ...formData, destination: e.target.value })
            }
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="departDate" className={labelClasses}>
            ida
          </label>
          <input
            type="date"
            id="departDate"
            value={formData.departDate}
            onChange={(e) =>
              setFormData({ ...formData, departDate: e.target.value })
            }
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="returnDate" className={labelClasses}>
            volta
          </label>
          <input
            type="date"
            id="returnDate"
            value={formData.returnDate}
            onChange={(e) =>
              setFormData({ ...formData, returnDate: e.target.value })
            }
            className={inputClasses}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          className="px-8 py-3 bg-blue text-white rounded-lg font-medium hover:bg-blue-soft transition-colors"
        >
          buscar
        </button>
      </div>
    </form>
  );
}

