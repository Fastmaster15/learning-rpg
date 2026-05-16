import {
  STORAGE_KEY,
  fieldOrder,
  fields,
  initialGameState,
  initialPlayer,
  isInsideMap,
  type GameState
} from "@/lib/learning-rpg-game";

export function loadGame() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed?.player) return null;
    const screen = parsed.screen === "title" ? "town" : parsed.screen;
    const fieldId = parsed.fieldId && fields[parsed.fieldId as keyof typeof fields] ? parsed.fieldId : parsed.currentFieldId && fields[parsed.currentFieldId as keyof typeof fields] ? parsed.currentFieldId : fieldOrder[0];
    const position = parsed.position && isInsideMap(fieldId, parsed.position) ? parsed.position : fields[fieldId].entryPosition;
    return {
      ...initialGameState,
      ...parsed,
      started: true,
      screen: screen === "battle" && !parsed.currentEnemy ? "field" : screen,
      previousScreen: parsed.previousScreen ?? (screen === "battle" ? "field" : "town"),
      fieldId,
      currentFieldId: fieldId,
      player: {
        ...initialPlayer,
        ...parsed.player,
        items: parsed.player.items ?? initialPlayer.items
      },
      position,
      openedChestIds: parsed.openedChestIds ?? [],
      miniBossDefeated: Boolean(parsed.miniBossDefeated),
      objectiveCleared: Boolean(parsed.objectiveCleared ?? parsed.miniBossDefeated)
    };
  } catch {
    return null;
  }
}

export function saveGame(game: GameState) {
  if (typeof window === "undefined" || !game.started) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}
