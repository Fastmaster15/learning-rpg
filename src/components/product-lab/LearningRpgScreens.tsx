import type { ReactNode } from "react";

import {
  type FieldDefinition,
  TREASURE_CHEST_ID,
  equipment,
  getFieldTransition,
  getNextLevel,
  type BattleCue,
  type Enemy,
  type Equipment,
  type GameState,
  type Player,
  tileClass
} from "@/lib/learning-rpg-game";
import { HeroSprite } from "@/components/product-lab/learning-rpg/HeroSprite";
import { EnemySprite } from "@/components/product-lab/learning-rpg/EnemySprite";
import { BossSprite } from "@/components/product-lab/learning-rpg/BossSprite";

export function StatusBar({ player, attack, defense, nextExp, location }: { player: Player; attack: number; defense: number; nextExp: number; location: string }) {
  return (
    <section className="grid gap-2 rounded-[6px] border border-[#40505c] bg-[#101820] p-3 md:grid-cols-5">
      <Info label="Hero" value={`Lv.${player.level}`} dark />
      <Info label="HP / MP" value={`${player.hp}/${player.maxHp}  ${player.mp}/${player.maxMp}`} dark />
      <Info label="ATK / DEF" value={`${attack} / ${defense}`} dark />
      <Info label="GOLD / NEXT" value={`${player.gold} / ${Math.max(0, nextExp - player.exp)}`} dark />
      <Info label="LOCATION" value={location} dark />
    </section>
  );
}

