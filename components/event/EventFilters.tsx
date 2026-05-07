"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

const [selectedCategory, setSelectedCategory] = useState("");
const [selectedDate, setSelectedDate] = useState("");
const [priceRange, setPriceRange] = useState("");

useEffect(() => {
  setSelectedCategory(searchParams.get("category") || "");
  setSelectedDate(searchParams.get("date") || "");
  setPriceRange(searchParams.get("price") || "");
}, [searchParams]);

  return (
    <aside className="flex h-full flex-col overflow-y-auto bg-slate-50 px-4 py-6">
      <div className="mb-6 px-2">
        <h2 className="text-lg font-bold">Filters</h2>
        <p className="text-xs font-medium text-slate-500">Refine discovery</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Categories
          </h3>

          <div className="space-y-1">
            {["All Events", "Music", "Arts", "Business", "Sports"].map(
              (item, index) => (
                <label
                  key={item}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl p-2 text-sm font-medium transition ${
                    selectedCategory === item
  ? "bg-indigo-50 text-indigo-700"
  : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    checked={
                      item === "All Events"
                        ? selectedCategory === ""
                        : selectedCategory === item
                    }
                    onChange={() =>
                      setSelectedCategory(item === "All Events" ? "" : item)
                    }
                  />
                  <span>{item}</span>
                </label>
              ),
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Date
          </h3>

          <div className="grid gap-1">
            {["Today", "This Week", "This Weekend", "Next Month"].map(
              (item, index) => (
                <button
                  key={item}
                  onClick={() => setSelectedDate(item)}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                    selectedDate === item
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Price Range
          </h3>

          <div className="px-2">
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="h-1.5 w-full cursor-pointer accent-indigo-600"
            />
            <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
              <span>$0</span>
              <span>$1000+</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={() => {
            const params = new URLSearchParams();

            if (selectedCategory) {
              params.set("category", selectedCategory);
            }

            if (selectedDate) {
              params.set("date", selectedDate);
            }

            if (priceRange) {
              params.set("price", priceRange);
            }

            router.push(`/events?${params.toString()}`);
          }}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  );
}
