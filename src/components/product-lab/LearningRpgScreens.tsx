import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { learningRpgAssetPaths } from "@/lib/learning-rpg-assets";
import {
  type ActiveEvent,
  type CardBookProgress,
  type CardDefinition,
  type GameState,
  type SceneDefinition,
  type SceneHotspot,
  getCard,
  getCardRankLabel,
  getEventDefinition,
  getHotspotCardLabel,
  getHotspotStatus,
  getHotspots
} from "@/lib/learning-rpg-game";

type DashboardLike = {
  purpose: string;
  engine: {
    mvp_note: string;
    summary: string;
  };
};

export function TitleScreen({
  dashboard,
  onStart
}: {
  dashboard: DashboardLike;
  onStart: () => void;
}) {
  return (
    <main className="min-h-screen overflow-hidden rounded-[6px] border border-[#243341] bg-[#0d1118] text-[#f6f0df] shadow-[0_28px_90px_rgba(12,17,24,0.42)]">
      <section className="relative grid min-h-[76vh] gap-6 overflow-hidden bg-[linear-gradient(180deg,#261f1a_0%,#161d25_48%,#0d1118_100%)] px-5 py-6 md:px-8 md:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(228,188,120,0.18),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(118,156,209,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(120,185,132,0.14),transparent_32%)]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-6 xl:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] xl:items-stretch">
          <div className="grid content-start gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#4f6472] bg-[#101820]/90 px-4 py-2 text-[11px] font-black tracking-[0.22em] text-[#cdd7dd] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#f3c57a]" />
              Card Exploration MVP
            </div>
            <div className="grid gap-4 rounded-[10px] border border-[#516575] bg-[linear-gradient(180deg,#1b2833_0%,#101820_100%)] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.24)]">
              <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                <div className="relative mx-auto h-[180px] w-full max-w-[220px] overflow-hidden rounded-[10px] border border-[#f3c57a]/45 bg-[#091018]">
                  <Image src={learningRpgAssetPaths.heroFront} alt="主人公" fill sizes="220px" className="object-contain object-center" />
                </div>
                <div className="grid gap-3">
                  <h1 className="text-4xl font-black leading-none text-white md:text-6xl">Learning RPG</h1>
                  <p className="max-w-2xl text-sm leading-7 text-[#d7e0e8] md:text-base">{dashboard.purpose}</p>
                  <div className="grid gap-2 text-sm text-[#9fb1bc]">
                    <p>一枚絵の探索、史実カード収集、3択イベント、カードゲートをひとつの流れにまとめた仮実装です。</p>
                    <p>{dashboard.engine.summary}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:max-w-md">
                <button type="button" onClick={onStart} className="rounded-[6px] border border-[#f3c57a] bg-[#f3c57a] px-5 py-4 text-left text-base font-black text-[#16222d] transition hover:bg-white">
                  はじめる
                </button>
                <Link href="/product-lab" className="rounded-[6px] border border-[#5f7584] bg-[#101820] px-5 py-4 text-left text-sm font-bold text-[#d7e0e8] transition hover:border-[#f3c57a]">
                  Product Lab
                </Link>
              </div>
            </div>
          </div>

          <div className="grid content-start gap-4">
            <div className="overflow-hidden rounded-[10px] border border-[#516575] bg-[#101820] shadow-[0_18px_42px_rgba(0,0,0,0.18)]">
              <div className="grid aspect-[4/3] place-items-stretch">
                <div className="relative grid h-full w-full">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(243,197,122,0.14),transparent_30%),linear-gradient(180deg,rgba(8,12,18,0.08),rgba(8,12,18,0.6))]" />
                  <PreviewCard title="飛鳥の町" subtitle="未確認 / 完了済み / ロック中のホットスポット" x={18} y={60} status="complete" />
                  <PreviewCard title="職人の作業場" subtitle="カード帳とイベントの往復" x={53} y={36} status="unconfirmed" />
                  <PreviewCard title="寺の入口" subtitle="Sランク解放ゲート" x={80} y={68} status="locked" />
                </div>
              </div>
            </div>
            <div className="grid gap-3 rounded-[8px] border border-[#40505c] bg-[#101820]/90 p-4 text-sm leading-6 text-[#cdd7dd]">
              <div className="flex flex-wrap gap-2">
                <Badge label="exploration" />
                <Badge label="card book" />
                <Badge label="3-choice event" />
                <Badge label="S gate" />
              </div>
              <p>{dashboard.engine.mvp_note}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function PlayShell({
  state,
  scene,
  progress,
  ownedCards,
  onSceneChange,
  onHotspotClick,
  onOpenEvent,
  onClaimSCard,
  onFocusHotspot,
  gateReady
}: {
  state: GameState;
  scene: SceneDefinition;
  progress: CardBookProgress;
  ownedCards: CardDefinition[];
  onSceneChange: (sceneId: SceneDefinition["id"]) => void;
  onHotspotClick: (hotspot: SceneHotspot) => void;
  onOpenEvent: (hotspot: SceneHotspot) => void;
  onClaimSCard: () => void;
  onFocusHotspot: (hotspotId: string) => void;
  gateReady: boolean;
}) {
  const hotspots = getHotspots(scene.id);
  return (
    <main className="min-h-screen rounded-[6px] border border-[#243341] bg-[#0d1118] text-[#f6f0df] shadow-[0_28px_90px_rgba(12,17,24,0.35)]">
      <div className="grid gap-4 p-3 md:p-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <section className="grid gap-4 min-w-0">
          <header className="grid gap-3 rounded-[12px] border border-[#40505c] bg-[#101820]/90 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-[11px] font-black tracking-[0.24em] text-[#8aa0ad] uppercase">card exploration</p>
                <h1 className="text-2xl font-black text-white md:text-3xl">{scene.title}</h1>
                <p className="text-sm leading-6 text-[#cdd7dd]">{scene.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge label={`insight ${state.insightPoints}`} />
                <Badge label={`${progress.ownedCount}/${progress.totalCount}`} />
                <Badge label={progress.gateReady ? "gate ready" : "gate locked"} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <SceneButton active={scene.id === "asukamachi"} label="飛鳥の町" onClick={() => onSceneChange("asukamachi")} />
              <SceneButton active={scene.id === "artisan_workshop"} label="職人の作業場" onClick={() => onSceneChange("artisan_workshop")} />
              <SceneButton active={scene.id === "temple_entrance"} label="寺の入口" onClick={() => onSceneChange("temple_entrance")} />
              <SceneButton active={false} label="カード帳" onClick={() => undefined} />
            </div>
          </header>

          <section className={`relative overflow-hidden rounded-[14px] border ${scene.shellClassName}`}>
            <div className={`absolute inset-0 ${scene.glowClassName}`} />
            <div className="relative border-b border-white/5 bg-white/5 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-black tracking-[0.18em] uppercase text-white">{scene.subtitle}</span>
                <span className="text-xs font-bold tracking-[0.18em] text-[#d7e0e8] uppercase">{scene.id === "temple_entrance" ? "S gate / chapter lock" : "hotspot map"}</span>
              </div>
            </div>
            <div className="relative p-3 md:p-4">
              <div
                className="relative overflow-hidden rounded-[12px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,rgba(9,13,20,0.12),rgba(9,13,20,0.44))]"
                style={{ aspectRatio: "16 / 10", minHeight: "520px" }}
              >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_22px),repeating-linear-gradient(180deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_22px)] opacity-35" />
                <div className="absolute inset-x-8 top-8 h-24 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute inset-x-12 bottom-0 h-20 rounded-full bg-black/35 blur-2xl" />

                {hotspots.map((hotspot) => {
                  const status = getHotspotStatus(state, hotspot);
                  const label = getHotspotCardLabel(hotspot);
                  return (
                    <button
                      key={hotspot.id}
                      type="button"
                      onClick={() => {
                        onFocusHotspot(hotspot.id);
                        if (hotspot.kind === "event") {
                          onOpenEvent(hotspot);
                          return;
                        }
                        if (hotspot.kind === "gate" && status === "unconfirmed" && gateReady) {
                          onClaimSCard();
                          return;
                        }
                        onHotspotClick(hotspot);
                      }}
                      className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-left shadow-[0_14px_34px_rgba(0,0,0,0.26)] transition duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#f3c57a] ${
                        status === "complete"
                          ? "border-[#88f0b2] bg-[#10261d]/90 text-[#ddffe9]"
                          : status === "locked"
                            ? "border-[#6c7482] bg-[#121820]/90 text-[#c2c9d2]"
                            : "border-[#f3c57a]/70 bg-[#1a1c19]/90 text-[#fff2cb]"
                      }`}
                      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    >
                      <span className="block text-[11px] font-black tracking-[0.18em] uppercase">{status === "locked" ? "ロック中" : status === "complete" ? "完了済み" : "未確認"}</span>
                      <span className="block text-sm font-bold leading-5">{hotspot.title}</span>
                      <span className="block text-[11px] leading-4 opacity-85">{hotspot.subtitle}</span>
                      <span className={`absolute -right-2 -top-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-[10px] font-black ${status === "complete" ? "border-[#88f0b2] bg-[#103122] text-[#dfffe9]" : status === "locked" ? "border-[#6c7482] bg-[#0d1118] text-[#d2d8e2]" : "border-[#f3c57a] bg-[#332b17] text-[#fff2cb]"}`}>{label || "•"}</span>
                      {status === "unconfirmed" ? <span className="absolute inset-0 animate-pulse rounded-full border border-white/10" /> : null}
                    </button>
                  );
                })}

                <div className="absolute left-6 top-6 max-w-[260px] rounded-[12px] border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] font-black tracking-[0.2em] text-[#d7e0e8] uppercase">scene note</p>
                  <p className="mt-2 text-sm leading-6 text-white">{scene.subtitle}</p>
                  <p className="mt-2 text-xs leading-5 text-[#c2c9d2]">{scene.summary}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-3 md:grid-cols-2">
            <MiniPanel title="見えているもの" subtitle="未確認・完了済み・ロック中を一目で切り替える">
              <div className="grid gap-2 text-sm leading-6">
                {hotspots.map((hotspot) => {
                  const status = getHotspotStatus(state, hotspot);
                  return (
                    <button
                      key={hotspot.id}
                      type="button"
                      onClick={() => onFocusHotspot(hotspot.id)}
                      className="flex items-center justify-between gap-3 rounded-[8px] border border-white/8 bg-white/4 px-3 py-2 text-left transition hover:border-[#f3c57a]/50 hover:bg-white/6"
                    >
                      <span className="font-bold text-white">{hotspot.title}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black tracking-[0.18em] uppercase ${statusBadgeClass(status)}`}>{statusLabel(status)}</span>
                    </button>
                  );
                })}
              </div>
            </MiniPanel>

            <MiniPanel title="S gate" subtitle={progress.gateReady ? "条件成立。飛鳥寺を解放できる。" : "条件未達。カードと視点をもう少し集める。"}>
              <div className="grid gap-2 text-sm leading-6">
                <p className="font-bold text-white">必要カード</p>
                <div className="flex flex-wrap gap-2">
                  {progress.missingRequiredCardIds.length === 0 ? <Badge label="all ready" /> : progress.missingRequiredCardIds.map((cardId) => <Badge key={cardId} label={getCard(cardId).title} />)}
                </div>
                <button type="button" onClick={onClaimSCard} className={`mt-1 rounded-[8px] border px-4 py-3 text-left font-black transition ${progress.gateReady ? "border-[#f3c57a] bg-[#f3c57a] text-[#16222d] hover:bg-white" : "border-[#5f7584] bg-[#101820] text-[#cdd7dd] opacity-70"}`}>
                  {state.sCardClaimed ? "飛鳥寺を解放済み" : progress.gateReady ? "飛鳥寺カードを解放する" : "まだロック中"}
                </button>
              </div>
            </MiniPanel>
          </div>
        </section>

        <aside className="grid gap-4 content-start xl:sticky xl:top-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-auto">
          <MiniPanel title="カード帳" subtitle="飛鳥パックの進捗">
            <CardBook progress={progress} cards={ownedCards} />
          </MiniPanel>

          <MiniPanel title="カードメモ" subtitle="選んだカードが何を強めるか">
            <div className="grid gap-2 text-sm leading-6">
              {ownedCards.slice(0, 4).map((card) => (
                <div key={card.id} className="rounded-[8px] border border-white/8 bg-white/4 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white">{card.title}</p>
                    <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-black tracking-[0.18em] uppercase text-[#d7e0e8]">{getCardRankLabel(card.rank)}</span>
                  </div>
                  <p className="mt-1 text-[#c2c9d2]">{card.summary}</p>
                </div>
              ))}
              {ownedCards.length === 0 ? <p className="text-[#c2c9d2]">カードを拾うと、ここに内容が並ぶ。</p> : null}
            </div>
          </MiniPanel>

          <MiniPanel title="ナビ" subtitle="現在の場面とメモ">
            <div className="grid gap-2 text-sm leading-6">
              <p className="font-bold text-white">{scene.title}</p>
              <p className="text-[#c2c9d2]">{state.dialogue}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge label={`insight ${state.insightPoints}`} />
                <Badge label={`cards ${progress.ownedCount}/${progress.totalCount}`} />
              </div>
            </div>
          </MiniPanel>
        </aside>
      </div>
    </main>
  );
}

