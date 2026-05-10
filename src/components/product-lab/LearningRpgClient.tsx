"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LearningRpgDashboard } from "@/lib/learning-rpg";

const STORAGE_KEY = "learning-rpg.classic-loop.v1";

type Screen = "title" | "town" | "field" | "battle" | "status";
type InventoryItem = { itemId: string; count: number };
type Enemy = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldReward: number;
  area: "grassland" | "forest";
};

type Player = {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  exp: number;
  gold: number;
  weaponId: string;
  armorId: string;
  items: InventoryItem[];
};

type Position = { x: number; y: number };
type GameState = {
  started: boolean;
  screen: Screen;
  player: Player;
  position: Position;
  currentEnemy: Enemy | null;
  log: string[];
  dialogue: string;
  steps: number;
  objectiveCleared: boolean;
};

type Equipment = {
  id: string;
  name: string;
  type: "weapon" | "armor";
  price: number;
  attack?: number;
  defense?: number;
};

type LearningRpgClientProps = {
  dashboard: LearningRpgDashboard;
  initialThemeId?: string;
};

const levelTable = [
  { level: 1, requiredExp: 0 },
  { level: 2, requiredExp: 12 },
  { level: 3, requiredExp: 32 },
  { level: 4, requiredExp: 65 },
  { level: 5, requiredExp: 110 }
];

const equipment: Record<string, Equipment> = {
  wooden_sword: { id: "wooden_sword", name: "木の短剣", type: "weapon", price: 0, attack: 0 },
  bronze_sword: { id: "bronze_sword", name: "青銅の剣", type: "weapon", price: 32, attack: 4 },
  cloth_armor: { id: "cloth_armor", name: "旅人の服", type: "armor", price: 0, defense: 0 },
  leather_armor: { id: "leather_armor", name: "革のよろい", type: "armor", price: 28, defense: 3 }
};

const enemies: Enemy[] = [
  {
    id: "soft_blob",
    name: "ぷるぷる",
    hp: 10,
    maxHp: 10,
    attack: 4,
    defense: 1,
    expReward: 4,
    goldReward: 6,
    area: "grassland"
  },
  {
    id: "night_bat",
    name: "よるこうもり",
    hp: 16,
    maxHp: 16,
    attack: 6,
    defense: 2,
    expReward: 7,
    goldReward: 10,
    area: "grassland"
  },
  {
    id: "wild_boar",
    name: "あばれイノシシ",
    hp: 26,
    maxHp: 26,
    attack: 9,
    defense: 3,
    expReward: 12,
    goldReward: 18,
    area: "forest"
  }
];

const fieldMap = [
  ["water", "grass", "grass", "forest", "goal"],
  ["town", "road", "grass", "forest", "forest"],
  ["water", "road", "grass", "grass", "hill"],
  ["water", "grass", "forest", "road", "hill"],
  ["shore", "grass", "grass", "road", "water"]
] as const;

const initialPlayer: Player = {
  name: "Hero",
  level: 1,
  hp: 24,
  maxHp: 24,
  mp: 6,
  maxMp: 6,
  attack: 7,
  defense: 4,
  exp: 0,
  gold: 30,
  weaponId: "wooden_sword",
  armorId: "cloth_armor",
  items: [{ itemId: "herb", count: 2 }]
};

const initialGameState: GameState = {
  started: false,
  screen: "title",
  player: initialPlayer,
  position: { x: 1, y: 1 },
  currentEnemy: null,
  log: ["旅の準備ができた。"],
  dialogue: "町の人に話しかけて、北の森へ向かう目的を聞こう。",
  steps: 0,
  objectiveCleared: false
};

