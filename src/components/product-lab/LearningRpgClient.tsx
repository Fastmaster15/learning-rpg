"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LearningRpgDashboard } from "@/lib/learning-rpg";

import {
  TREASURE_CHEST_ID,
  addItem,
  calcDamage,
  fields,
  equipment,
  getAttack,
  getCurrentField,
  getFieldTransition,
  getItemCount,
  getLocationLabel,
  getNextLevel,
  getTile,
  initialGameState,
  type FieldId,
  type FieldTile,
  type GameState,
  isInsideMap,
  playTone,
  shouldEncounter,
  spawnEnemy,
  spawnMiniBoss,
  tileClass,
  tileLabel
} from "@/lib/learning-rpg-game";
import { enemyTurn, winBattle } from "@/lib/learning-rpg-battle";
import { selectLearningThemePlan } from "@/lib/learning-rpg-learning";
import { loadGame, saveGame } from "@/lib/learning-rpg-persistence";
import { BattleScreen, FieldScreen, MessageWindow, StatusBar, StatusScreen, TownScreen } from "@/components/product-lab/LearningRpgScreens";
import { BossSprite } from "@/components/product-lab/learning-rpg/BossSprite";

type LearningRpgClientProps = {
  dashboard: LearningRpgDashboard;
  initialThemeId?: string;
};

