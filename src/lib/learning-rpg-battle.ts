import {
  type GameState,
  type Screen,
  applyLevelUps,
  calcDamage,
  getDefense,
  playTone
} from "@/lib/learning-rpg-game";

export function enemyTurn(game: GameState, logs: string[]) {
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

export function winBattle(game: GameState, logs: string[]) {
  if (!game.currentEnemy) return game;
  const enemy = game.currentEnemy;
  const gainedExp = game.player.exp + enemy.expReward;
  const beforeLevel = game.player.level;
  const leveledPlayer = applyLevelUps({ ...game.player, exp: gainedExp, gold: game.player.gold + enemy.goldReward });
  const levelLog = leveledPlayer.level > beforeLevel ? [`レベルが${leveledPlayer.level}に上がった！`] : [];
  const miniBossWon = enemy.role === "mini_boss";
  playTone(miniBossWon ? "boss" : levelLog.length ? "level" : "victory");

  return {
    ...game,
    screen: "field" as Screen,
    currentEnemy: null,
    player: leveledPlayer,
    objectiveCleared: miniBossWon ? true : game.objectiveCleared,
    miniBossDefeated: miniBossWon ? true : game.miniBossDefeated,
    dialogue: miniBossWon ? "森のぬしをたおした。北の森の光は、静かに消えていった。" : "戦いに勝った。町に戻るか、もう少し先へ進むか選べる。",
    log: [
      ...logs,
      `${enemy.name}をたおした！`,
      `経験値${enemy.expReward}を手に入れた！`,
      `${enemy.goldReward}ゴールドを手に入れた！`,
      ...levelLog,
      ...(miniBossWon ? ["北の森の光は、静かに消えていった。", "小さな冒険者として、一歩を踏み出した。"] : []),
      ...game.log
    ].slice(0, 8)
  };
}
