import type { ReactNode } from "react";

import {
  FIELD_HEIGHT,
  FIELD_WIDTH,
  type FieldDefinition,
  TREASURE_CHEST_ID,
  equipment,
  getFieldTransition,
  getNextLevel,
  type Enemy,
  type Equipment,
  type GameState,
  type Player,
  tileClass
} from "@/lib/learning-rpg-game";

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
        <div className="grid overflow-hidden rounded-[6px] border border-[#394b39]" style={{ gridTemplateColumns: `repeat(${FIELD_WIDTH}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${FIELD_HEIGHT}, minmax(0, 1fr))` }}>
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
                  {playerHere ? <div className="absolute inset-2 grid place-items-center rounded-[4px] border border-[#f3c57a] bg-[#101820] text-sm font-black text-[#f3c57a]">勇</div> : null}
                  {!playerHere && label ? <span className={`absolute inset-0 grid place-items-center text-[10px] font-black ${tile === "forest" || tile === "boss" || tile === "goal" ? "text-white" : "text-[#16222d]"}`}>{label}</span> : null}
                </div>
              );
            })
          )}
        </div>

        <div className="grid gap-3 content-start">
          <div className="rounded-[6px] border border-[#40505c] bg-[#101820] p-3">
            <p className="text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">FIELD INFO</p>
            <div className="mt-3 grid gap-2 text-sm">
              <Info label="FIELD ID" value={field.fieldId} dark />
              <Info label="SIZE" value={`${FIELD_WIDTH} × ${FIELD_HEIGHT}`} dark />
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
  onAttack,
  onFire,
  onHeal,
  onHerb,
  onFlee
}: {
  enemy: Enemy | null;
  player: Player;
  herbCount: number;
  onAttack: () => void;
  onFire: () => void;
  onHeal: () => void;
  onHerb: () => void;
  onFlee: () => void;
}) {
  if (!enemy) return null;
  return (
    <GamePanel title="戦闘" subtitle={`${enemy.name}があらわれた`}>
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <FighterWindow name={player.name} hp={player.hp} maxHp={player.maxHp} mp={player.mp} maxMp={player.maxMp} />
          <FighterWindow name={enemy.name} hp={enemy.hp} maxHp={enemy.maxHp} />
        </div>
        <div className="grid min-h-[180px] place-items-center rounded-[6px] border border-[#40505c] bg-[radial-gradient(circle_at_top,#334a58_0%,#17222d_48%,#101820_100%)]">
          <div className="grid h-24 w-28 place-items-center rounded-[6px] border border-[#7c5f5f] bg-[#2a1c1c] text-center text-sm font-black text-[#f4eddc] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
            {enemy.name}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <CommandButton label="たたかう" detail="通常攻撃" onClick={onAttack} />
          <CommandButton label="火の玉" detail="MP 3 / 強攻撃" onClick={onFire} disabled={player.mp < 3} />
          <CommandButton label="小回復" detail="MP 3 / ターン消費" onClick={onHeal} disabled={player.mp < 3} />
          <CommandButton label={`薬草 ${herbCount}`} detail="HP回復 / ターン消費" onClick={onHerb} disabled={herbCount <= 0} />
          <CommandButton label="にげる" detail={enemy.role === "mini_boss" ? "小ボス戦は不可" : "成功率70%"} onClick={onFlee} />
        </div>
      </div>
    </GamePanel>
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
