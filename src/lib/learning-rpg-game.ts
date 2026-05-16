export const STORAGE_KEY = "learning-rpg.classic-loop.v2";
export const TREASURE_CHEST_ID = "forest_chest_001";
export const FIELD_WIDTH = 16;
export const FIELD_HEIGHT = 12;

export type Screen = "title" | "town" | "field" | "battle" | "status";
export type FieldId = "meadow_gate" | "whispering_forest" | "ancient_ridge";
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

export type FieldTile = "water" | "shore" | "grass" | "road" | "forest" | "chest" | "boss" | "hill" | "goal" | "town" | "gate";
export type FieldTransition = {
  toFieldId: FieldId;
  toPosition: Position;
  label: string;
};

export type FieldDefinition = {
  fieldId: FieldId;
  name: string;
  townName: string;
  description: string;
  encounterArea: "grassland" | "forest";
  entryPosition: Position;
  map: FieldTile[][];
  transitions: Record<string, FieldTransition>;
};

export type GameState = {
  started: boolean;
  screen: Screen;
  previousScreen: Exclude<Screen, "status">;
  currentFieldId: FieldId;
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

const MEADOW_GATE_FIELD_ID: FieldId = "meadow_gate";
const WHISPERING_FOREST_FIELD_ID: FieldId = "whispering_forest";
const ANCIENT_RIDGE_FIELD_ID: FieldId = "ancient_ridge";

function buildRow(tile: FieldTile) {
  return Array.from({ length: FIELD_WIDTH }, () => tile);
}

function createFieldMap(base: FieldTile, placements: Array<{ x: number; y: number; tile: FieldTile }>) {
  const map = Array.from({ length: FIELD_HEIGHT }, () => buildRow(base));
  for (const placement of placements) {
    map[placement.y][placement.x] = placement.tile;
  }
  return map;
}

function posKey(position: Position) {
  return `${position.x},${position.y}`;
}

export const fields: Record<FieldId, FieldDefinition> = {
  meadow_gate: {
    fieldId: MEADOW_GATE_FIELD_ID,
    name: "草原の門前",
    townName: "はじまりの町",
    description: "町の外に広がる、最初の草原フィールド。北東に進むと森の入口へつながる。",
    encounterArea: "grassland",
    entryPosition: { x: 3, y: 9 },
    map: createFieldMap("grass", [
      { x: 0, y: 0, tile: "water" },
      { x: 1, y: 0, tile: "water" },
      { x: 2, y: 0, tile: "shore" },
      { x: 3, y: 0, tile: "shore" },
      { x: 0, y: 1, tile: "water" },
      { x: 1, y: 1, tile: "shore" },
      { x: 6, y: 1, tile: "road" },
      { x: 7, y: 1, tile: "road" },
      { x: 8, y: 1, tile: "road" },
      { x: 9, y: 1, tile: "road" },
      { x: 10, y: 1, tile: "hill" },
      { x: 11, y: 1, tile: "hill" },
      { x: 14, y: 1, tile: "gate" },
      { x: 15, y: 1, tile: "gate" },
      { x: 4, y: 2, tile: "road" },
      { x: 5, y: 2, tile: "road" },
      { x: 6, y: 2, tile: "road" },
      { x: 7, y: 2, tile: "grass" },
      { x: 8, y: 2, tile: "grass" },
      { x: 9, y: 2, tile: "grass" },
      { x: 12, y: 2, tile: "hill" },
      { x: 13, y: 2, tile: "hill" },
      { x: 14, y: 2, tile: "gate" },
      { x: 2, y: 3, tile: "road" },
      { x: 3, y: 3, tile: "road" },
      { x: 9, y: 3, tile: "hill" },
      { x: 10, y: 3, tile: "hill" },
      { x: 11, y: 3, tile: "forest" },
      { x: 12, y: 3, tile: "forest" },
      { x: 13, y: 3, tile: "forest" },
      { x: 1, y: 4, tile: "road" },
      { x: 2, y: 4, tile: "road" },
      { x: 12, y: 4, tile: "forest" },
      { x: 13, y: 4, tile: "forest" },
      { x: 14, y: 4, tile: "forest" },
      { x: 1, y: 5, tile: "road" },
      { x: 2, y: 5, tile: "road" },
      { x: 3, y: 5, tile: "road" },
      { x: 4, y: 5, tile: "grass" },
      { x: 5, y: 5, tile: "grass" },
      { x: 6, y: 5, tile: "grass" },
      { x: 2, y: 6, tile: "town" },
      { x: 3, y: 6, tile: "road" },
      { x: 4, y: 6, tile: "road" },
      { x: 6, y: 6, tile: "chest" },
      { x: 7, y: 6, tile: "road" },
      { x: 8, y: 6, tile: "road" },
      { x: 12, y: 6, tile: "forest" },
      { x: 13, y: 6, tile: "forest" },
      { x: 14, y: 6, tile: "forest" },
      { x: 15, y: 6, tile: "forest" },
      { x: 1, y: 7, tile: "road" },
      { x: 2, y: 7, tile: "road" },
      { x: 3, y: 7, tile: "grass" },
      { x: 4, y: 7, tile: "grass" },
      { x: 9, y: 7, tile: "hill" },
      { x: 10, y: 7, tile: "hill" },
      { x: 11, y: 7, tile: "hill" },
      { x: 8, y: 8, tile: "road" },
      { x: 9, y: 8, tile: "road" },
      { x: 10, y: 8, tile: "grass" },
      { x: 12, y: 8, tile: "grass" },
      { x: 13, y: 8, tile: "grass" },
      { x: 14, y: 8, tile: "grass" },
      { x: 4, y: 9, tile: "hill" },
      { x: 7, y: 9, tile: "road" },
      { x: 8, y: 9, tile: "road" },
      { x: 11, y: 9, tile: "grass" },
      { x: 12, y: 9, tile: "grass" },
      { x: 6, y: 10, tile: "road" },
      { x: 7, y: 10, tile: "road" },
      { x: 8, y: 10, tile: "grass" },
      { x: 9, y: 10, tile: "grass" },
      { x: 10, y: 10, tile: "grass" },
      { x: 12, y: 10, tile: "grass" },
      { x: 13, y: 10, tile: "grass" }
    ]),
    transitions: {
      [posKey({ x: 14, y: 2 })]: {
        toFieldId: WHISPERING_FOREST_FIELD_ID,
        toPosition: { x: 1, y: 5 },
        label: "森へ"
      },
      [posKey({ x: 2, y: 6 })]: {
        toFieldId: MEADOW_GATE_FIELD_ID,
        toPosition: { x: 3, y: 9 },
        label: "町へ"
      }
    }
  },
  whispering_forest: {
    fieldId: WHISPERING_FOREST_FIELD_ID,
    name: "ささやきの森",
    townName: "はじまりの町",
    description: "草原を抜けた先の森。宝箱、強敵、小ボスの手前の緊張感がここで始まる。",
    encounterArea: "forest",
    entryPosition: { x: 1, y: 5 },
    map: createFieldMap("forest", [
      { x: 0, y: 0, tile: "grass" },
      { x: 1, y: 0, tile: "grass" },
      { x: 2, y: 0, tile: "grass" },
      { x: 3, y: 0, tile: "road" },
      { x: 4, y: 0, tile: "road" },
      { x: 8, y: 0, tile: "road" },
      { x: 9, y: 0, tile: "road" },
      { x: 10, y: 0, tile: "road" },
      { x: 12, y: 0, tile: "grass" },
      { x: 13, y: 0, tile: "grass" },
      { x: 14, y: 0, tile: "grass" },
      { x: 15, y: 0, tile: "grass" },
      { x: 0, y: 1, tile: "grass" },
      { x: 3, y: 1, tile: "road" },
      { x: 4, y: 1, tile: "road" },
      { x: 6, y: 1, tile: "grass" },
      { x: 7, y: 1, tile: "grass" },
      { x: 8, y: 1, tile: "road" },
      { x: 9, y: 1, tile: "road" },
      { x: 10, y: 1, tile: "road" },
      { x: 11, y: 1, tile: "road" },
      { x: 12, y: 1, tile: "hill" },
      { x: 13, y: 1, tile: "hill" },
      { x: 14, y: 1, tile: "hill" },
      { x: 15, y: 1, tile: "hill" },
      { x: 0, y: 2, tile: "gate" },
      { x: 1, y: 2, tile: "road" },
      { x: 2, y: 2, tile: "road" },
      { x: 3, y: 2, tile: "road" },
      { x: 7, y: 2, tile: "grass" },
      { x: 8, y: 2, tile: "grass" },
      { x: 9, y: 2, tile: "forest" },
      { x: 10, y: 2, tile: "forest" },
      { x: 11, y: 2, tile: "forest" },
      { x: 12, y: 2, tile: "gate" },
      { x: 13, y: 2, tile: "gate" },
      { x: 14, y: 2, tile: "gate" },
      { x: 15, y: 2, tile: "gate" },
      { x: 1, y: 3, tile: "road" },
      { x: 2, y: 3, tile: "grass" },
      { x: 3, y: 3, tile: "grass" },
      { x: 6, y: 3, tile: "forest" },
      { x: 7, y: 3, tile: "forest" },
      { x: 8, y: 3, tile: "forest" },
      { x: 12, y: 3, tile: "forest" },
      { x: 13, y: 3, tile: "forest" },
      { x: 14, y: 3, tile: "forest" },
      { x: 15, y: 3, tile: "forest" },
      { x: 1, y: 4, tile: "grass" },
      { x: 2, y: 4, tile: "grass" },
      { x: 5, y: 4, tile: "forest" },
      { x: 6, y: 4, tile: "forest" },
      { x: 7, y: 4, tile: "forest" },
      { x: 8, y: 4, tile: "forest" },
      { x: 10, y: 4, tile: "grass" },
      { x: 11, y: 4, tile: "grass" },
      { x: 12, y: 4, tile: "forest" },
      { x: 13, y: 4, tile: "forest" },
      { x: 14, y: 4, tile: "forest" },
      { x: 0, y: 5, tile: "gate" },
      { x: 1, y: 5, tile: "road" },
      { x: 2, y: 5, tile: "road" },
      { x: 3, y: 5, tile: "road" },
      { x: 4, y: 5, tile: "forest" },
      { x: 5, y: 5, tile: "forest" },
      { x: 6, y: 5, tile: "forest" },
      { x: 7, y: 5, tile: "forest" },
      { x: 8, y: 5, tile: "forest" },
      { x: 9, y: 5, tile: "forest" },
      { x: 10, y: 5, tile: "forest" },
      { x: 11, y: 5, tile: "forest" },
      { x: 12, y: 5, tile: "forest" },
      { x: 13, y: 5, tile: "forest" },
      { x: 14, y: 5, tile: "forest" },
      { x: 15, y: 5, tile: "forest" },
      { x: 3, y: 6, tile: "grass" },
      { x: 4, y: 6, tile: "grass" },
      { x: 5, y: 6, tile: "grass" },
      { x: 6, y: 6, tile: "grass" },
      { x: 7, y: 6, tile: "grass" },
      { x: 8, y: 6, tile: "grass" },
      { x: 9, y: 6, tile: "forest" },
      { x: 10, y: 6, tile: "forest" },
      { x: 11, y: 6, tile: "boss" },
      { x: 12, y: 6, tile: "forest" },
      { x: 13, y: 6, tile: "forest" },
      { x: 14, y: 6, tile: "forest" },
      { x: 15, y: 6, tile: "forest" },
      { x: 2, y: 7, tile: "grass" },
      { x: 3, y: 7, tile: "grass" },
      { x: 4, y: 7, tile: "grass" },
      { x: 5, y: 7, tile: "grass" },
      { x: 6, y: 7, tile: "forest" },
      { x: 7, y: 7, tile: "forest" },
      { x: 8, y: 7, tile: "forest" },
      { x: 9, y: 7, tile: "forest" },
      { x: 12, y: 7, tile: "forest" },
      { x: 13, y: 7, tile: "forest" },
      { x: 14, y: 7, tile: "forest" },
      { x: 15, y: 7, tile: "forest" },
      { x: 4, y: 8, tile: "grass" },
      { x: 5, y: 8, tile: "grass" },
      { x: 6, y: 8, tile: "grass" },
      { x: 7, y: 8, tile: "road" },
      { x: 8, y: 8, tile: "road" },
      { x: 9, y: 8, tile: "road" },
      { x: 10, y: 8, tile: "grass" },
      { x: 11, y: 8, tile: "forest" },
      { x: 12, y: 8, tile: "forest" },
      { x: 13, y: 8, tile: "forest" },
      { x: 6, y: 9, tile: "chest" },
      { x: 7, y: 9, tile: "road" },
      { x: 8, y: 9, tile: "road" },
      { x: 9, y: 9, tile: "road" },
      { x: 10, y: 9, tile: "grass" },
      { x: 11, y: 9, tile: "forest" },
      { x: 12, y: 9, tile: "forest" },
      { x: 13, y: 9, tile: "forest" },
      { x: 14, y: 9, tile: "forest" },
      { x: 3, y: 10, tile: "grass" },
      { x: 4, y: 10, tile: "grass" },
      { x: 5, y: 10, tile: "grass" },
      { x: 6, y: 10, tile: "grass" },
      { x: 7, y: 10, tile: "road" },
      { x: 8, y: 10, tile: "road" },
      { x: 9, y: 10, tile: "grass" },
      { x: 10, y: 10, tile: "grass" },
      { x: 11, y: 10, tile: "grass" },
      { x: 12, y: 10, tile: "grass" },
      { x: 13, y: 10, tile: "grass" }
    ]),
    transitions: {
      [posKey({ x: 0, y: 5 })]: {
        toFieldId: MEADOW_GATE_FIELD_ID,
        toPosition: { x: 13, y: 2 },
        label: "草原へ"
      },
      [posKey({ x: 15, y: 2 })]: {
        toFieldId: ANCIENT_RIDGE_FIELD_ID,
        toPosition: { x: 2, y: 10 },
        label: "古道へ"
      }
    }
  },
  ancient_ridge: {
    fieldId: ANCIENT_RIDGE_FIELD_ID,
    name: "古道の丘",
    townName: "はじまりの町",
    description: "森の先に続く石の古道。小目的地の光が見える、章の締めくくりのフィールド。",
    encounterArea: "forest",
    entryPosition: { x: 2, y: 10 },
    map: createFieldMap("hill", [
      { x: 0, y: 0, tile: "grass" },
      { x: 1, y: 0, tile: "grass" },
      { x: 2, y: 0, tile: "road" },
      { x: 3, y: 0, tile: "road" },
      { x: 4, y: 0, tile: "road" },
      { x: 8, y: 0, tile: "gate" },
      { x: 9, y: 0, tile: "gate" },
      { x: 10, y: 0, tile: "gate" },
      { x: 11, y: 0, tile: "gate" },
      { x: 12, y: 0, tile: "gate" },
      { x: 13, y: 0, tile: "grass" },
      { x: 14, y: 0, tile: "grass" },
      { x: 15, y: 0, tile: "grass" },
      { x: 1, y: 1, tile: "road" },
      { x: 2, y: 1, tile: "road" },
      { x: 3, y: 1, tile: "road" },
      { x: 8, y: 1, tile: "road" },
      { x: 9, y: 1, tile: "road" },
      { x: 10, y: 1, tile: "road" },
      { x: 11, y: 1, tile: "road" },
      { x: 12, y: 1, tile: "road" },
      { x: 13, y: 1, tile: "grass" },
      { x: 14, y: 1, tile: "grass" },
      { x: 15, y: 1, tile: "grass" },
      { x: 2, y: 2, tile: "road" },
      { x: 3, y: 2, tile: "road" },
      { x: 4, y: 2, tile: "grass" },
      { x: 8, y: 2, tile: "hill" },
      { x: 9, y: 2, tile: "hill" },
      { x: 10, y: 2, tile: "hill" },
      { x: 11, y: 2, tile: "hill" },
      { x: 12, y: 2, tile: "road" },
      { x: 13, y: 2, tile: "road" },
      { x: 14, y: 2, tile: "road" },
      { x: 15, y: 2, tile: "road" },
      { x: 1, y: 3, tile: "grass" },
      { x: 2, y: 3, tile: "road" },
      { x: 3, y: 3, tile: "road" },
      { x: 4, y: 3, tile: "grass" },
      { x: 8, y: 3, tile: "hill" },
      { x: 9, y: 3, tile: "hill" },
      { x: 10, y: 3, tile: "hill" },
      { x: 11, y: 3, tile: "hill" },
      { x: 13, y: 3, tile: "grass" },
      { x: 14, y: 3, tile: "grass" },
      { x: 15, y: 3, tile: "grass" },
      { x: 0, y: 4, tile: "grass" },
      { x: 1, y: 4, tile: "grass" },
      { x: 2, y: 4, tile: "grass" },
      { x: 4, y: 4, tile: "grass" },
      { x: 5, y: 4, tile: "grass" },
      { x: 6, y: 4, tile: "road" },
      { x: 7, y: 4, tile: "road" },
      { x: 8, y: 4, tile: "road" },
      { x: 9, y: 4, tile: "road" },
      { x: 12, y: 4, tile: "grass" },
      { x: 13, y: 4, tile: "grass" },
      { x: 14, y: 4, tile: "grass" },
      { x: 15, y: 4, tile: "grass" },
      { x: 2, y: 5, tile: "grass" },
      { x: 3, y: 5, tile: "grass" },
      { x: 4, y: 5, tile: "grass" },
      { x: 5, y: 5, tile: "road" },
      { x: 6, y: 5, tile: "road" },
      { x: 7, y: 5, tile: "road" },
      { x: 8, y: 5, tile: "grass" },
      { x: 9, y: 5, tile: "grass" },
      { x: 10, y: 5, tile: "grass" },
      { x: 11, y: 5, tile: "grass" },
      { x: 12, y: 5, tile: "grass" },
      { x: 13, y: 5, tile: "grass" },
      { x: 14, y: 5, tile: "grass" },
      { x: 15, y: 5, tile: "grass" },
      { x: 1, y: 6, tile: "road" },
      { x: 2, y: 6, tile: "road" },
      { x: 3, y: 6, tile: "road" },
      { x: 4, y: 6, tile: "road" },
      { x: 5, y: 6, tile: "road" },
      { x: 6, y: 6, tile: "chest" },
      { x: 7, y: 6, tile: "road" },
      { x: 8, y: 6, tile: "road" },
      { x: 10, y: 6, tile: "grass" },
      { x: 11, y: 6, tile: "grass" },
      { x: 12, y: 6, tile: "grass" },
      { x: 13, y: 6, tile: "grass" },
      { x: 14, y: 6, tile: "grass" },
      { x: 15, y: 6, tile: "grass" },
      { x: 1, y: 7, tile: "grass" },
      { x: 2, y: 7, tile: "grass" },
      { x: 3, y: 7, tile: "grass" },
      { x: 4, y: 7, tile: "road" },
      { x: 5, y: 7, tile: "road" },
      { x: 6, y: 7, tile: "road" },
      { x: 7, y: 7, tile: "road" },
      { x: 8, y: 7, tile: "grass" },
      { x: 9, y: 7, tile: "grass" },
      { x: 10, y: 7, tile: "grass" },
      { x: 11, y: 7, tile: "grass" },
      { x: 12, y: 7, tile: "grass" },
      { x: 13, y: 7, tile: "grass" },
      { x: 14, y: 7, tile: "grass" },
      { x: 15, y: 7, tile: "grass" },
      { x: 4, y: 8, tile: "road" },
      { x: 5, y: 8, tile: "road" },
      { x: 6, y: 8, tile: "road" },
      { x: 7, y: 8, tile: "road" },
      { x: 8, y: 8, tile: "road" },
      { x: 9, y: 8, tile: "road" },
      { x: 10, y: 8, tile: "road" },
      { x: 11, y: 8, tile: "road" },
      { x: 12, y: 8, tile: "road" },
      { x: 13, y: 8, tile: "goal" },
      { x: 14, y: 8, tile: "grass" },
      { x: 15, y: 8, tile: "grass" },
      { x: 3, y: 9, tile: "grass" },
      { x: 4, y: 9, tile: "grass" },
      { x: 5, y: 9, tile: "grass" },
      { x: 6, y: 9, tile: "road" },
      { x: 7, y: 9, tile: "road" },
      { x: 8, y: 9, tile: "road" },
      { x: 9, y: 9, tile: "road" },
      { x: 10, y: 9, tile: "road" },
      { x: 11, y: 9, tile: "grass" },
      { x: 12, y: 9, tile: "grass" },
      { x: 13, y: 9, tile: "grass" },
      { x: 14, y: 9, tile: "grass" },
      { x: 15, y: 9, tile: "grass" },
      { x: 2, y: 10, tile: "road" },
      { x: 3, y: 10, tile: "road" },
      { x: 4, y: 10, tile: "grass" },
      { x: 5, y: 10, tile: "grass" },
      { x: 6, y: 10, tile: "grass" },
      { x: 7, y: 10, tile: "grass" },
      { x: 8, y: 10, tile: "grass" },
      { x: 9, y: 10, tile: "grass" },
      { x: 10, y: 10, tile: "grass" },
      { x: 11, y: 10, tile: "grass" },
      { x: 12, y: 10, tile: "grass" },
      { x: 13, y: 10, tile: "grass" },
      { x: 14, y: 10, tile: "grass" },
      { x: 15, y: 10, tile: "grass" },
      { x: 2, y: 11, tile: "gate" },
      { x: 3, y: 11, tile: "gate" },
      { x: 4, y: 11, tile: "gate" },
      { x: 5, y: 11, tile: "gate" },
      { x: 6, y: 11, tile: "grass" },
      { x: 7, y: 11, tile: "grass" },
      { x: 8, y: 11, tile: "grass" },
      { x: 9, y: 11, tile: "grass" },
      { x: 10, y: 11, tile: "grass" },
      { x: 11, y: 11, tile: "grass" },
      { x: 12, y: 11, tile: "grass" },
      { x: 13, y: 11, tile: "grass" },
      { x: 14, y: 11, tile: "grass" },
      { x: 15, y: 11, tile: "grass" }
    ]),
    transitions: {
      [posKey({ x: 8, y: 0 })]: {
        toFieldId: WHISPERING_FOREST_FIELD_ID,
        toPosition: { x: 14, y: 2 },
        label: "森へ"
      },
      [posKey({ x: 2, y: 11 })]: {
        toFieldId: WHISPERING_FOREST_FIELD_ID,
        toPosition: { x: 14, y: 2 },
        label: "森へ戻る"
      }
    }
  }
};

export const fieldOrder: FieldId[] = [MEADOW_GATE_FIELD_ID, WHISPERING_FOREST_FIELD_ID, ANCIENT_RIDGE_FIELD_ID];

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
  previousScreen: "town",
  currentFieldId: MEADOW_GATE_FIELD_ID,
  player: initialPlayer,
  position: fields[MEADOW_GATE_FIELD_ID].entryPosition,
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

export function getField(fieldId: FieldId) {
  return fields[fieldId] ?? fields[MEADOW_GATE_FIELD_ID];
}

export function getCurrentField(game: GameState) {
  return getField(game.currentFieldId);
}

export function isInsideMap(fieldId: FieldId, position: Position) {
  const field = getField(fieldId);
  return position.y >= 0 && position.y < field.map.length && position.x >= 0 && position.x < field.map[0].length;
}

export function getTile(fieldId: FieldId, position: Position) {
  return getField(fieldId).map[position.y][position.x];
}

export function getFieldTransition(fieldId: FieldId, position: Position) {
  return getField(fieldId).transitions[posKey(position)] ?? null;
}

export function shouldEncounter(tile: FieldTile, steps: number) {
  if (tile === "forest") return steps % 2 === 0;
  if (tile === "grass" || tile === "hill" || tile === "road") return steps % 3 === 0;
  return false;
}

export function spawnEnemy(fieldId: FieldId, tile: FieldTile): Enemy {
  const field = getField(fieldId);
  const pool = field.encounterArea === "grassland" ? enemies.filter((enemy) => enemy.area === "grassland") : enemies.filter((enemy) => enemy.area === "forest" || enemy.area === "forest_depth");
  const preferred = tile === "forest" && field.encounterArea === "forest" ? enemies.filter((enemy) => enemy.area === "forest" || enemy.area === "forest_depth") : pool;
  const base = preferred[Math.floor(Math.random() * preferred.length)] ?? enemies[0];
  return { ...base, hp: base.maxHp };
}

export function spawnMiniBoss(): Enemy {
  const base = enemies.find((enemy) => enemy.role === "mini_boss") ?? enemies[0];
  return { ...base, hp: base.maxHp };
}

export function tileLabel(tile: FieldTile) {
  const labels: Record<FieldTile, string> = {
    water: "水辺",
    shore: "浜",
    grass: "草原",
    road: "街道",
    forest: "森",
    chest: "宝箱",
    boss: "奥地",
    hill: "丘",
    goal: "光",
    town: "町",
    gate: "門"
  };
  return labels[tile] ?? tile;
}

export function tileClass(tile: FieldTile) {
  const classes: Record<FieldTile, string> = {
    water: "bg-[#6da1c9]",
    shore: "bg-[#b8d6c6]",
    grass: "bg-[#91bd74]",
    road: "bg-[#d8c48d]",
    forest: "bg-[#3f6f4f]",
    chest: "bg-[#d8c48d]",
    boss: "bg-[#7c5f8f]",
    hill: "bg-[#88aa63]",
    goal: "bg-[#7c5f8f]",
    town: "bg-[#d8c48d]",
    gate: "bg-[#c59c55]"
  };
  return classes[tile] ?? "bg-[#91bd74]";
}

export function getLocationLabel(game: GameState) {
  const field = getCurrentField(game);
  if (game.screen === "town") return field.townName;
  if (game.screen === "battle") {
    return game.currentEnemy?.role === "mini_boss" ? `${field.name} / 小ボス戦` : `${field.name} / 戦闘中`;
  }
  if (game.screen === "status") {
    return game.currentEnemy?.role === "mini_boss" ? `${field.name} / 小ボス戦` : game.currentEnemy ? `${field.name} / 戦闘中` : `${field.name} / 確認画面`;
  }

  const tile = getTile(game.currentFieldId, game.position);
  if (tile === "gate") {
    return getFieldTransition(game.currentFieldId, game.position)?.label ?? field.name;
  }

  const labels: Record<FieldTile, string> = {
    town: field.townName,
    grass: "草原",
    forest: "森",
    road: "街道",
    hill: "丘",
    chest: "宝箱のある場所",
    boss: "森の奥",
    shore: "水辺",
    water: "水辺",
    goal: "光の場所",
    gate: field.name
  };
  return labels[tile] ?? field.name;
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