export function EventOverlay({
  activeEvent,
  state,
  onChoose,
  onClose
}: {
  activeEvent: ActiveEvent | null;
  state: GameState;
  onChoose: (cardId: string) => void;
  onClose: () => void;
}) {
  if (!activeEvent) return null;
  const event = getEventDefinition(activeEvent.eventId);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/72 p-3 backdrop-blur-[2px]">
      <section className="w-full max-w-4xl rounded-[14px] border border-[#566c7c] bg-[linear-gradient(180deg,#1b2833_0%,#101820_100%)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.48)] md:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#c8d1d6] uppercase">3-choice event</p>
            <h2 className="mt-1 text-2xl font-black text-white">{event.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#d7e0e8]">{event.prompt}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[#5f7584] bg-[#101820] px-3 py-1 text-xs font-black text-[#d7e0e8]">
            close
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {activeEvent.cardIds.map((cardId) => {
            const card = getCard(cardId);
            const reaction = card.reactions[activeEvent.eventId];
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onChoose(card.id)}
                className="grid gap-3 rounded-[12px] border border-[#40505c] bg-[#0f151c] p-4 text-left transition hover:border-[#f3c57a] hover:bg-[#111822]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-[#40505c] bg-[#101820] px-2 py-1 text-[11px] font-black tracking-[0.18em] text-[#d7e0e8] uppercase">{getCardRankLabel(card.rank)}</span>
                  <span className="text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">insight +{reaction?.insightBonus ?? card.insightValue}</span>
                </div>
                <div>
                  <p className="text-lg font-black text-white">{card.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#cdd7dd]">{card.summary}</p>
                </div>
                <div className="rounded-[8px] border border-white/8 bg-white/4 p-3 text-sm leading-6 text-[#f5eddc]">
                  {reaction?.line ?? "このカードは、別の視点を開く。"}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-[10px] border border-[#40505c] bg-[#0f151c] p-3 text-sm leading-6 text-[#cdd7dd]">
          いまの手札は {state.ownedCardIds.length} 枚。3枚あれば、カード帳から視点の切り替えができる。
        </div>
      </section>
    </div>
  );
}

function CardBook({ progress, cards }: { progress: CardBookProgress; cards: CardDefinition[] }) {
  return (
    <div className="grid gap-3">
      <div className="rounded-[10px] border border-white/8 bg-white/4 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">asuka pack</p>
            <p className="mt-1 text-lg font-black text-white">{Math.round(progress.completionRate * 100)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">progress</p>
            <p className="mt-1 text-lg font-black text-white">{progress.ownedCount}/{progress.totalCount}</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#0a0f15]">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#f3c57a_0%,#8de0b1_52%,#8db8ff_100%)]" style={{ width: `${Math.max(6, progress.completionRate * 100)}%` }} />
        </div>
      </div>

      <div className="grid gap-2">
        {cards.map((card) => (
          <div key={card.id} className="rounded-[10px] border border-white/8 bg-white/4 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-bold text-white">{card.title}</p>
                <p className="text-xs tracking-[0.14em] text-[#8aa0ad] uppercase">{card.sceneId.replace("_", " ")}</p>
              </div>
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-black tracking-[0.18em] text-[#d7e0e8] uppercase">{getCardRankLabel(card.rank)}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#c2c9d2]">{card.summary}</p>
          </div>
        ))}
        {cards.length === 0 ? <p className="text-sm leading-6 text-[#c2c9d2]">まだカードがない。ホットスポットを開くと、ここが埋まり始める。</p> : null}
      </div>
    </div>
  );
}

function MiniPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 rounded-[12px] border border-[#40505c] bg-[#101820]/90 p-4">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#d7e0e8]">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-full border border-[#40505c] bg-[#101820] px-2 py-1 text-[11px] font-bold tracking-[0.08em] text-[#d7e0e8]">{label}</span>;
}

function SceneButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
        active ? "border-[#f3c57a] bg-[#f3c57a] text-[#16222d]" : "border-[#40505c] bg-[#101820] text-[#d7e0e8] hover:border-[#f3c57a]/70"
      }`}
    >
      {label}
    </button>
  );
}

function PreviewCard({
  title,
  subtitle,
  x,
  y,
  status
}: {
  title: string;
  subtitle: string;
  x: number;
  y: number;
  status: "unconfirmed" | "complete" | "locked";
}) {
  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-3 text-left shadow-[0_14px_34px_rgba(0,0,0,0.22)] ${
        status === "complete" ? "border-[#8de0b1] bg-[#10261d]/90 text-[#ddffe9]" : status === "locked" ? "border-[#6c7482] bg-[#121820]/90 text-[#c2c9d2]" : "border-[#f3c57a]/70 bg-[#1a1c19]/90 text-[#fff2cb]"
      }`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="block text-[11px] font-black tracking-[0.18em] uppercase">{statusLabel(status)}</span>
      <span className="block text-sm font-bold leading-5">{title}</span>
      <span className="block text-[11px] leading-4 opacity-85">{subtitle}</span>
    </div>
  );
}

function statusBadgeClass(status: "unconfirmed" | "complete" | "locked") {
  if (status === "complete") return "border-[#88f0b2] bg-[#103122] text-[#dfffe9]";
  if (status === "locked") return "border-[#6c7482] bg-[#0d1118] text-[#d2d8e2]";
  return "border-[#f3c57a] bg-[#332b17] text-[#fff2cb]";
}

function statusLabel(status: "unconfirmed" | "complete" | "locked") {
  if (status === "complete") return "完了済み";
  if (status === "locked") return "ロック中";
  return "未確認";
}