export function LearningRpgClient({ dashboard }: LearningRpgClientProps) {
  const [game, setGame] = useState<GameState>(initialGameState);
  const [hasSave, setHasSave] = useState(false);
  const player = game.player;
  const attack = player.attack + (equipment[player.weaponId]?.attack ?? 0);
  const defense = player.defense + (equipment[player.armorId]?.defense ?? 0);
  const nextLevel = getNextLevel(player.level);
  const herbCount = getItemCount(player, "herb");

  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setHasSave(true);
      setGame(saved);
    }
  }, []);

  useEffect(() => {
    if (game.started) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
      setHasSave(true);
    }
  }, [game]);

  function startNewGame() {
    setGame({
      ...initialGameState,
      started: true,
      screen: "town",
      log: ["朝の町に着いた。", "北の森で小さな光が見えたらしい。"]
    });
  }

  function continueGame() {
    const saved = loadGame();
    if (saved) setGame({ ...saved, screen: saved.screen === "title" ? "town" : saved.screen });
  }

  function setScreen(screen: Screen) {
    setGame((current) => ({ ...current, screen }));
  }

  function talkToNpc(kind: "goal" | "heal" | "shop" | "world") {
    const lines = {
      goal: "北の森で、あやしい光を見た人がいるらしい。道を外れすぎる前に戻れる場所を覚えておけ。",
      heal: "傷ついたら無理をするな。町に戻って休めば、また遠くまで歩ける。",
      shop: "森に行くなら、少し良い武器を持つと安心だよ。ゴールドは使ってこそ力になる。",
      world: "この町は旅人たちの休み場さ。外は静かだけど、森の奥は少しだけ空気が違う。"
    };
    setGame((current) => ({ ...current, dialogue: lines[kind], log: [lines[kind], ...current.log].slice(0, 8) }));
  }

  function restAtInn() {
    setGame((current) => ({
      ...current,
      player: { ...current.player, hp: current.player.maxHp, mp: current.player.maxMp },
      dialogue: "宿屋で体を休めた。HPとMPが全回復した。",
      log: ["宿屋で休んだ。", "HPとMPが全回復した。", ...current.log].slice(0, 8)
    }));
  }

  function buyEquipment(itemId: "bronze_sword" | "leather_armor") {
    const item = equipment[itemId];
    setGame((current) => {
      const alreadyEquipped = current.player.weaponId === itemId || current.player.armorId === itemId;
      if (alreadyEquipped) {
        return { ...current, dialogue: `${item.name} はもう装備している。` };
      }
      if (current.player.gold < item.price) {
        return { ...current, dialogue: `${item.name} を買うにはゴールドが足りない。` };
      }

      const nextPlayer =
        item.type === "weapon"
          ? { ...current.player, gold: current.player.gold - item.price, weaponId: item.id }
          : { ...current.player, gold: current.player.gold - item.price, armorId: item.id };

      return {
        ...current,
        player: nextPlayer,
        dialogue: `${item.name} を買って装備した。`,
        log: [`${item.name} を装備した。`, ...current.log].slice(0, 8)
      };
    });
  }

  function move(direction: "up" | "down" | "left" | "right") {
    setGame((current) => {
      const nextPosition = {
        x: current.position.x + (direction === "right" ? 1 : direction === "left" ? -1 : 0),
        y: current.position.y + (direction === "down" ? 1 : direction === "up" ? -1 : 0)
      };

      if (!isInsideMap(nextPosition)) {
        return { ...current, log: ["そこから先へは進めない。", ...current.log].slice(0, 8) };
      }

      const tile = getTile(nextPosition);
      if (tile === "water") {
        return { ...current, log: ["水辺が行く手をふさいでいる。", ...current.log].slice(0, 8) };
      }

      if (tile === "town") {
        return {
          ...current,
          screen: "town",
          position: nextPosition,
          currentEnemy: null,
          log: ["町に戻った。", ...current.log].slice(0, 8),
          dialogue: "町に戻ると少し安心する。宿屋と店で準備しよう。"
        };
      }

      if (tile === "goal") {
        return {
          ...current,
          position: nextPosition,
          objectiveCleared: true,
          log: ["北の森の光を見つけた。最初の小目標を達成した！", ...current.log].slice(0, 8),
          dialogue: "森の奥に小さな光が残っている。次の章へ進めそうだ。"
        };
      }

      const steps = current.steps + 1;
      const enemy = shouldEncounter(tile, steps) ? spawnEnemy(tile) : null;
      if (enemy) {
        return {
          ...current,
          screen: "battle",
          position: nextPosition,
          currentEnemy: enemy,
          steps,
          log: [`${enemy.name} があらわれた！`, ...current.log].slice(0, 8)
        };
      }

      return {
        ...current,
        position: nextPosition,
        steps,
        log: [`${tileLabel(tile)} を進んだ。`, ...current.log].slice(0, 8)
      };
    });
  }

  function seekBattle() {
    setGame((current) => {
      const tile = getTile(current.position);
      const enemy = spawnEnemy(tile === "forest" ? "forest" : "grass");
      return {
        ...current,
        screen: "battle",
        currentEnemy: enemy,
        log: [`${enemy.name} があらわれた！`, ...current.log].slice(0, 8)
      };
    });
  }

  function attackEnemy() {
    setGame((current) => {
      if (!current.currentEnemy) return current;
      const playerDamage = calcDamage(getAttack(current.player), current.currentEnemy.defense);
      const enemy = { ...current.currentEnemy, hp: Math.max(0, current.currentEnemy.hp - playerDamage) };
      const logs = [`${current.player.name}のこうげき！`, `${enemy.name}に${playerDamage}のダメージ！`];
      if (enemy.hp <= 0) {
        return winBattle(current, logs);
      }
      return enemyTurn({ ...current, currentEnemy: enemy }, logs);
    });
  }

  function castSpell(spell: "fire" | "heal") {
    setGame((current) => {
      if (!current.currentEnemy) return current;
      if (current.player.mp < 3) {
        return { ...current, log: ["MPが足りない。", ...current.log].slice(0, 8) };
      }
      const player = { ...current.player, mp: current.player.mp - 3 };
      if (spell === "heal") {
        const healed = Math.min(player.maxHp, player.hp + 18);
        return {
          ...current,
          player: { ...player, hp: healed },
          log: [`${current.player.name}は小回復を唱えた。`, `HPが${healed - player.hp}回復した。`, ...current.log].slice(0, 8)
        };
      }

      const enemy = { ...current.currentEnemy, hp: Math.max(0, current.currentEnemy.hp - 12) };
      const logs = [`${current.player.name}は火の玉を唱えた！`, `${enemy.name}に12のダメージ！`];
      if (enemy.hp <= 0) {
        return winBattle({ ...current, player, currentEnemy: enemy }, logs);
      }
      return enemyTurn({ ...current, player, currentEnemy: enemy }, logs);
    });
  }

  function useHerb() {
    setGame((current) => {
      if (getItemCount(current.player, "herb") <= 0) {
        return { ...current, log: ["薬草を持っていない。", ...current.log].slice(0, 8) };
      }
      const healed = Math.min(current.player.maxHp, current.player.hp + 20);
      const player = {
        ...current.player,
        hp: healed,
        items: current.player.items.map((item) => (item.itemId === "herb" ? { ...item, count: Math.max(0, item.count - 1) } : item))
      };
      return {
        ...current,
        player,
        log: ["薬草を使った。", `HPが${healed - current.player.hp}回復した。`, ...current.log].slice(0, 8)
      };
    });
  }

  function fleeBattle() {
    setGame((current) => {
      if (!current.currentEnemy) return { ...current, screen: "field" };
      if (Math.random() < 0.7) {
        return {
          ...current,
          screen: "field",
          currentEnemy: null,
          log: ["うまく逃げきった。", ...current.log].slice(0, 8)
        };
      }
      return enemyTurn(current, ["逃げられなかった！"]);
    });
  }

  if (game.screen === "title" || !game.started) {
    return (
      <main className="min-h-screen overflow-hidden rounded-[6px] border border-[#243341] bg-[#0d1118] text-[#f6f0df] shadow-[0_28px_90px_rgba(12,17,24,0.42)]">
        <section className="grid min-h-[76vh] content-between bg-[linear-gradient(180deg,#263f50_0%,#182633_42%,#0d1118_100%)] px-5 py-6 md:px-9 md:py-8">
          <div className="grid gap-4">
            <div className="h-36 overflow-hidden rounded-[6px] border border-[#516575] bg-[#6da1c9] md:h-52">
              <div className="grid h-full grid-cols-12 grid-rows-6">
                {["water", "water", "grass", "grass", "hill", "mountain", "grass", "road", "road", "forest", "forest", "goal"].map((tile, index) => (
                  <div key={index} className={tileClass(tile)} />
                ))}
                {Array.from({ length: 60 }).map((_, index) => (
                  <div key={`fill-${index}`} className={tileClass(index % 11 === 0 ? "forest" : index % 7 === 0 ? "road" : index % 5 === 0 ? "hill" : "grass")} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.24em] text-[#c8d1d6] uppercase">Classic Learning Adventure</p>
              <h1 className="mt-3 text-5xl font-black text-white md:text-7xl">Learning RPG</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d7e0e8] md:text-base">{dashboard.themes.find((theme) => theme.theme_id === "japanese_history_rpg")?.description}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:max-w-md">
            <button type="button" onClick={startNewGame} className="rounded-[6px] border border-[#f3c57a] bg-[#f3c57a] px-5 py-4 text-left text-base font-black text-[#16222d] transition hover:bg-white">
              はじめる
            </button>
            {hasSave ? (
              <button type="button" onClick={continueGame} className="rounded-[6px] border border-[#5f7584] bg-[#101820] px-5 py-4 text-left text-base font-bold text-[#f4eddc] transition hover:border-[#f3c57a]">
                つづきから
              </button>
            ) : null}
            <Link href="/product-lab" className="rounded-[6px] border border-[#5f7584] bg-[#101820] px-5 py-4 text-left text-sm font-bold text-[#d7e0e8] transition hover:border-[#f3c57a]">
              Product Lab
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen rounded-[6px] border border-[#243341] bg-[#0d1118] text-[#f6f0df] shadow-[0_28px_90px_rgba(12,17,24,0.35)]">
      <div className="grid gap-4 p-3 md:p-5 xl:grid-cols-[1fr_320px]">
        <section className="grid gap-4">
          <StatusBar player={player} attack={attack} defense={defense} nextExp={nextLevel?.requiredExp ?? player.exp} />
          {game.screen === "town" ? (
            <TownScreen game={game} onNpc={talkToNpc} onRest={restAtInn} onBuy={buyEquipment} onField={() => setScreen("field")} onStatus={() => setScreen("status")} />
          ) : null}
          {game.screen === "field" ? (
            <FieldScreen game={game} onMove={move} onTown={() => setScreen("town")} onSeek={seekBattle} onStatus={() => setScreen("status")} />
          ) : null}
          {game.screen === "battle" ? (
            <BattleScreen enemy={game.currentEnemy} player={player} herbCount={herbCount} onAttack={attackEnemy} onFire={() => castSpell("fire")} onHeal={() => castSpell("heal")} onHerb={useHerb} onFlee={fleeBattle} />
          ) : null}
          {game.screen === "status" ? <StatusScreen player={player} attack={attack} defense={defense} onBack={() => setScreen(game.currentEnemy ? "battle" : "town")} /> : null}
        </section>

        <aside className="grid gap-4 content-start">
          <MessageWindow title="MESSAGE">
            <p>{game.dialogue}</p>
          </MessageWindow>
          <MessageWindow title="BATTLE LOG">
            <div className="grid gap-2">
              {game.log.slice(0, 6).map((line, index) => (
                <p key={`${line}-${index}`}>{line}</p>
              ))}
            </div>
          </MessageWindow>
          <MessageWindow title="GOAL">
            <p>{game.objectiveCleared ? "北の森の光を見つけた。町に戻って次の旅へ。" : "町で話を聞き、北東の森の奥にある光を探す。"}</p>
          </MessageWindow>
        </aside>
      </div>
    </main>
  );
}

function TownScreen({
  game,
  onNpc,
  onRest,
  onBuy,
  onField,
  onStatus
}: {
  game: GameState;
  onNpc: (kind: "goal" | "heal" | "shop" | "world") => void;
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
            const labels: Record<number, string> = { 2: "宿", 6: "店", 9: "人", 12: "人", 16: "出口", 18: "人" };
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
          <CommandButton label="町人と話す" detail="世界観を聞く" onClick={() => onNpc("world")} />
          <CommandButton label="宿屋" detail="HP/MP全回復" onClick={onRest} />
          <CommandButton label="ステータス" detail="強さを見る" onClick={onStatus} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ShopButton item={equipment.bronze_sword} currentId={game.player.weaponId} gold={game.player.gold} onBuy={() => onBuy("bronze_sword")} />
          <ShopButton item={equipment.leather_armor} currentId={game.player.armorId} gold={game.player.gold} onBuy={() => onBuy("leather_armor")} />
        </div>

        <button type="button" onClick={onField} className="rounded-[6px] border border-[#f3c57a] bg-[#f3c57a] px-4 py-4 text-left font-black text-[#16222d] transition hover:bg-white">
          フィールドへ出る
        </button>
      </div>
    </GamePanel>
  );
}

function FieldScreen({
  game,
  onMove,
  onTown,
  onSeek,
  onStatus
}: {
  game: GameState;
  onMove: (direction: "up" | "down" | "left" | "right") => void;
  onTown: () => void;
  onSeek: () => void;
  onStatus: () => void;
}) {
  return (
    <GamePanel title="北のフィールド" subtitle="探索">
      <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
        <div className="grid aspect-square grid-cols-5 grid-rows-5 overflow-hidden rounded-[6px] border border-[#394b39]">
          {fieldMap.flatMap((row, y) =>
            row.map((tile, x) => {
              const playerHere = game.position.x === x && game.position.y === y;
              return (
                <div key={`${x}-${y}`} className={`relative border border-black/20 ${tileClass(tile)}`}>
                  {playerHere ? <div className="absolute inset-2 grid place-items-center rounded-[4px] border border-[#f3c57a] bg-[#101820] text-sm font-black text-[#f3c57a]">勇</div> : null}
                  {!playerHere && tile === "town" ? <span className="absolute inset-0 grid place-items-center text-xs font-black text-[#16222d]">町</span> : null}
                  {!playerHere && tile === "goal" ? <span className="absolute inset-0 grid place-items-center text-xs font-black text-white">光</span> : null}
                </div>
              );
            })
          )}
        </div>

        <div className="grid gap-3 content-start">
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

function BattleScreen({
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
          <CommandButton label="小回復" detail="MP 3 / HP回復" onClick={onHeal} disabled={player.mp < 3} />
          <CommandButton label={`薬草 ${herbCount}`} detail="HP回復" onClick={onHerb} disabled={herbCount <= 0} />
          <CommandButton label="にげる" detail="成功率70%" onClick={onFlee} />
        </div>
      </div>
    </GamePanel>
  );
}

function StatusScreen({ player, attack, defense, onBack }: { player: Player; attack: number; defense: number; onBack: () => void }) {
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
        戻る
      </button>
    </GamePanel>
  );
}

function StatusBar({ player, attack, defense, nextExp }: { player: Player; attack: number; defense: number; nextExp: number }) {
  return (
    <section className="grid gap-2 rounded-[6px] border border-[#40505c] bg-[#101820] p-3 md:grid-cols-4">
      <Info label="Hero" value={`Lv.${player.level}`} dark />
      <Info label="HP / MP" value={`${player.hp}/${player.maxHp}  ${player.mp}/${player.maxMp}`} dark />
      <Info label="ATK / DEF" value={`${attack} / ${defense}`} dark />
      <Info label="GOLD / NEXT" value={`${player.gold} / ${Math.max(0, nextExp - player.exp)}`} dark />
    </section>
  );
}

function GamePanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
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

function MessageWindow({ title, children }: { title: string; children: React.ReactNode }) {
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

function loadGame() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed?.player) return null;
    return parsed;
  } catch {
    return null;
  }
}

function handleTownTile(index: number, onNpc: (kind: "goal" | "heal" | "shop" | "world") => void, onRest: () => void, onField: () => void) {
  if (index === 2) onRest();
  if (index === 6) onNpc("shop");
  if (index === 9) onNpc("goal");
  if (index === 12) onNpc("heal");
  if (index === 16) onField();
  if (index === 18) onNpc("world");
}

function getItemCount(player: Player, itemId: string) {
  return player.items.find((item) => item.itemId === itemId)?.count ?? 0;
}

function getAttack(player: Player) {
  return player.attack + (equipment[player.weaponId]?.attack ?? 0);
}

function getDefense(player: Player) {
  return player.defense + (equipment[player.armorId]?.defense ?? 0);
}

function calcDamage(attackerAttack: number, defenderDefense: number) {
  return Math.max(1, attackerAttack - defenderDefense + Math.floor(Math.random() * 5) - 2);
}

function enemyTurn(game: GameState, logs: string[]) {
  if (!game.currentEnemy) return game;
  const damage = calcDamage(game.currentEnemy.attack, getDefense(game.player));
  const hp = Math.max(0, game.player.hp - damage);
  if (hp <= 0) {
    return {
      ...game,
      screen: "town" as Screen,
      currentEnemy: null,
      player: { ...game.player, hp: Math.max(1, Math.floor(game.player.maxHp / 2)) },
      dialogue: "目を覚ますと町に戻っていた。宿屋で体勢を立て直そう。",
      log: [...logs, `${game.currentEnemy.name}のこうげき！`, `${game.player.name}は${damage}のダメージをうけた！`, "目を覚ますと町に戻っていた。", ...game.log].slice(0, 8)
    };
  }

  return {
    ...game,
    player: { ...game.player, hp },
    log: [...logs, `${game.currentEnemy.name}のこうげき！`, `${game.player.name}は${damage}のダメージをうけた！`, ...game.log].slice(0, 8)
  };
}

function winBattle(game: GameState, logs: string[]) {
  if (!game.currentEnemy) return game;
  const enemy = game.currentEnemy;
  const gainedExp = game.player.exp + enemy.expReward;
  const beforeLevel = game.player.level;
  const leveledPlayer = applyLevelUps({ ...game.player, exp: gainedExp, gold: game.player.gold + enemy.goldReward });
  const levelLog = leveledPlayer.level > beforeLevel ? [`レベルが${leveledPlayer.level}に上がった！`] : [];

  return {
    ...game,
    screen: "field" as Screen,
    currentEnemy: null,
    player: leveledPlayer,
    dialogue: "戦いに勝った。町に戻るか、もう少し先へ進むか選べる。",
    log: [...logs, `${enemy.name}をたおした！`, `経験値${enemy.expReward}を手に入れた！`, `${enemy.goldReward}ゴールドを手に入れた！`, ...levelLog, ...game.log].slice(0, 8)
  };
}

function applyLevelUps(player: Player) {
  let nextPlayer = { ...player };
  for (const entry of levelTable) {
    if (entry.level > nextPlayer.level && nextPlayer.exp >= entry.requiredExp) {
      nextPlayer = {
        ...nextPlayer,
        level: entry.level,
        maxHp: nextPlayer.maxHp + 7,
        maxMp: nextPlayer.maxMp + 3,
        attack: nextPlayer.attack + 2,
        defense: nextPlayer.defense + 1
      };
      nextPlayer.hp = nextPlayer.maxHp;
      nextPlayer.mp = nextPlayer.maxMp;
    }
  }
  return nextPlayer;
}

function getNextLevel(level: number) {
  return levelTable.find((entry) => entry.level > level);
}

function isInsideMap(position: Position) {
  return position.y >= 0 && position.y < fieldMap.length && position.x >= 0 && position.x < fieldMap[0].length;
}

function getTile(position: Position) {
  return fieldMap[position.y][position.x];
}

function shouldEncounter(tile: string, steps: number) {
  if (tile === "forest") return steps % 2 === 0;
  if (tile === "grass" || tile === "hill" || tile === "road") return steps % 3 === 0;
  return false;
}

function spawnEnemy(tile: string): Enemy {
  const pool = tile === "forest" ? enemies.filter((enemy) => enemy.area === "forest") : enemies.filter((enemy) => enemy.area === "grassland");
  const base = pool[Math.floor(Math.random() * pool.length)] ?? enemies[0];
  return { ...base, hp: base.maxHp };
}

function tileLabel(tile: string) {
  const labels: Record<string, string> = {
    grass: "草原",
    forest: "森",
    hill: "丘",
    road: "街道",
    shore: "水辺"
  };
  return labels[tile] ?? tile;
}

function tileClass(tile: string) {
  const classes: Record<string, string> = {
    water: "bg-[#6da1c9]",
    shore: "bg-[#b8d6c6]",
    grass: "bg-[#91bd74]",
    road: "bg-[#d8c48d]",
    forest: "bg-[#3f6f4f]",
    hill: "bg-[#88aa63]",
    goal: "bg-[#7c5f8f]",
    town: "bg-[#d8c48d]"
  };
  return classes[tile] ?? "bg-[#91bd74]";
}
