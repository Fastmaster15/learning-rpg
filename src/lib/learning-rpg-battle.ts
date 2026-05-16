import {
  type GameState,
  type BattleCue,
  type Screen,
  applyLevelUps,
  calcDamage,
  getDefense,
  playTone
} from "@/lib/learning-rpg-game";

const bossMoves = ["翠嵐崩撃", "木霊裂爪", "根砕きの一振り", "森鳴きの大震"] as const;

export function enemyTurn(game: GameState, logs: string[]): { game: GameState; cue: BattleCue | null } {
  if (!game.currentEnemy) return { game, cue: null };
  const enemy = game.currentEnemy;
  const isBoss = enemy.role === "mini_boss";
  const special = isBoss && Math.random() < 0.35;
  const moveName = special ? bossMoves[Math.floor(Math.random() * bossMoves.length)] : undefined;
  const attackPower = special ? enemy.attack + 6 : enemy.attack;
  const damage = calcDamage(attackPower, getDefense(game.player)) + (special ? 3 : 0);
  const hp = Math.max(0, game.player.hp - damage);
  if (hp <= 0) {
    if (isBoss && special) {
      playTone("boss_charge");
    } else if (isBoss) {
      playTone("boss_attack");
    }
    return {
      game: {
      ...game,
      screen: "town" as Screen,
      currentEnemy: null,
      battleCue: null,
      player: { ...game.player, hp: Math.max(1, Math.floor(game.player.maxHp / 2)) },
      dialogue: "目を覚ますと町に戻っていた。宿屋で体勢を立て直そう。",
      log: [...logs, `${game.currentEnemy.name}のこうげき！`, `${game.player.name}は${damage}のダメージをうけた！`, "目を覚ますと町に戻っていた。", ...game.log].slice(0, 8)
      },
      cue: isBoss ? { kind: "boss-attack", special, moveName } : null
    };
  }

  if (isBoss && special) {
    playTone("boss_charge");
  } else if (isBoss) {
    playTone("boss_attack");
  }

  return {
    game: {
      ...game,
      player: { ...game.player, hp },
      battleCue: isBoss ? { kind: "boss-attack", special, moveName } : null,
      log: [
        ...logs,
        ...(isBoss && special ? [`${moveName}！`, `${game.currentEnemy.name}が大地を揺らした！`] : []),
        `${game.currentEnemy.name}のこうげき！`,
        `${game.player.name}は${damage}のダメージをうけた！`,
        ...game.log
      ].slice(0, 8)
    },
    cue: isBoss ? { kind: "boss-attack", special, moveName } : null
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
    battleCue: null,
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
