export default function Footer() {
  return (
    <footer className="mt-10 w-full border-t border-slate-200/70 bg-white/70 py-10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-center sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-sm font-black text-white shadow-lg shadow-indigo-500/25">
            R
          </div>
          <div className="text-left">
            <p className="text-sm font-black tracking-tight text-slate-950">ReviewDibo</p>
            <p className="text-xs text-slate-400">Real reviews. Better decisions.</p>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500">
          © 2026 ReviewDibo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
