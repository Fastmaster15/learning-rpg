import type { GameState } from "@/lib/learning-rpg-game";

export type BattleCue = {
  kind: "boss-attack";
  special: boolean;
  moveName?: string;
};

export function enemyTurn(game: GameState, _logs: string[]): { game: GameState; cue: BattleCue | null } {
  return { game, cue: null };
}

export function winBattle(game: GameState, _logs: string[]) {
  return game;
}

