"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Hero() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-12 pt-28 lg:py-20">
      <div className="relative flex min-h-[600px] items-center overflow-hidden rounded-3xl bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=80"
          alt="Concert crowd"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 max-w-3xl px-8 py-16 text-white md:px-12 lg:px-20">
          <h1 className="mb-8 text-5xl font-extrabold leading-tight tracking-tight lg:text-7xl">
            The world is your <span className="text-indigo-300">stage.</span>
          </h1>

          <div className="flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl md:flex-row">
            <div className="flex flex-1 items-center gap-3 px-4 py-3 md:border-r md:border-slate-200">
              <span className="text-indigo-600">🔍</span>
              <input
                type="text"
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-none bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-1 items-center gap-3 px-4 py-3">
              <span className="text-indigo-600">📍</span>
              <input
                type="text"
                placeholder="Where?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border-none bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={() => {
                const params = new URLSearchParams();

                if (search) params.append("search", search);
                if (location) params.append("location", location);

                router.push(`/events?${params.toString()}`);
              }}
              className="rounded-xl bg-indigo-600 px-8 py-4 font-bold text-white transition hover:bg-indigo-700"
            >
              Find events
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