export function LearningRpgClient({ dashboard, initialThemeId }: LearningRpgClientProps) {
  const [game, setGame] = useState<GameState>(initialGameState);
  const [battleIntroActive, setBattleIntroActive] = useState(false);
  const [battleIntroStep, setBattleIntroStep] = useState<0 | 1 | 2>(0);
  const [learningGateOpen, setLearningGateOpen] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const player = game.player;
  const attack = player.attack + (equipment[player.weaponId]?.attack ?? 0);
  const defense = player.defense + (equipment[player.armorId]?.defense ?? 0);
  const nextLevel = getNextLevel(player.level);
  const herbCount = getItemCount(player, "herb");
  const location = getLocationLabel(game);
  const currentField = getCurrentField(game);
  const learningPlan = selectLearningThemePlan(dashboard, initialThemeId);

  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setHasSave(true);
      setGame(saved);
    }
  }, []);

  useEffect(() => {
    if (game.started) {
      saveGame(game);
      setHasSave(true);
    }
  }, [game]);

  useEffect(() => {
    if (game.screen !== "battle" || !game.currentEnemy) {
      setBattleIntroActive(false);
      setBattleIntroStep(0);
      return;
    }

    setBattleIntroActive(true);
    setBattleIntroStep(0);
    const step1 = window.setTimeout(() => setBattleIntroStep(1), 180);
    const step2 = window.setTimeout(() => setBattleIntroStep(2), 520);
    const end = window.setTimeout(() => setBattleIntroActive(false), 980);

    return () => {
      window.clearTimeout(step1);
      window.clearTimeout(step2);
      window.clearTimeout(end);
    };
  }, [game.screen, game.currentEnemy]);

  useEffect(() => {
    if (!game.battleCue) return;
    const timeout = window.setTimeout(() => {
      setGame((current) => (current.battleCue ? { ...current, battleCue: null } : current));
    }, game.battleCue.special ? 840 : 620);
    return () => window.clearTimeout(timeout);
  }, [game.battleCue]);

  function startNewGame() {
    setGame({
      ...initialGameState,
      started: true,
      screen: "town",
      previousScreen: "town",
      fieldId: initialGameState.fieldId,
      currentFieldId: initialGameState.fieldId,
      position: fields[initialGameState.fieldId].entryPosition,
      log: ["朝の町に着いた。", "北の森で小さな光が見えたらしい。"]
    });
  }

  function continueGame() {
    const saved = loadGame();
    if (saved) {
      setGame({
        ...saved,
        started: true,
        screen: saved.screen
      });
    }
  }

  function openStatus() {
    setGame((current) => ({
      ...current,
      previousScreen: current.screen === "status" ? current.previousScreen ?? "town" : current.screen,
      screen: "status"
    }));
  }

  function closeStatus() {
    setGame((current) => {
      const nextScreen = current.previousScreen ?? "town";
      return {
        ...current,
        screen: nextScreen,
        previousScreen: null
      };
    });
  }

  function returnToTown(message?: string) {
    setGame((current) => ({
      ...current,
      screen: "town",
      fieldId: initialGameState.fieldId,
      currentFieldId: initialGameState.fieldId,
      position: fields[initialGameState.fieldId].entryPosition,
      currentEnemy: null,
      steps: 0,
      dialogue: message ?? "町に戻った。宿屋と店で準備しよう。",
      log: [message ?? "町に戻った。", ...current.log].slice(0, 8)
    }));
  }

  function enterField(fieldId: FieldId) {
    const field = fields[fieldId];
    setGame((current) => ({
      ...current,
      currentFieldId: field.fieldId,
      fieldId: field.fieldId,
      position: field.entryPosition,
      currentEnemy: null,
      steps: 0,
      screen: "field",
      dialogue: `${field.name} に出た。`,
      log: [`${field.name} に出た。`, ...current.log].slice(0, 8)
    }));
  }

  function talkToNpc(kind: "goal" | "heal" | "shop" | "boss" | "world") {
    const lines = {
      goal: "北の森で、あやしい光を見た人がいるらしい。いずれは学んだぶんだけ開く門も作る予定だ。",
      heal: "傷ついたら無理をするな。町に戻って休めば、また遠くまで歩ける。",
      shop: "森に行くなら、少し良い武器を持つと安心だよ。ゴールドは使ってこそ力になる。",
      boss: "森の奥には、普通の魔物とは違う気配がある。知識の門はまだ仮のものだが、先にあると覚えておけ。",
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
      const field = getCurrentField(current);
      const currentFieldId = current.fieldId ?? current.currentFieldId ?? initialGameState.fieldId;
      const nextPosition = {
        x: current.position.x + (direction === "right" ? 1 : direction === "left" ? -1 : 0),
        y: current.position.y + (direction === "down" ? 1 : direction === "up" ? -1 : 0)
      };

      if (!isInsideMap(currentFieldId, nextPosition)) {
        return { ...current, log: ["そこから先へは進めない。", ...current.log].slice(0, 8) };
      }

      const transition = getFieldTransition(currentFieldId, nextPosition);
      if (transition) {
        const nextField = fields[transition.toFieldId];
        return {
          ...current,
          currentFieldId: transition.toFieldId,
          fieldId: transition.toFieldId,
          position: transition.toPosition,
          screen: "field",
          currentEnemy: null,
          steps: 0,
          dialogue: `${field.name} から ${nextField.name} に移動した。`,
          log: [`${transition.label}へ進んだ。`, ...current.log].slice(0, 8)
        };
      }

      const tile = getTile(currentFieldId, nextPosition);
      if (tile === "blocked") {
        return {
          ...current,
          dialogue: field.learningGateNote ?? "ここはまだ通れない。何かを理解すれば道が開きそうだ。",
          log: [field.learningGateNote ?? "ここはまだ通れない。", ...current.log].slice(0, 8)
        };
      }

      if (tile === "landmark") {
        return {
          ...current,
          position: nextPosition,
          dialogue: field.learningGateNote ?? "古い石碑がある。後で学びの問いに使えそうだ。",
          log: ["古い石碑を見つけた。", field.learningGateNote ?? "ここは学びの入口になりそうだ。", ...current.log].slice(0, 8)
        };
      }

      if (tile === "water") {
        return { ...current, log: ["水辺が行く手をふさいでいる。", ...current.log].slice(0, 8) };
      }

      if (tile === "town") {
        return {
          ...current,
          screen: "town",
          fieldId: initialGameState.fieldId,
          currentFieldId: initialGameState.fieldId,
          position: fields[initialGameState.fieldId].entryPosition,
          currentEnemy: null,
          steps: 0,
          log: ["町に戻った。", ...current.log].slice(0, 8),
          dialogue: "町に戻ると少し安心する。宿屋と店で準備しよう。"
        };
      }

      if (tile === "goal") {
        if (!current.miniBossDefeated) {
          return {
            ...current,
            dialogue: "森の奥の光はまだ不安定だ。先へ進むには、まず森のぬしを越える必要がある。",
            log: ["森の奥の光はまだ不安定だ。", "先へ進むには、まず森のぬしを越える必要がある。", ...current.log].slice(0, 8)
          };
        }
        return {
          ...current,
          position: nextPosition,
          objectiveCleared: true,
          log: ["北の森の光を見つけた。最初の小目標を達成した！", ...current.log].slice(0, 8),
          dialogue: "森の奥に小さな光が残っている。次の章へ進めそうだ。"
        };
      }

      if (tile === "chest") {
        if (current.openedChestIds.includes(TREASURE_CHEST_ID)) {
          return {
            ...current,
            position: nextPosition,
            log: ["空の宝箱がある。", ...current.log].slice(0, 8)
          };
        }

        playTone("treasure");
        return {
          ...current,
          position: nextPosition,
          player: addItem(current.player, "herb", 2),
          openedChestIds: [...current.openedChestIds, TREASURE_CHEST_ID],
          dialogue: "宝箱を開けた。薬草を2つ手に入れた！",
          log: ["宝箱を見つけた！", "薬草を2つ手に入れた！", ...current.log].slice(0, 8)
        };
      }

      if (tile === "boss") {
        if (current.miniBossDefeated) {
          return {
            ...current,
            position: nextPosition,
            objectiveCleared: true,
            dialogue: "森の奥の光は静かに消えている。小さな冒険は一区切りついた。",
            log: ["北の森の光は、静かに消えていった。", ...current.log].slice(0, 8)
          };
        }

        const enemy = spawnMiniBoss();
        return {
          ...current,
          screen: "battle",
          position: nextPosition,
          currentEnemy: enemy,
          log: ["森の奥に重い気配が満ちた。", `${enemy.name} が立ちはだかった！`, ...current.log].slice(0, 8),
          dialogue: "小ボス戦だ。勝てなければ町へ戻り、装備と回復を整えよう。"
        };
      }

      const steps = current.steps + 1;
      const enemy = shouldEncounter(currentFieldId, tile, steps) ? spawnEnemy(currentFieldId, tile) : null;
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
      const fieldId = current.fieldId ?? current.currentFieldId ?? initialGameState.fieldId;
      const tile = getTile(fieldId, current.position);
      if (tile === "goal" && !current.miniBossDefeated) {
        return {
          ...current,
          log: ["森の奥の光はまだ不安定だ。", ...current.log].slice(0, 8),
          dialogue: "まず森のぬしを倒してから、光の場所へ向かおう。"
        };
      }
      const enemy = tile === "goal" || tile === "boss" ? spawnMiniBoss() : spawnEnemy(fieldId, tile);
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
      const outcome = enemyTurn({ ...current, currentEnemy: enemy, battleCue: null }, logs);
      return outcome.game;
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
        const outcome = enemyTurn(
          {
            ...current,
            player: { ...player, hp: healed },
            battleCue: null
          },
          [`${current.player.name}は小回復を唱えた。`, `HPが${healed - player.hp}回復した。`]
        );
        return outcome.game;
      }

      const enemy = { ...current.currentEnemy, hp: Math.max(0, current.currentEnemy.hp - 12) };
      const logs = [`${current.player.name}は火の玉を唱えた！`, `${enemy.name}に12のダメージ！`];
      if (enemy.hp <= 0) {
        return winBattle({ ...current, player, currentEnemy: enemy }, logs);
      }
      const outcome = enemyTurn({ ...current, player, currentEnemy: enemy, battleCue: null }, logs);
      return outcome.game;
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
      const outcome = enemyTurn({ ...current, player, battleCue: null }, ["薬草を使った。", `HPが${healed - current.player.hp}回復した。`]);
      return outcome.game;
    });
  }

  function fleeBattle() {
    setGame((current) => {
      if (!current.currentEnemy) return { ...current, screen: "field" };
      if (current.currentEnemy.role === "mini_boss") {
        return enemyTurn({ ...current, battleCue: null }, ["森の奥では逃げられない！"]).game;
      }
      if (Math.random() < 0.7) {
        return {
          ...current,
          screen: "field",
          currentEnemy: null,
          log: ["うまく逃げきった。", ...current.log].slice(0, 8)
        };
      }
      return enemyTurn({ ...current, battleCue: null }, ["逃げられなかった！"]).game;
    });
  }

  if (game.screen === "title" || !game.started) {
    const previewTiles: FieldTile[] = ["water", "water", "grass", "grass", "hill", "hill", "grass", "road", "road", "forest", "forest", "goal"];
    const previewFillTiles: FieldTile[] = ["forest", "road", "hill", "grass"];
    return (
      <main className="min-h-screen overflow-hidden rounded-[6px] border border-[#243341] bg-[#0d1118] text-[#f6f0df] shadow-[0_28px_90px_rgba(12,17,24,0.42)]">
        <section className="grid min-h-[76vh] content-between bg-[linear-gradient(180deg,#263f50_0%,#182633_42%,#0d1118_100%)] px-5 py-6 md:px-9 md:py-8">
          <div className="grid gap-4">
            <div className="h-36 overflow-hidden rounded-[6px] border border-[#516575] bg-[#6da1c9] md:h-52">
              <div className="grid h-full grid-cols-12 grid-rows-6">
                {previewTiles.map((tile, index) => (
                  <div key={index} className={tileClass(tile)} />
                ))}
                {Array.from({ length: 60 }).map((_, index) => (
                  <div key={`fill-${index}`} className={tileClass(previewFillTiles[index % previewFillTiles.length])} />
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
          <StatusBar player={player} attack={attack} defense={defense} nextExp={nextLevel?.requiredExp ?? player.exp} location={location} />
          {game.screen === "town" ? (
            <TownScreen game={game} field={currentField} onNpc={talkToNpc} onRest={restAtInn} onBuy={buyEquipment} onField={() => enterField(game.fieldId ?? initialGameState.fieldId)} onStatus={openStatus} />
          ) : null}
          {game.screen === "field" || game.screen === "battle" ? (
            <FieldScreen game={game} field={currentField} onMove={move} onTown={() => returnToTown()} onSeek={seekBattle} onStatus={openStatus} />
          ) : null}
          {game.screen === "status" ? <StatusScreen player={player} attack={attack} defense={defense} onBack={closeStatus} /> : null}
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
            <p>{game.objectiveCleared ? "森のぬしを倒した。プロトタイプはここまで。" : "町で準備し、宝箱を探し、北東の森の奥にいる森のぬしへ挑む。"}</p>
          </MessageWindow>
          {learningPlan ? (
            <MessageWindow title="LEARNING FRAME">
              <div className="grid gap-3 text-sm leading-6">
                <div className="grid gap-1">
                  <p className="font-bold text-white">{learningPlan.name}</p>
                  <p>{learningPlan.learningLoop}</p>
                  <p>{learningPlan.designPrinciple}</p>
                </div>

                <div className="rounded-[6px] border border-[#40505c] bg-[#0d1118] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">Learning Gate</p>
                    <button
                      type="button"
                      onClick={() => setLearningGateOpen((current) => !current)}
                      className="rounded-full border border-[#f3c57a] bg-[#f3c57a] px-3 py-1 text-xs font-black text-[#16222d]"
                    >
                      {learningGateOpen ? "閉じる" : "見る"}
                    </button>
                  </div>
                  {learningGateOpen && learningPlan.primaryGate ? (
                    <div className="mt-3 grid gap-2">
                      <p className="font-bold text-white">{learningPlan.primaryGate.stageTitle}</p>
                      <p>{learningPlan.primaryGate.unlockCue}</p>
                      <p>{learningPlan.primaryGate.futureRequirementNote}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge label={learningPlan.primaryGate.gateKind} />
                        <Badge label={learningPlan.primaryGate.axis} />
                        <Badge label={learningPlan.primaryGate.deviceRequirement} />
                        {learningPlan.primaryGate.linkedSkillIds.map((skillId) => (
                          <Badge key={skillId} label={skillId} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-[#b7c5ce]">agapat 側で要件が決まると、ここが route unlock の入口になる。</p>
                  )}
                </div>

                <div className="rounded-[6px] border border-[#40505c] bg-[#0d1118] p-3">
                  <p className="text-xs font-bold tracking-[0.18em] text-[#8aa0ad] uppercase">Skill Links</p>
                  <div className="mt-3 grid gap-3">
                    {learningPlan.worlds.map((world) => (
                      <div key={world.worldId} className="rounded-[6px] border border-[#243341] bg-[#101820] p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold text-white">{world.title}</p>
                          <span className="text-xs font-bold tracking-[0.16em] text-[#8aa0ad] uppercase">{world.stageCount} stages</span>
                        </div>
                        <p className="mt-1 text-[#b7c5ce]">{world.curiosityCue}</p>
                        <div className="mt-2 grid gap-2">
                          {world.stagePlans.map((stage) => (
                            <div key={stage.stageId} className="rounded-[6px] border border-[#394b39] bg-[#0d1118] p-2">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="font-bold text-white">{stage.stageTitle}</p>
                                  <p className="text-xs text-[#b7c5ce]">{stage.stageSummary}</p>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  <Badge label={stage.gateKind} />
                                  <Badge label={stage.axis} />
                                </div>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {stage.linkedSkillIds.length ? stage.linkedSkillIds.map((skillId) => <Badge key={skillId} label={skillId} />) : <Badge label="no linked skills yet" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-1">
                  <p>gate: {learningPlan.gatePalette.join(" / ")}</p>
                  <p>next: {learningPlan.nextQuestTitle}</p>
                  <p>{learningPlan.nextQuestSummary}</p>
                </div>
              </div>
            </MessageWindow>
          ) : null}
        </aside>
      </div>
      {game.currentEnemy ? <BattleScreen enemy={game.currentEnemy} player={player} herbCount={herbCount} battleCue={game.battleCue} onAttack={attackEnemy} onFire={() => castSpell("fire")} onHeal={() => castSpell("heal")} onHerb={useHerb} onFlee={fleeBattle} /> : null}
      {game.currentEnemy ? <BattleIntroOverlay active={battleIntroActive} step={battleIntroStep} enemyName={game.currentEnemy.name} /> : null}
    </main>
  );
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-full border border-[#40505c] bg-[#101820] px-2 py-1 text-[11px] font-bold tracking-[0.08em] text-[#d7e0e8]">{label}</span>;
}

function BattleIntroOverlay({ active, step, enemyName }: { active: boolean; step: 0 | 1 | 2; enemyName: string }) {
  return (
    <div className={`pointer-events-none fixed inset-0 z-[60] grid place-items-center transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(243,197,122,0.22),transparent_34%),linear-gradient(180deg,rgba(13,17,24,0.82),rgba(13,17,24,0.48))]" />
      <div className="relative grid gap-3 text-center">
        <div className={`mx-auto h-16 w-16 rounded-full border border-[#f3c57a]/70 bg-[#101820] shadow-[0_0_0_8px_rgba(243,197,122,0.08)] transition-all duration-200 ${step >= 1 ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} />
        <p className={`text-xs font-black tracking-[0.28em] text-[#f3c57a] transition-all duration-200 ${step >= 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>ENCOUNTER</p>
        <h2 className={`text-2xl font-black text-white transition-all duration-200 ${step >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>{enemyName}</h2>
      </div>
    </div>
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
