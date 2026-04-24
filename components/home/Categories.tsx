const categories = [
  "Discover All",
  "Music",
  "Tech",
  "Sports",
  "Online Events",
  "Arts & Culture",
  "Food & Drink",
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-screen-2xl px-6 pb-16">
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {categories.map((category, index) => (
          <button
            key={category}
            className={`whitespace-nowrap rounded-full px-6 py-3 font-semibold transition ${
              index === 0
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}