export function TownScreen({
  game,
  field,
  onNpc,
  onRest,
  onBuy,
  onField,
  onStatus
}: {
  game: GameState;
  field: FieldDefinition;
  onNpc: (kind: "goal" | "heal" | "shop" | "boss" | "world") => void;
  onRest: () => void;
  onBuy: (itemId: "bronze_sword" | "leather_armor") => void;
  onField: () => void;
  onStatus: () => void;
}) {
  return (
    <GamePanel title="はじまりの町" subtitle="安全な拠点">
      <div className="grid gap-4">
        <div className="grid min-h-[260px] grid-cols-5 grid-rows-4 overflow-hidden rounded-[6px] border border-[#394b39]">
          {Array.from({ length: 20 }).map((_, index) => {
            const labels: Record<number, string> = { 2: "宿", 6: "店", 9: "人", 12: "人", 14: "人", 16: "出口", 18: "人" };
            return (
              <button key={index} type="button" onClick={() => handleTownTile(index, onNpc, onRest, onField)} className={`border border-black/20 text-sm font-black ${index === 2 || index === 6 ? "bg-[#7c5f3e]" : index === 16 ? "bg-[#d8c48d] text-[#16222d]" : labels[index] ? "bg-[#617c67]" : "bg-[#91bd74]"}`}>
                {labels[index] ?? ""}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <CommandButton label="町長と話す" detail="目的地を聞く" onClick={() => onNpc("goal")} />
          <CommandButton label="旅人と話す" detail="回復のヒント" onClick={() => onNpc("heal")} />
          <CommandButton label="店主と話す" detail="装備のヒント" onClick={() => onNpc("shop")} />
          <CommandButton label="見張りと話す" detail="森の奥の警告" onClick={() => onNpc("boss")} />
          <CommandButton label="町人と話す" detail="世界観を聞く" onClick={() => onNpc("world")} />
          <CommandButton label="宿屋" detail="HP/MP全回復" onClick={onRest} />
          <CommandButton label="ステータス" detail="強さを見る" onClick={onStatus} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ShopButton item={equipment.bronze_sword} currentId={game.player.weaponId} gold={game.player.gold} onBuy={() => onBuy("bronze_sword")} />
          <ShopButton item={equipment.leather_armor} currentId={game.player.armorId} gold={game.player.gold} onBuy={() => onBuy("leather_armor")} />
        </div>

        <button type="button" onClick={onField} className="rounded-[6px] border border-[#f3c57a] bg-[#f3c57a] px-4 py-4 text-left font-black text-[#16222d] transition hover:bg-white">
          {field.name}へ出る
        </button>
      </div>
    </GamePanel>
  );
}

export function FieldScreen({
  game,
  field,
  onMove,
  onTown,
  onSeek,
  onStatus
}: {
  game: GameState;
  field: FieldDefinition;
  onMove: (direction: "up" | "down" | "left" | "right") => void;
  onTown: () => void;
  onSeek: () => void;
  onStatus: () => void;
}) {
  return (
    <GamePanel title={field.name} subtitle="探索">
      <div className="grid gap-4 xl:grid-cols-[1fr_240px]">
        <div className="overflow-x-auto rounded-[6px] border border-[#394b39] bg-[#1b2b22]">
          <div
            className="grid min-w-max"
            style={{
              gridTemplateColumns: `repeat(${field.width}, minmax(2.25rem, 1fr))`,
              gridTemplateRows: `repeat(${field.height}, minmax(2.25rem, 1fr))`
            }}
          >
            {field.map.flatMap((row, y) =>
              row.map((tile, x) => {
                const playerHere = game.position.x === x && game.position.y === y;
                const transition = getFieldTransition(field.fieldId, { x, y });
                const label =
                  tile === "town"
                    ? "町"
                    : tile === "chest"
                      ? game.openedChestIds.includes(TREASURE_CHEST_ID)
                        ? "空"
                        : "宝"
                      : tile === "boss"
                        ? game.miniBossDefeated
                          ? "静"
                          : "主"
                        : tile === "goal"
                          ? "光"
                          : tile === "gate"
                            ? transition?.label ?? "門"
                            : "";

                return (
                  <div key={`${x}-${y}`} className={`relative border border-black/20 ${tileClass(tile)}`}>
                    {playerHere ? <HeroSprite /> : null}
                    {!playerHere && label ? <span className={`absolute inset-0 grid place-items-center text-[10px] font-black ${tile === "forest" || tile === "boss" || tile === "goal" ? "text-white" : "text-[#16222d]"}`}>{label}</span> : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="grid gap-3 content-start">
          <div className="rounded-[6px] border border-[#40505c] bg-[#101820] p-3">
            <p className="text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">FIELD INFO</p>
            <div className="mt-3 grid gap-2 text-sm">
              <Info label="FIELD ID" value={field.fieldId} dark />
              <Info label="SIZE" value={`${field.width} × ${field.height}`} dark />
              <Info label="GOAL" value={field.description} dark />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span />
            <CommandButton label="↑" detail="北" onClick={() => onMove("up")} />
            <span />
            <CommandButton label="←" detail="西" onClick={() => onMove("left")} />
            <CommandButton label="↓" detail="南" onClick={() => onMove("down")} />
            <CommandButton label="→" detail="東" onClick={() => onMove("right")} />
          </div>
          <CommandButton label="敵を探す" detail="その場で遭遇" onClick={onSeek} />
          <CommandButton label="町に戻る" detail="回復と準備" onClick={onTown} />
          <CommandButton label="ステータス" detail="強さを見る" onClick={onStatus} />
        </div>
      </div>
    </GamePanel>
  );
}

export function BattleScreen({
  enemy,
  player,
  herbCount,
  battleCue,
  onAttack,
  onFire,
  onHeal,
  onHerb,
  onFlee
}: {
  enemy: Enemy | null;
  player: Player;
  herbCount: number;
  battleCue?: BattleCue | null;
  onAttack: () => void;
  onFire: () => void;
  onHeal: () => void;
  onHerb: () => void;
  onFlee: () => void;
}) {
  if (!enemy) return null;
  const bossBattle = enemy.role === "mini_boss";
  const bossAction = battleCue?.kind === "boss-attack";
  const bossSpecial = bossAction && battleCue.special;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-3 backdrop-blur-[2px]">
      <section className="w-full max-w-6xl rounded-[8px] border border-[#566c7c] bg-[linear-gradient(180deg,#1b2833_0%,#101820_100%)] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.48)] md:p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#c8d1d6] uppercase">戦闘窓</p>
            <h2 className="mt-1 text-xl font-black text-white">{enemy.name}があらわれた</h2>
          </div>
          <div className="rounded-full border border-[#f3c57a] bg-[#f3c57a] px-3 py-1 text-xs font-black text-[#16222d]">
            FIELD BATTLE
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <FighterWindow name={player.name} hp={player.hp} maxHp={player.maxHp} mp={player.mp} maxMp={player.maxMp} />
                <FighterWindow name={enemy.name} hp={enemy.hp} maxHp={enemy.maxHp} />
              </div>
              <div className="relative overflow-hidden rounded-[8px] border border-[#40505c] bg-[radial-gradient(circle_at_top,#334a58_0%,#17222d_48%,#101820_100%)]">
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(243,197,122,0.14),transparent_35%),radial-gradient(circle_at_80%_24%,rgba(141,224,177,0.12),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.05),transparent_30%)] ${bossAction ? "animate-[boss-aura_0.65s_ease-in-out_1]" : ""}`} />
                <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#f3c57a]/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1118]/55 to-transparent" />
                <div className="absolute left-6 top-6 h-24 w-24 rounded-full bg-[#6da1c9]/14 blur-2xl" />
                <div className="absolute right-8 top-10 h-28 w-28 rounded-full bg-[#8de0b1]/10 blur-3xl" />
                <div className="relative grid min-h-[300px] grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 md:min-h-[330px]">
                  <div className="grid justify-items-start gap-2">
                    <div className="text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">Hero</div>
                    <div className={`relative h-[208px] w-[208px] animate-[battle-bob_3s_ease-in-out_infinite] ${bossAction ? "translate-x-1" : ""}`}>
                      <HeroSprite />
                    </div>
                  </div>
                  <div className="relative h-[220px] w-10">
                    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#f3c57a]/40 to-transparent" />
                    <div className={`absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f3c57a]/15 blur-xl ${bossSpecial ? "animate-[battle-flash_0.9s_ease-in-out_1]" : bossAction ? "animate-[battle-flash_0.55s_ease-in-out_1]" : "animate-[battle-flash_2.8s_ease-in-out_infinite]"}`} />
                    <div className={`absolute left-0 top-1/2 h-[4px] w-14 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-[#fff3bf] to-transparent blur-[1px] ${bossSpecial ? "animate-[battle-slash-strong_0.85s_ease-in-out_1]" : bossAction ? "animate-[battle-slash-hit_0.55s_ease-in-out_1]" : "animate-[battle-slash_1.7s_ease-in-out_infinite]"}`} />
                    <div className={`absolute left-1 top-[calc(50%-24px)] h-12 w-12 rounded-full bg-[#fff3bf]/20 blur-2xl ${bossSpecial ? "animate-[battle-flash-strong_0.85s_ease-in-out_1]" : bossAction ? "animate-[battle-flash-hit_0.55s_ease-in-out_1]" : "animate-[battle-flash_2.8s_ease-in-out_infinite]"}`} />
                  </div>
                  <div className="grid justify-items-end gap-2">
                    <div className="text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">Enemy</div>
                    <div
                      className={`relative ${bossBattle ? "h-[320px] w-[320px] md:h-[390px] md:w-[390px]" : "h-[208px] w-[208px]"} animate-[battle-bob_3.6s_ease-in-out_infinite] ${
                        bossSpecial
                          ? "translate-x-[-18px] scale-[1.03]"
                          : bossAction
                            ? "translate-x-[-10px] scale-[1.02]"
                            : bossBattle
                              ? "scale-[1.02]"
                              : ""
                      }`}
                    >
                      {bossBattle ? <BossSprite /> : <EnemySprite enemy={enemy} />}
                      {bossBattle ? (
                        <div
                          className={`absolute inset-0 rounded-[12px] border border-[#b0d65f]/30 ${
                            bossSpecial ? "animate-[boss-lunge_0.85s_ease-out_1]" : bossAction ? "animate-[boss-thump_0.55s_ease-out_1]" : "animate-[boss-breath_4s_ease-in-out_infinite]"
                          }`}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
                {bossBattle && bossAction ? (
                  <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-[#d8ff7a]/40 bg-[#16220f]/80 px-4 py-2 text-xs font-black tracking-[0.2em] text-[#d8ff7a] shadow-[0_0_30px_rgba(216,255,122,0.2)]">
                    {bossSpecial ? battleCue?.moveName ?? "森の主の大技" : "森の主の一撃"}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="grid gap-3 content-start">
              <MessageWindow title="BATTLE LOG">
                <div className="grid gap-2 text-sm leading-6">
                  <p>{enemy.name}との戦闘が始まった。</p>
                  <p>フィールドを背景に、左に主人公、右に敵が並ぶFF風の構図にしている。</p>
                  <p>{bossBattle ? "森の主は大きく表示し、大技のたびに揺れと光が走る。" : "斬撃の線と光を少しだけ入れて、戦っている感を強めた。"}</p>
                </div>
              </MessageWindow>
              <MessageWindow title="TACTICS">
                <div className="grid gap-2 text-sm leading-6">
                  <p>たたかう: 安定した通常攻撃。</p>
                  <p>火の玉: MPを使って強く攻める。</p>
                  <p>回復: 小回復か薬草で立て直す。</p>
                </div>
              </MessageWindow>
            </div>
          </div>
          <div className="rounded-[8px] border border-[#566c7c] bg-[#0f151c] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-bold tracking-[0.18em] text-[#c8d1d6] uppercase">COMMAND</p>
              <p className="text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">Choose your move</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <CommandButton label="たたかう" detail="通常攻撃" onClick={onAttack} />
              <CommandButton label="火の玉" detail="MP 3 / 強攻撃" onClick={onFire} disabled={player.mp < 3} />
              <CommandButton label="小回復" detail="MP 3 / ターン消費" onClick={onHeal} disabled={player.mp < 3} />
              <CommandButton label={`薬草 ${herbCount}`} detail="HP回復 / ターン消費" onClick={onHerb} disabled={herbCount <= 0} />
              <CommandButton label="にげる" detail={enemy.role === "mini_boss" ? "小ボス戦は不可" : "成功率70%"} onClick={onFlee} />
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes battle-bob {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-6px);
            }
          }
          @keyframes battle-slash {
            0%,
            72% {
              opacity: 0;
              transform: translateX(-12px) scaleX(0.4);
            }
            78% {
              opacity: 1;
              transform: translateX(0) scaleX(1);
            }
            88% {
              opacity: 0.2;
              transform: translateX(6px) scaleX(0.7);
            }
            100% {
              opacity: 0;
              transform: translateX(12px) scaleX(0.3);
            }
          }
          @keyframes battle-flash {
            0%,
            74% {
              opacity: 0;
            }
            80% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }
          @keyframes battle-intro-pulse {
            0%,
            100% {
              transform: scale(0.9);
              opacity: 0.55;
            }
            50% {
              transform: scale(1.05);
              opacity: 1;
            }
          }
          @keyframes battle-flash-strong {
            0%,
            72% {
              opacity: 0;
              transform: scale(0.7);
            }
            80% {
              opacity: 1;
              transform: scale(1.25);
            }
            100% {
              opacity: 0;
              transform: scale(1.05);
            }
          }
          @keyframes battle-flash-hit {
            0%,
            72% {
              opacity: 0;
              transform: scale(0.75);
            }
            85% {
              opacity: 1;
              transform: scale(1.1);
            }
            100% {
              opacity: 0;
              transform: scale(0.95);
            }
          }
          @keyframes battle-slash-strong {
            0%,
            70% {
              opacity: 0;
              transform: translateX(-24px) scaleX(0.2);
            }
            78% {
              opacity: 1;
              transform: translateX(0) scaleX(1);
            }
            88% {
              opacity: 0.65;
              transform: translateX(12px) scaleX(1.2);
            }
            100% {
              opacity: 0;
              transform: translateX(24px) scaleX(0.1);
            }
          }
          @keyframes battle-slash-hit {
            0%,
            75% {
              opacity: 0;
              transform: translateX(-16px) scaleX(0.3);
            }
            86% {
              opacity: 0.9;
              transform: translateX(0) scaleX(1);
            }
            100% {
              opacity: 0;
              transform: translateX(10px) scaleX(0.4);
            }
          }
          @keyframes boss-lunge {
            0%,
            100% {
              transform: scale(1);
            }
            45% {
              transform: scale(1.05);
            }
            60% {
              transform: scale(1.08) translateX(-6px);
            }
          }
          @keyframes boss-thump {
            0%,
            100% {
              transform: scale(1);
            }
            60% {
              transform: scale(1.03) translateX(-4px);
            }
          }
          @keyframes boss-breath {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.015);
            }
          }
          @keyframes boss-aura {
            0%,
            100% {
              opacity: 0.2;
            }
            50% {
              opacity: 0.45;
            }
          }
        `}</style>
      </section>
    </div>
  );
}

export function StatusScreen({ player, attack, defense, onBack }: { player: Player; attack: number; defense: number; onBack: () => void }) {
  const next = getNextLevel(player.level);
  return (
    <GamePanel title="ステータス" subtitle="現在の強さ">
      <div className="grid gap-3 md:grid-cols-2">
        <Info label="名前" value={player.name} />
        <Info label="レベル" value={String(player.level)} />
        <Info label="HP" value={`${player.hp}/${player.maxHp}`} />
        <Info label="MP" value={`${player.mp}/${player.maxMp}`} />
        <Info label="攻撃力" value={String(attack)} />
        <Info label="防御力" value={String(defense)} />
        <Info label="経験値" value={String(player.exp)} />
        <Info label="次のレベル" value={next ? `${Math.max(0, next.requiredExp - player.exp)} EXP` : "MAX"} />
        <Info label="ゴールド" value={String(player.gold)} />
        <Info label="武器" value={equipment[player.weaponId].name} />
        <Info label="防具" value={equipment[player.armorId].name} />
      </div>
      <button type="button" onClick={onBack} className="mt-4 rounded-[6px] border border-[#f3c57a] bg-[#f3c57a] px-4 py-3 text-left font-black text-[#16222d] transition hover:bg-white">
        前の画面へ戻る
      </button>
    </GamePanel>
  );
}

function handleTownTile(index: number, onNpc: (kind: "goal" | "heal" | "shop" | "boss" | "world") => void, onRest: () => void, onField: () => void) {
  if (index === 2) onRest();
  if (index === 6) onNpc("shop");
  if (index === 9) onNpc("goal");
  if (index === 12) onNpc("heal");
  if (index === 14) onNpc("boss");
  if (index === 16) onField();
  if (index === 18) onNpc("world");
}

function GamePanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-[6px] border border-[#40505c] bg-[linear-gradient(180deg,#17222d_0%,#101820_100%)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div className="mb-4">
        <p className="text-xs font-bold tracking-[0.18em] text-[#c8d1d6] uppercase">{title}</p>
        <h2 className="mt-1 text-xl font-black text-white">{subtitle}</h2>
      </div>
      {children}
    </section>
  );
}

export function MessageWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[6px] border border-[#40505c] bg-[#101820] p-4 text-sm leading-6 text-[#d7e0e8]">
      <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">{title}</p>
      {children}
    </section>
  );
}

function CommandButton({ label, detail, onClick, disabled }: { label: string; detail: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="rounded-[6px] border border-[#5f7584] bg-[#101820] px-4 py-3 text-left text-sm font-bold text-[#f4eddc] transition hover:border-[#f3c57a] disabled:cursor-not-allowed disabled:opacity-40">
      <span className="block text-base text-white">{label}</span>
      <span className="mt-1 block text-xs font-semibold text-[#b7c5ce]">{detail}</span>
    </button>
  );
}

function ShopButton({ item, currentId, gold, onBuy }: { item: Equipment; currentId: string; gold: number; onBuy: () => void }) {
  const owned = currentId === item.id;
  return (
    <button type="button" onClick={onBuy} disabled={owned || gold < item.price} className="rounded-[6px] border border-[#5f7584] bg-[#101820] px-4 py-3 text-left text-sm font-bold text-[#f4eddc] transition hover:border-[#f3c57a] disabled:cursor-not-allowed disabled:opacity-55">
      <span className="block text-base text-white">{item.name}</span>
      <span className="mt-1 block text-xs font-semibold text-[#b7c5ce]">{owned ? "装備中" : `${item.price} GOLD`}</span>
    </button>
  );
}

function FighterWindow({ name, hp, maxHp, mp, maxMp }: { name: string; hp: number; maxHp: number; mp?: number; maxMp?: number }) {
  return (
    <div className="rounded-[6px] border border-[#40505c] bg-[#101820] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-black text-white">{name}</p>
        <p className="text-sm font-bold text-[#f3c57a]">HP {hp}/{maxHp}</p>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#0d1118]">
        <div className="h-full bg-[#d83b31] transition-all" style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%` }} />
      </div>
      {typeof mp === "number" && typeof maxMp === "number" ? (
        <p className="mt-2 text-sm font-bold text-[#8de0b1]">MP {mp}/{maxMp}</p>
      ) : null}
    </div>
  );
}

function Info({ label, value, dark }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={`rounded-[6px] border px-3 py-3 ${dark ? "border-[#40505c] bg-[#0d1118]" : "border-[#40505c] bg-[#101820]"}`}>
      <p className="text-xs font-bold tracking-[0.12em] text-[#8aa0ad] uppercase">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}
