const specs = [
  {
    title: "統合MVP仕様",
    path: "docs/planning/integrated-learning-rpg-mvp-spec.md",
    description: "一枚絵探索、史実カード、3択インタラクション、カードゲート、飛鳥寺Sカード解放までを統合した実装判断用仕様。"
  },
  {
    title: "一枚絵探索・吹き出し仕様",
    path: "docs/planning/illustration-hotspot-exploration-spec.md",
    description: "町を一枚絵として表示し、吹き出しホットスポットをタップして進める探索UI仕様。"
  },
  {
    title: "カード3択インタラクション仕様",
    path: "docs/planning/card-choice-interaction-spec.md",
    description: "手持ちカードから3択を出し、選んだカードによってNPCやイベントの反応を変える仕様。"
  },
  {
    title: "カードゲート進行仕様",
    path: "docs/planning/card-gate-progression-spec.md",
    description: "特定カード、複数枚カード、関連カードセットによってイベントやSカード解放を進める仕様。"
  }
];

export default function LearningRpgPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-8 text-slate-900 md:py-10">
      <section className="overflow-hidden rounded-[28px] border border-[#d7c7ad] bg-[#fbf5eb] p-6 shadow-[0_18px_60px_rgba(90,68,42,0.10)] md:p-8">
        <p className="text-xs font-black tracking-[0.28em] text-[#8a6f4f] uppercase">Learning RPG / Card Exploration MVP</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">史実カード探索MVP 準備画面</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700 md:text-base">
          旧タイル移動・戦闘RPG案は没案として退避しました。現在の実装方針は、一枚絵の飛鳥の町をタップして探索し、史実カードを集め、手持ちカード3択で人・物・場所の関係を読み解くカードRPGです。
        </p>
        <div className="mt-6 grid gap-3 rounded-2xl border border-[#e1d2b8] bg-white/70 p-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-[#8a6f4f] uppercase">MVP Goal</p>
            <p className="mt-2 text-sm font-bold leading-6">Sランク「飛鳥寺」カードを解放する</p>
          </div>
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-[#8a6f4f] uppercase">Core Loop</p>
            <p className="mt-2 text-sm font-bold leading-6">見る → 集める → 選ぶ → つなげる</p>
          </div>
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-[#8a6f4f] uppercase">Current State</p>
            <p className="mt-2 text-sm font-bold leading-6">仕様確定済み / 仮実装待ち</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {specs.map((spec) => (
          <article key={spec.path} className="rounded-3xl border border-[#ded1bd] bg-white p-5 shadow-[0_12px_36px_rgba(90,68,42,0.08)]">
            <p className="text-xs font-black tracking-[0.18em] text-[#8a6f4f] uppercase">Spec</p>
            <h2 className="mt-2 text-xl font-black">{spec.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{spec.description}</p>
            <p className="mt-4 rounded-2xl bg-[#f8f2e8] px-3 py-2 font-mono text-xs text-[#6b573e]">{spec.path}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-[#ded1bd] bg-[#17120b] p-5 text-[#f9f2e7] shadow-[0_18px_60px_rgba(23,18,11,0.20)] md:p-6">
        <p className="text-xs font-black tracking-[0.22em] text-[#d6b57e] uppercase">Next Implementation</p>
        <h2 className="mt-2 text-2xl font-black">次の実装対象</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-7 md:grid-cols-2">
          <li className="rounded-2xl border border-white/10 bg-white/5 p-4">1. 飛鳥の町の一枚絵風プロトタイプ画面</li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-4">2. 状態付き吹き出しホットスポット</li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-4">3. 飛鳥パック 12〜16枚のカードデータ</li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-4">4. 手持ちカード3択イベント</li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-4">5. カードゲートとSカード進捗</li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-4">6. Sランク「飛鳥寺」解放演出</li>
        </ol>
      </section>
    </main>
  );
}
