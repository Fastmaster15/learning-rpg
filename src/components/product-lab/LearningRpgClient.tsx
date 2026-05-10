"use client";

import Link from "next/link";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { DashboardCard } from "@/components/DashboardCard";
import type { LearningRpgDashboard, LearningRpgStage, LearningRpgTheme } from "@/lib/learning-rpg";

const STORAGE_KEY = "my-independent-os.learning-rpg.v2";

type ThemeProgress = {
  selectedStageId: string;
  stageStatuses: Record<string, LearningRpgStage["status"]>;
};

type SavedState = {
  activeThemeId?: string;
  themes?: Record<string, ThemeProgress>;
  battles?: Record<string, BattleState>;
};

type BattlePhase = "field" | "battle" | "victory";

type BattleState = {
  stageId: string;
  phase: BattlePhase;
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  playerHp: number;
  playerMaxHp: number;
  log: string[];
};

type BattleTurnResult = {
  state: BattleState;
  progress: ThemeProgress;
  message: string;
};

type LearningRpgClientProps = {
  dashboard: LearningRpgDashboard;
  initialThemeId?: string;
};

export function LearningRpgClient({ dashboard, initialThemeId }: LearningRpgClientProps) {
  const defaultThemeId = getDefaultThemeId(dashboard, initialThemeId);
  const [activeThemeId, setActiveThemeId] = useState(defaultThemeId);
  const [themeProgress, setThemeProgress] = useState<Record<string, ThemeProgress>>(() => buildDefaultProgressMap(dashboard));
  const [battleStates, setBattleStates] = useState<Record<string, BattleState>>(() => buildDefaultBattleMap(dashboard));
  const [activityMessage, setActivityMessage] = useState<string>("カードを選んで、ステージを進めてみよう。");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setThemeProgress(mergeProgressMap(dashboard, saved.themes));
      setBattleStates(mergeBattleMap(dashboard, saved.battles));
      setActiveThemeId(getDefaultThemeId(dashboard, saved.activeThemeId ?? initialThemeId));
      setActivityMessage("保存済みの進行を読み込みました。");
    } else if (initialThemeId) {
      setActiveThemeId(getDefaultThemeId(dashboard, initialThemeId));
    }
    setReady(true);
  }, [dashboard, initialThemeId]);

  useEffect(() => {
    if (!ready) return;
    saveState({
      activeThemeId,
      themes: themeProgress,
      battles: battleStates
    });
  }, [activeThemeId, battleStates, ready, themeProgress]);

  useEffect(() => {
    if (!ready || typeof window === "undefined" || !activeThemeId) return;

    const url = new URL(window.location.href);
    url.searchParams.set("theme", activeThemeId);
    window.history.replaceState({}, "", url.toString());
  }, [activeThemeId, ready]);

  const activeTheme = dashboard.themes.find((theme) => theme.theme_id === activeThemeId) ?? dashboard.themes[0];
  const progress = themeProgress[activeTheme.theme_id] ?? buildDefaultThemeProgress(activeTheme);
  const battle = battleStates[activeTheme.theme_id] ?? buildBattleStateFromStage(activeTheme, progress.selectedStageId || findFirstStage(activeTheme)?.stage_id || "");
  const selectedStage = findStage(activeTheme, progress.selectedStageId) ?? findFirstStage(activeTheme);
  const totalStages = countStages(activeTheme);
  const clearedStages = countStages(activeTheme, progress.stageStatuses, "cleared");
  const inProgressStages = countStages(activeTheme, progress.stageStatuses, "in_progress");
  const lockedStages = countStages(activeTheme, progress.stageStatuses, "locked");
  const initialClearedExp = sumStageExp(activeTheme, buildDefaultThemeProgress(activeTheme).stageStatuses, "cleared");
  const currentClearedExp = sumStageExp(activeTheme, progress.stageStatuses, "cleared");
  const currentExp = activeTheme.player.exp + currentClearedExp - initialClearedExp;
  const expRate = Math.min(100, Math.round((currentExp / activeTheme.player.next_level_exp) * 100));

  function selectTheme(themeId: string) {
    const theme = dashboard.themes.find((item) => item.theme_id === themeId);
    if (!theme) return;
    setActiveThemeId(themeId);
    setActivityMessage(`${theme.name} に切り替えました。`);

    const nextProgress = {
      ...(themeProgress[themeId] ?? buildDefaultThemeProgress(theme))
    };
    if (!nextProgress.selectedStageId) {
      nextProgress.selectedStageId = findFirstStage(theme)?.stage_id ?? "";
    }
    setThemeProgress((current) => ({
      ...current,
      [themeId]: nextProgress
    }));
  }

  function selectStage(stageId: string) {
    const stage = findStage(activeTheme, stageId);
    if (!stage) return;

    setActivityMessage(`${stage.title} を選択しました。`);
    setThemeProgress((current) => {
      const nextTheme = current[activeTheme.theme_id] ?? buildDefaultThemeProgress(activeTheme);
      return {
        ...current,
        [activeTheme.theme_id]: {
          ...nextTheme,
          selectedStageId: stageId
        }
      };
    });
  }

  function enterBattle(stageId: string) {
    const stage = findStage(activeTheme, stageId);
    if (!stage) return;

    setThemeProgress((current) => {
      const nextTheme = current[activeTheme.theme_id] ?? buildDefaultThemeProgress(activeTheme);
      return {
        ...current,
        [activeTheme.theme_id]: {
          ...nextTheme,
          selectedStageId: stageId
        }
      };
    });

    setBattleStates((current) => ({
      ...current,
      [activeTheme.theme_id]: buildBattleStateFromStage(activeTheme, stageId, current[activeTheme.theme_id])
    }));
    setActivityMessage(`${stage.title} の戦闘を開始しました。`);
  }

  function performBattleCommand(command: "attack" | "skill" | "guard" | "run") {
    const stage = findStage(activeTheme, battle.stageId);
    if (!stage) return;

    const next = resolveBattleTurn(activeTheme, stage, battle, command, progress);
    setBattleStates((current) => ({
      ...current,
      [activeTheme.theme_id]: next.state
    }));
    setThemeProgress((current) => ({
      ...current,
      [activeTheme.theme_id]: next.progress
    }));
    setActivityMessage(next.message);
  }

  return (
    <div className="grid gap-4">
      <section className="overflow-hidden rounded-xl border border-[#d7e7ec] bg-[linear-gradient(135deg,#f7fbfc_0%,#f7fbfa_48%,#fffaf2_100%)] shadow-sm shadow-stone-200/70">
        <div className="grid gap-5 px-5 py-6 md:px-7 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-[#53766f] uppercase">
              <span>Product Lab</span>
              <span className="text-[#b8c8c3]">/</span>
              <span>Learning RPG</span>
              <span className="text-[#b8c8c3]">/</span>
              <span>MVP</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{dashboard.engine.name}</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-700 md:text-base">{dashboard.engine.summary}</p>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">{dashboard.engine.mvp_note}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/product-lab"
                className="rounded-sm border border-[#d6c8b3] bg-[#fbf8f3] px-3 py-2 text-sm font-semibold text-[#8a6f4f] transition hover:bg-white"
              >
                Product Labへ戻る
              </Link>
              <span className="rounded-sm border border-[#d8e5e8] bg-white px-3 py-2 text-sm font-semibold text-[#53766f]">
                {dashboard.themes.length} themes
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {dashboard.engine.shared_parts.map((part) => (
              <div key={part} className="rounded-sm border border-line bg-white px-4 py-3 shadow-sm shadow-stone-200/60">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">ENGINE PART</p>
                <p className="mt-2 text-base font-bold text-slate-900">{part}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DashboardCard title="プレイ中のテーマ" subtitle="ボタンで切り替え、進行はこのブラウザに保存される。">
        <div className="grid gap-2 md:grid-cols-3">
          {dashboard.themes.map((theme) => {
            const progressItem = themeProgress[theme.theme_id] ?? buildDefaultThemeProgress(theme);
            const selected = theme.theme_id === activeTheme.theme_id;
            const cleared = countStages(theme, progressItem.stageStatuses, "cleared");
            const total = countStages(theme);
            const progressCount = `${cleared}/${total} cleared`;
            const exp = theme.player.exp + sumStageExp(theme, progressItem.stageStatuses, "cleared") - sumStageExp(theme, buildDefaultThemeProgress(theme).stageStatuses, "cleared");

            return (
              <button
                key={theme.theme_id}
                type="button"
                onClick={() => selectTheme(theme.theme_id)}
                className={
                  selected
                    ? "rounded-sm border border-[#2f7f8f] bg-[#eef7fb] px-4 py-3 text-left shadow-sm"
                    : "rounded-sm border border-line bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#c2b096]"
                }
              >
                <p className="text-sm font-bold text-slate-900">{theme.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{theme.short_name}</p>
                <p className="mt-2 text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">{progressCount}</p>
                <p className="mt-1 text-xs font-semibold text-[#53766f]">EXP {exp.toLocaleString()}</p>
              </button>
            );
          })}
        </div>
      </DashboardCard>

      <DashboardCard title="RPGフィールド" subtitle="地図から敵に触れて、戦闘画面へ入る。ドラクエ3っぽい見た目を優先した画面。">
        <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[28px] border border-[#9fc1ae] bg-[linear-gradient(180deg,#243a2a_0%,#17251c_45%,#0f1511_100%)] p-4 text-[#f2f0e7] shadow-[0_18px_50px_rgba(17,24,39,0.22)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.22em] text-[#c9d6c6] uppercase">FIELD MAP</p>
                <h3 className="mt-1 text-2xl font-black text-white">{activeTheme.name}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#d8e2d8]">{activeTheme.description}</p>
              </div>
              <div className="rounded-2xl border border-[#5f7c67] bg-[#101913] px-4 py-3 text-center">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#b7c5b4] uppercase">PROGRESS</p>
                <p className="mt-1 text-lg font-black text-[#f3c57a]">
                  {clearedStages}/{totalStages}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-[18px] border border-[#536c57] bg-[#101913] px-3 py-3">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-[#b7c5b4] uppercase">PLAYER LV</p>
                <p className="mt-1 text-xl font-black text-white">{activeTheme.player.level}</p>
              </div>
              <div className="rounded-[18px] border border-[#536c57] bg-[#101913] px-3 py-3">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-[#b7c5b4] uppercase">EXP</p>
                <p className="mt-1 text-xl font-black text-[#8de0b1]">{currentExp.toLocaleString()}</p>
              </div>
              <div className="rounded-[18px] border border-[#536c57] bg-[#101913] px-3 py-3">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-[#b7c5b4] uppercase">NEXT</p>
                <p className="mt-1 text-xl font-black text-white">{activeTheme.player.next_level_exp.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-[#4d674f] bg-[linear-gradient(180deg,#2b4230_0%,#22362a_100%)] p-3">
              {activeTheme.worlds.map((world, worldIndex) => (
                <section key={world.world_id} className={worldIndex > 0 ? "mt-4" : ""}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-[#b7c5b4] uppercase">WORLD {worldIndex + 1}</p>
                      <h4 className="mt-1 text-base font-black text-white">{world.title}</h4>
                    </div>
                    <span className="rounded-full border border-[#5f7c67] bg-[#101913] px-3 py-1 text-[11px] font-semibold text-[#c9d6c6]">
                      {world.stages.length} nodes
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {world.stages.map((stage, stageIndex) => (
                      <StageRow
                        key={stage.stage_id}
                        stage={stage}
                        index={stageIndex}
                        status={progress.stageStatuses[stage.stage_id] ?? stage.status}
                        selected={selectedStage?.stage_id === stage.stage_id}
                        onSelect={selectStage}
                        onAdvance={(stageId) => enterBattle(stageId)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-[#d9d0bd] bg-[linear-gradient(180deg,#1f3341_0%,#121a23_100%)] p-4 text-[#f4eddc] shadow-[0_16px_50px_rgba(17,24,39,0.18)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.24em] text-[#c8d1d6] uppercase">BATTLE SCREEN</p>
                  <h3 className="mt-1 text-2xl font-black">{selectedStage?.title ?? "フィールドで敵を選んでください"}</h3>
                </div>
                <div className="rounded-full border border-[#5f7584] bg-[#18222c] px-3 py-2 text-xs font-semibold text-[#d7e2e8]">
                  {selectedStage ? getDeviceLabel(selectedStage.device_requirement) : "FIELD"}
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-[#40505c] bg-[radial-gradient(circle_at_top,#2d4659_0%,#16222d_45%,#101820_100%)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-[#c8d1d6] uppercase">ENEMY</p>
                    <h4 className="mt-2 text-xl font-black text-white">{battle.enemyName}</h4>
                  </div>
                  <div className="rounded-[22px] border border-[#576b76] bg-[#101820] px-4 py-3 text-center">
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-[#c8d1d6] uppercase">HP</p>
                    <p className="mt-1 text-2xl font-black text-[#f3c57a]">{battle.enemyHp}</p>
                  </div>
                </div>
                <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#0c1117]">
                  <div className="h-full rounded-full bg-[#d83b31]" style={{ width: `${Math.max(0, (battle.enemyHp / battle.enemyMaxHp) * 100)}%` }} />
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <BattleStat label="MODE" value={battle.phase === "field" ? "FIELD" : battle.phase === "battle" ? "BATTLE" : "VICTORY"} />
                  <BattleStat label="TARGET" value={selectedStage?.stage_type ?? "unknown"} />
                </div>
                <div className="mt-4 rounded-[22px] border border-[#40505c] bg-[#0f1720] px-4 py-4 text-center">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#8aa0ad] uppercase">BATTLE LOG</p>
                  <p className="mt-2 text-sm leading-6 text-[#f4eddc]">{battle.log[0] ?? "敵があらわれた。"}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-[#40505c] bg-[#101820] p-4">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-[#c8d1d6] uppercase">PLAYER</p>
                  <h4 className="mt-2 text-lg font-black text-white">
                    Lv.{activeTheme.player.level} {activeTheme.player.title}
                  </h4>
                  <p className="mt-1 text-sm text-[#c6d1d9]">{activeTheme.description}</p>
                  <p className="mt-3 text-2xl font-black text-[#8de0b1]">{battle.playerHp}</p>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#0c1117]">
                    <div className="h-full rounded-full bg-[#2f7f8f]" style={{ width: `${Math.max(0, (battle.playerHp / battle.playerMaxHp) * 100)}%` }} />
                  </div>
                </div>

                <div className="rounded-[20px] border border-[#40505c] bg-[#17222d] p-4">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-[#c8d1d6] uppercase">COMMAND</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <BattleCommandButton label="こうげき" onClick={() => performBattleCommand("attack")} disabled={battle.phase === "victory" || !selectedStage} />
                    <BattleCommandButton label="とくぎ" onClick={() => performBattleCommand("skill")} disabled={battle.phase === "victory" || !selectedStage} />
                    <BattleCommandButton label="ぼうぎょ" onClick={() => performBattleCommand("guard")} disabled={battle.phase === "victory" || !selectedStage} />
                    <BattleCommandButton label="にげる" onClick={() => performBattleCommand("run")} disabled={!selectedStage} />
                  </div>
                  <div className="mt-3 rounded-2xl border border-[#5f7584] bg-[#0f1720] px-3 py-3">
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-[#8aa0ad] uppercase">操作ヒント</p>
                    <p className="mt-1 text-xs leading-5 text-[#b7c5ce]">フィールドで敵を選ぶと、そのまま戦闘へ入れる。クリアするとステージが進む。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-[#d8e5e8] bg-[#f7fbfa] p-4">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#53766f]">CURRENT QUEST</p>
              <h3 className="mt-1 text-2xl font-black text-slate-900">{selectedStage?.title ?? "ステージを選択してください"}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selectedStage?.summary ?? "ワールドマップから気になるステージを選ぶと、ここに出る。"}</p>
              {selectedStage ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <InfoTile label="World" value={findWorldTitle(activeTheme, selectedStage.stage_id)} />
                  <InfoTile label="EXP" value={`+${selectedStage.exp_reward}`} />
                  <InfoTile label="Stage Type" value={selectedStage.stage_type} />
                  <InfoTile label="Device" value={getDeviceLabel(selectedStage.device_requirement)} />
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => selectedStage && enterBattle(selectedStage.stage_id)}
                  className="rounded-sm border border-[#2f7f8f] bg-[#eef7fb] px-4 py-2 text-sm font-semibold text-[#1f6f91] transition hover:bg-white"
                >
                  戦闘開始
                </button>
                <button
                  type="button"
                  onClick={() => selectedStage && advanceStage(activeTheme, selectedStage.stage_id, progress, setThemeProgress, setActivityMessage)}
                  className="rounded-sm border border-[#d6c8b3] bg-[#fbf8f3] px-4 py-2 text-sm font-semibold text-[#8a6f4f] transition hover:bg-white"
                >
                  ステージを進める
                </button>
                <Link
                  href="/product-lab"
                  className="rounded-sm border border-[#d6c8b3] bg-white px-4 py-2 text-sm font-semibold text-[#8a6f4f] transition hover:bg-[#fbf8f3]"
                >
                  Product Labへ戻る
                </Link>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {activityMessage} このテーマの進捗はこのブラウザの `localStorage` に保存されます。
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <PolicyBlock title="スマホ" body={activeTheme.device_policy.mobile} />
              <PolicyBlock title="デスクトップ" body={activeTheme.device_policy.desktop} />
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <DashboardCard title="取得済みアイテム" subtitle="学習概念を、あとで画像素材に差し替えやすい形で保持。">
          <div className="grid gap-2 sm:grid-cols-2">
            {activeTheme.items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActivityMessage(`${item} を確認しました。`)}
                className="rounded-sm border border-line bg-white px-3 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-[#2f7f8f] hover:bg-[#f7fbfa]"
              >
                {item}
              </button>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="ボスカード" subtitle="ワールドごとの理解確認や実装演習の節目。">
          <div className="grid gap-2 sm:grid-cols-2">
            {activeTheme.bosses.map((boss) => (
              <button
                key={boss}
                type="button"
                onClick={() => setActivityMessage(`${boss} をボスカードとして確認しました。`)}
                className="rounded-sm border border-[#efe2cf] bg-[#fffaf2] px-3 py-3 text-left shadow-sm transition hover:border-[#d29e5d]"
              >
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#9a5b1f]">BOSS</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{boss}</p>
              </button>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

function StageRow({
  stage,
  index,
  status,
  selected,
  onSelect,
  onAdvance
}: {
  stage: LearningRpgStage;
  index: number;
  status: LearningRpgStage["status"];
  selected: boolean;
  onSelect: (stageId: string) => void;
  onAdvance: (stageId: string) => void;
}) {
  return (
    <article
      className={`rounded-[22px] border px-4 py-3 transition ${
        status === "cleared"
          ? "border-[#6f8f72] bg-[#203424] text-[#eef6ec]"
          : status === "in_progress"
            ? "border-[#6c8b70] bg-[#2a4030] text-[#f2f0e7]"
            : "border-[#4b5f50] bg-[#1d2e23] text-[#d9e5d7]"
      } ${selected ? "ring-2 ring-[#f3c57a]/40" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-black ${
            status === "cleared"
              ? "border-[#8cb691] bg-[#101913] text-[#8de0b1]"
              : status === "in_progress"
                ? "border-[#d2bc77] bg-[#101913] text-[#f3c57a]"
                : "border-[#66786a] bg-[#101913] text-[#c9d6c6]"
          }`}
        >
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-inherit">{stage.title}</p>
            {selected ? <span className="rounded-full border border-[#f3c57a]/40 bg-[#101913] px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#f3c57a] uppercase">Selected</span> : null}
          </div>
          <p className="mt-1 text-xs leading-5 text-[#dce7d9]">{stage.summary}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-[#101913] px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#d9e5d7] uppercase">
          {getStatusLabel(status)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <DeviceBadge value={stage.device_requirement} />
        <span className="rounded-full border border-white/10 bg-[#101913] px-2 py-1 text-[11px] font-semibold text-[#d9e5d7]">{stage.stage_type}</span>
        <span className="rounded-full border border-white/10 bg-[#101913] px-2 py-1 text-[11px] font-semibold text-[#d9e5d7]">{stage.exp_reward} EXP</span>
      </div>
      {stage.device_requirement === "desktop_required" ? (
        <p className="mt-2 rounded-[18px] border border-[#e0c79c] bg-[#101913] px-3 py-2 text-xs leading-5 text-[#f3c57a]">
          PC専用ステージ: コード入力・ファイル操作・実行確認が必要です。
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect(stage.stage_id)}
          className="rounded-full border border-[#66786a] bg-[#101913] px-3 py-2 text-xs font-semibold text-[#f2f0e7] transition hover:border-[#f3c57a] hover:text-white"
        >
          詳しく見る
        </button>
        <button
          type="button"
          onClick={() => onAdvance(stage.stage_id)}
          disabled={status === "cleared"}
          className="rounded-full border border-[#f3c57a] bg-[#f3c57a] px-3 py-2 text-xs font-semibold text-[#16222d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          戦う
        </button>
      </div>
    </article>
  );
}

function PolicyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-sm border border-line bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
    </div>
  );
}

function DeviceBadge({ value }: { value: LearningRpgStage["device_requirement"] }) {
  return <span className="mt-3 inline-flex rounded-sm border border-[#d8e5e8] bg-white px-2 py-1 text-[11px] font-semibold text-[#53766f]">{getDeviceLabel(value)}</span>;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-line bg-[#fbfaf6] px-3 py-3">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-white/70 bg-white px-3 py-2 shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-base font-black text-slate-900">{value}</p>
    </div>
  );
}

function BattleStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#40505c] bg-[#101820] px-3 py-3">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-[#8aa0ad] uppercase">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function BattleCommandButton({
  label,
  onClick,
  disabled
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-sm border border-[#5f7584] bg-[#0f1720] px-3 py-3 text-left text-sm font-semibold text-[#f4eddc] transition hover:border-[#f3c57a] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function advanceStage(
  theme: LearningRpgTheme,
  stageId: string,
  progress: ThemeProgress,
  setThemeProgress: Dispatch<SetStateAction<Record<string, ThemeProgress>>>,
  setActivityMessage: (message: string) => void
) {
  const stage = findStage(theme, stageId);
  if (!stage) return;

  const currentStatus = progress.stageStatuses[stageId] ?? stage.status;
  const nextStatus = currentStatus === "locked" ? "in_progress" : currentStatus === "in_progress" ? "cleared" : currentStatus;

  setThemeProgress((current) => {
    const currentTheme = current[theme.theme_id] ?? buildDefaultThemeProgress(theme);
    return {
      ...current,
      [theme.theme_id]: {
        ...currentTheme,
        selectedStageId: stageId,
        stageStatuses: {
          ...currentTheme.stageStatuses,
          [stageId]: nextStatus
        }
      }
    };
  });

  if (currentStatus === "locked") {
    setActivityMessage(`${stage.title} を開始しました。`);
  } else if (currentStatus === "in_progress") {
    setActivityMessage(`${stage.title} をクリアしました。+${stage.exp_reward} EXP`);
  } else {
    setActivityMessage(`${stage.title} はすでにクリア済みです。`);
  }
}

function getPrimaryActionLabel(status: LearningRpgStage["status"]) {
  if (status === "locked") return "開始する";
  if (status === "in_progress") return "クリアする";
  return "クリア済み";
}

function getStatusLabel(status: LearningRpgStage["status"]) {
  if (status === "cleared") return "クリア";
  if (status === "in_progress") return "進行中";
  return "ロック中";
}

function getDeviceLabel(value: LearningRpgStage["device_requirement"]) {
  const labels: Record<LearningRpgStage["device_requirement"], string> = {
    mobile_ok: "スマホOK",
    mobile_preferred: "スマホ推奨",
    both: "スマホ/PC",
    desktop_preferred: "PC推奨",
    desktop_required: "PC専用"
  };

  return labels[value];
}

function getDefaultThemeId(dashboard: LearningRpgDashboard, preferred?: string) {
  if (preferred && dashboard.themes.some((theme) => theme.theme_id === preferred)) return preferred;
  return dashboard.themes[0]?.theme_id ?? "";
}

function buildDefaultProgressMap(dashboard: LearningRpgDashboard) {
  return Object.fromEntries(dashboard.themes.map((theme) => [theme.theme_id, buildDefaultThemeProgress(theme)])) as Record<string, ThemeProgress>;
}

function buildDefaultThemeProgress(theme: LearningRpgTheme): ThemeProgress {
  const stageStatuses: Record<string, LearningRpgStage["status"]> = {};
  let selectedStageId = "";

  for (const world of theme.worlds) {
    for (const stage of world.stages) {
      stageStatuses[stage.stage_id] = stage.status;
      if (!selectedStageId && stage.status !== "cleared") {
        selectedStageId = stage.stage_id;
      }
    }
  }

  if (!selectedStageId) {
    selectedStageId = findFirstStage(theme)?.stage_id ?? "";
  }

  return { selectedStageId, stageStatuses };
}

function loadState(): SavedState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: SavedState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mergeProgressMap(dashboard: LearningRpgDashboard, savedThemes?: Record<string, ThemeProgress>) {
  const base = buildDefaultProgressMap(dashboard);
  if (!savedThemes) return base;

  const merged: Record<string, ThemeProgress> = { ...base };

  for (const theme of dashboard.themes) {
    const saved = savedThemes[theme.theme_id];
    if (!saved) continue;

    const defaultProgress = base[theme.theme_id];
    const validStageIds = new Set<string>();
    for (const world of theme.worlds) {
      for (const stage of world.stages) {
        validStageIds.add(stage.stage_id);
      }
    }

    const stageStatuses = { ...defaultProgress.stageStatuses };
    for (const [stageId, status] of Object.entries(saved.stageStatuses ?? {})) {
      if (validStageIds.has(stageId) && isStageStatus(status)) {
        stageStatuses[stageId] = status;
      }
    }

    const selectedStageId = validStageIds.has(saved.selectedStageId) ? saved.selectedStageId : defaultProgress.selectedStageId;
    merged[theme.theme_id] = { selectedStageId, stageStatuses };
  }

  return merged;
}

function buildDefaultBattleMap(dashboard: LearningRpgDashboard) {
  return Object.fromEntries(
    dashboard.themes.map((theme) => {
      const firstStage = findFirstStage(theme)?.stage_id ?? "";
      return [theme.theme_id, buildBattleStateFromStage(theme, firstStage)];
    })
  ) as Record<string, BattleState>;
}

function mergeBattleMap(dashboard: LearningRpgDashboard, savedBattles?: Record<string, BattleState>) {
  const base = buildDefaultBattleMap(dashboard);
  if (!savedBattles) return base;

  const merged: Record<string, BattleState> = { ...base };
  for (const theme of dashboard.themes) {
    const saved = savedBattles[theme.theme_id];
    if (!saved) continue;
    const stage = findStage(theme, saved.stageId);
    if (!stage) continue;

    merged[theme.theme_id] = clampBattleState(buildBattleStateFromStage(theme, saved.stageId, saved), stage);
  }

  return merged;
}

function buildBattleStateFromStage(theme: LearningRpgTheme, stageId: string, previous?: BattleState): BattleState {
  const stage = findStage(theme, stageId) ?? findFirstStage(theme);
  const enemyMaxHp = Math.max(38, (stage?.exp_reward ?? 20) * 2 + 24);
  const playerMaxHp = 100 + theme.player.level * 8;
  const playerHp = previous?.playerHp && previous.playerHp > 0 ? Math.min(previous.playerHp, playerMaxHp) : playerMaxHp;

  return {
    stageId: stage?.stage_id ?? stageId,
    phase: previous?.phase === "victory" ? "field" : "battle",
    enemyName: stage ? `${stage.title}の敵` : "旅の敵",
    enemyHp: enemyMaxHp,
    enemyMaxHp,
    playerHp,
    playerMaxHp,
    log: stage ? [`${stage.title} に敵が現れた。`] : ["敵が現れた。"]
  };
}

function clampBattleState(state: BattleState, stage: LearningRpgStage): BattleState {
  const enemyMaxHp = Math.max(38, stage.exp_reward * 2 + 24);
  return {
    ...state,
    enemyHp: Math.max(0, Math.min(state.enemyHp, enemyMaxHp)),
    enemyMaxHp,
    playerHp: Math.max(0, Math.min(state.playerHp, state.playerMaxHp)),
    log: state.log.slice(0, 4)
  };
}

function resolveBattleTurn(
  theme: LearningRpgTheme,
  stage: LearningRpgStage,
  battle: BattleState,
  command: "attack" | "skill" | "guard" | "run",
  progress: ThemeProgress
) : BattleTurnResult {
  const nextProgress: ThemeProgress = {
    ...progress,
    selectedStageId: stage.stage_id,
    stageStatuses: { ...progress.stageStatuses }
  };
  const nextLog = [...battle.log];

  if (command === "run") {
    nextLog.unshift("にげだした。");
    return {
      state: { ...battle, phase: "field", log: nextLog.slice(0, 4) },
      progress: nextProgress,
      message: `${stage.title} からにげた。`
    };
  }

  if (battle.phase === "victory") {
    return {
      state: battle,
      progress: nextProgress,
      message: `${stage.title} はクリア済みです。`
    };
  }

  const attackPower = command === "attack" ? 24 + theme.player.level : 36 + theme.player.level;
  const enemyHp = Math.max(0, battle.enemyHp - attackPower);
  nextLog.unshift(command === "attack" ? "こうげきした。" : "とくぎをつかった。");

  if (enemyHp <= 0) {
    nextProgress.stageStatuses[stage.stage_id] = "cleared";
    nextLog.unshift(`${stage.title} をたおした。`);
    return {
      state: {
        ...battle,
        phase: "victory",
        enemyHp: 0,
        log: nextLog.slice(0, 4)
      },
      progress: nextProgress,
      message: `${stage.title} をクリア！ +${stage.exp_reward} EXP`
    };
  }

  const guard = command === "guard";
  const enemyDamage = guard ? 4 : 10 + Math.floor(stage.exp_reward / 10);
  const playerHp = Math.max(0, battle.playerHp - enemyDamage);
  nextLog.unshift(guard ? "ぼうぎょした。" : `${battle.enemyName} のこうげき！`);

  return {
    state: {
      ...battle,
      phase: "battle",
      enemyHp,
      playerHp,
      log: nextLog.slice(0, 4)
    },
    progress: nextProgress,
    message: guard ? "しっかり守った。" : `${battle.enemyName} の攻撃を受けた。`
  };
}

function isStageStatus(value: unknown): value is LearningRpgStage["status"] {
  return value === "cleared" || value === "in_progress" || value === "locked";
}

function countStages(theme: LearningRpgTheme, statuses?: Record<string, LearningRpgStage["status"]>, match?: LearningRpgStage["status"]) {
  let count = 0;
  for (const world of theme.worlds) {
    for (const stage of world.stages) {
      const current = statuses?.[stage.stage_id] ?? stage.status;
      if (!match || current === match) count += 1;
    }
  }
  return count;
}

function sumStageExp(theme: LearningRpgTheme, statuses: Record<string, LearningRpgStage["status"]>, match: LearningRpgStage["status"]) {
  let total = 0;
  for (const world of theme.worlds) {
    for (const stage of world.stages) {
      if ((statuses[stage.stage_id] ?? stage.status) === match) {
        total += stage.exp_reward;
      }
    }
  }
  return total;
}

function findStage(theme: LearningRpgTheme, stageId: string) {
  for (const world of theme.worlds) {
    for (const stage of world.stages) {
      if (stage.stage_id === stageId) return stage;
    }
  }
  return undefined;
}

function findFirstStage(theme: LearningRpgTheme) {
  for (const world of theme.worlds) {
    if (world.stages[0]) return world.stages[0];
  }
  return undefined;
}

function findWorldTitle(theme: LearningRpgTheme, stageId: string) {
  for (const world of theme.worlds) {
    if (world.stages.some((stage) => stage.stage_id === stageId)) {
      return world.title;
    }
  }
  return "";
}

function getSelectedStatus(theme: LearningRpgTheme, progress: ThemeProgress, stageId: string) {
  const stage = findStage(theme, stageId);
  return progress.stageStatuses[stageId] ?? stage?.status ?? "locked";
}
