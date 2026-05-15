export const STORAGE_KEY = "learning-rpg.classic-loop.v1";
export const TREASURE_CHEST_ID = "forest_chest_001";

export type Screen = "title" | "town" | "field" | "battle" | "status";
export type InventoryItem = { itemId: string; count: number };
export type Enemy = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldReward: number;
  area: "grassland" | "forest" | "forest_depth";
  role: "weak" | "normal" | "strong" | "mini_boss";
};

export type Player = {
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

export type Position = { x: number; y: number };
export type Equipment = {
  id: string;
  name: string;
  type: "weapon" | "armor";
  price: number;
  attack?: number;
  defense?: number;
};

export type GameState = {
  started: boolean;
  screen: Screen;
  player: Player;
  position: Position;
  currentEnemy: Enemy | null;
  log: string[];
  dialogue: string;
  steps: number;
  objectiveCleared: boolean;
  openedChestIds: string[];
  miniBossDefeated: boolean;
};

export const levelTable = [
  { level: 1, requiredExp: 0 },
  { level: 2, requiredExp: 12 },
  { level: 3, requiredExp: 32 },
  { level: 4, requiredExp: 65 },
  { level: 5, requiredExp: 110 }
];

export const equipment: Record<string, Equipment> = {
  wooden_sword: { id: "wooden_sword", name: "木の短剣", type: "weapon", price: 0, attack: 0 },
  bronze_sword: { id: "bronze_sword", name: "青銅の剣", type: "weapon", price: 32, attack: 4 },
  cloth_armor: { id: "cloth_armor", name: "旅人の服", type: "armor", price: 0, defense: 0 },
  leather_armor: { id: "leather_armor", name: "革のよろい", type: "armor", price: 28, defense: 3 }
};

export const enemies: Enemy[] = [
  {
    id: "soft_blob",
    name: "ぷるぷる",
    hp: 10,
    maxHp: 10,
    attack: 4,
    defense: 1,
    expReward: 4,
    goldReward: 6,
    area: "grassland",
    role: "weak"
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
    area: "grassland",
    role: "normal"
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
    area: "forest",
    role: "strong"
  },
  {
    id: "forest_guardian",
    name: "森のぬし",
    hp: 45,
    maxHp: 45,
    attack: 10,
    defense: 4,
    expReward: 25,
    goldReward: 40,
    area: "forest_depth",
    role: "mini_boss"
  }
];

export const fieldMap: string[][] = [
  ["water", "grass", "grass", "forest", "boss"],
  ["town", "road", "grass", "forest", "forest"],
  ["water", "road", "chest", "grass", "hill"],
  ["water", "grass", "forest", "road", "hill"],
  ["shore", "grass", "grass", "road", "water"]
];

export const initialPlayer: Player = {
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

export const initialGameState: GameState = {
  started: false,
  screen: "title",
  player: initialPlayer,
  position: { x: 1, y: 1 },
  currentEnemy: null,
  log: ["旅の準備ができた。"],
  dialogue: "町の人に話しかけて、北の森へ向かう目的を聞こう。",
  steps: 0,
  objectiveCleared: false,
  openedChestIds: [],
  miniBossDefeated: false
};

export function getItemCount(player: Player, itemId: string) {
  return player.items.find((item) => item.itemId === itemId)?.count ?? 0;
}

export function addItem(player: Player, itemId: string, count: number): Player {
  const exists = player.items.some((item) => item.itemId === itemId);
  return {
    ...player,
    items: exists ? player.items.map((item) => (item.itemId === itemId ? { ...item, count: item.count + count } : item)) : [...player.items, { itemId, count }]
  };
}

export function getAttack(player: Player) {
  return player.attack + (equipment[player.weaponId]?.attack ?? 0);
}

export function getDefense(player: Player) {
  return player.defense + (equipment[player.armorId]?.defense ?? 0);
}

export function calcDamage(attackerAttack: number, defenderDefense: number) {
  return Math.max(1, attackerAttack - defenderDefense + Math.floor(Math.random() * 5) - 2);
}

export function applyLevelUps(player: Player) {
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

export function getNextLevel(level: number) {
  return levelTable.find((entry) => entry.level > level);
}

export function isInsideMap(position: Position) {
  return position.y >= 0 && position.y < fieldMap.length && position.x >= 0 && position.x < fieldMap[0].length;
}

export function getTile(position: Position) {
  return fieldMap[position.y][position.x];
}

export function shouldEncounter(tile: string, steps: number) {
  if (tile === "forest") return steps % 2 === 0;
  if (tile === "grass" || tile === "hill" || tile === "road") return steps % 3 === 0;
  return false;
}

export function spawnEnemy(tile: string): Enemy {
  const pool = tile === "forest" ? enemies.filter((enemy) => enemy.area === "forest") : enemies.filter((enemy) => enemy.area === "grassland");
  const base = pool[Math.floor(Math.random() * pool.length)] ?? enemies[0];
  return { ...base, hp: base.maxHp };
}

export function spawnMiniBoss(): Enemy {
  const base = enemies.find((enemy) => enemy.role === "mini_boss") ?? enemies[0];
  return { ...base, hp: base.maxHp };
}

export function tileLabel(tile: string) {
  const labels: Record<string, string> = {
    grass: "草原",
    forest: "森",
    chest: "宝箱",
    boss: "森の奥",
    hill: "丘",
    road: "街道",
    shore: "水辺"
  };
  return labels[tile] ?? tile;
}

export function tileClass(tile: string) {
  const classes: Record<string, string> = {
    water: "bg-[#6da1c9]",
    shore: "bg-[#b8d6c6]",
    grass: "bg-[#91bd74]",
    road: "bg-[#d8c48d]",
    forest: "bg-[#3f6f4f]",
    chest: "bg-[#d8c48d]",
    boss: "bg-[#7c5f8f]",
    hill: "bg-[#88aa63]",
    goal: "bg-[#7c5f8f]",
    town: "bg-[#d8c48d]"
  };
  return classes[tile] ?? "bg-[#91bd74]";
}

export function getLocationLabel(game: GameState) {
  if (game.screen === "town") return "はじまりの町";
  if (game.screen === "battle") {
    return game.currentEnemy?.role === "mini_boss" ? "森の奥の小ボス戦" : "戦闘中";
  }
  if (game.screen === "status") {
    return game.currentEnemy?.role === "mini_boss" ? "森の奥の小ボス戦" : game.currentEnemy ? "戦闘中" : "確認画面";
  }

  const tile = getTile(game.position);
  const labels: Record<string, string> = {
    town: "はじまりの町",
    grass: "草原",
    forest: "森",
    road: "街道",
    hill: "丘",
    chest: "宝箱のある場所",
    boss: "森の奥",
    shore: "水辺"
  };
  return labels[tile] ?? "フィールド";
}

export function playTone(kind: "victory" | "level" | "treasure" | "boss") {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const audio = new AudioContextClass();
    const now = audio.currentTime;
    const sequence = {
      victory: [523, 659, 784],
      level: [659, 784, 988],
      treasure: [784, 988],
      boss: [392, 523, 659, 1046]
    }[kind];

    sequence.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.04, now + index * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.09 + 0.08);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(now + index * 0.09);
      oscillator.stop(now + index * 0.09 + 0.08);
    });
  } catch {
    // Audio is optional; logs and screen state still carry the result.
  }
}
