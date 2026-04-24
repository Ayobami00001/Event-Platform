export default function Footer() {
  return (
    <footer className="mt-20 rounded-t-[3rem] bg-slate-100">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-6 px-8 py-12 md:flex-row">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <a href="/" className="text-lg font-bold text-slate-900">
            Concierge
          </a>
          <p className="text-sm text-slate-500">
            © 2026 Concierge Digital. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          <a href="#" className="transition-colors hover:text-indigo-500">
            Privacy Policy
          </a>
          <a href="#" className="transition-colors hover:text-indigo-500">
            Terms of Service
          </a>
          <a href="#" className="transition-colors hover:text-indigo-500">
            Help Center
          </a>
          <a href="#" className="transition-colors hover:text-indigo-500">
            Contact Us
          </a>
        </div>

        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 transition-all hover:bg-indigo-600 hover:text-white">
            ↗
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 transition-all hover:bg-indigo-600 hover:text-white">
            🌐
          </div>
        </div>
      </div>
    </footer>
  );
}