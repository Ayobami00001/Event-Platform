export default function EventFilters() {
  return (
    <aside className="fixed left-0 hidden h-[calc(100vh-5rem)] w-64 overflow-y-auto bg-slate-50 px-4 py-6 lg:flex lg:flex-col">
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
                    index === 1
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <input type="checkbox" className="rounded" defaultChecked={index === 0} />
                  <span>{item}</span>
                </label>
              )
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
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                    index === 1
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item}
                </button>
              )
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
        <button className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">
          Apply Filters
        </button>
      </div>
    </aside>
  );
}