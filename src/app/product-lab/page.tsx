import Link from "next/link";

export default function ProductLabPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 md:py-10">
      <section className="rounded-[28px] border border-[#ddd1bf] bg-white/80 px-6 py-7 shadow-[0_18px_60px_rgba(90,68,42,0.10)]">
        <p className="text-xs font-semibold tracking-[0.3em] text-[#8a6f4f] uppercase">Product Lab</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Learning RPG Entrance</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 md:text-base">
          この別レポジトリでは、Learning RPG の体験を先に育てます。まずはプロトタイプの入口として使ってください。
        </p>
        <div className="mt-5">
          <Link
            href="/product-lab/learning-rpg"
            className="inline-flex rounded-full border border-[#d6c8b3] bg-[#fbf8f3] px-4 py-2 text-sm font-semibold text-[#8a6f4f] transition hover:bg-white"
          >
            Learning RPGを見る
          </Link>
        </div>
      </section>
    </main>
  );
}

