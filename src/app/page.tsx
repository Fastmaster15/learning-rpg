import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 md:py-10">
      <section className="overflow-hidden rounded-[28px] border border-[#ddd1bf] bg-[#f8f2e8] px-6 py-7 shadow-[0_18px_60px_rgba(90,68,42,0.10)]">
        <p className="text-xs font-semibold tracking-[0.3em] text-[#8a6f4f] uppercase">Learning RPG</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Learning RPG Repo</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 md:text-base">
          別レポジトリで進める Learning RPG のスタンドアロン版です。まずは日本史の第1章を1プレイできる形で育てています。
        </p>
        <div className="mt-5">
          <Link
            href="/product-lab/learning-rpg"
            className="inline-flex rounded-full border border-[#d6c8b3] bg-white px-4 py-2 text-sm font-semibold text-[#8a6f4f] transition hover:bg-[#fbf8f3]"
          >
            プロトタイプを開く
          </Link>
        </div>
      </section>
    </main>
  );
}
