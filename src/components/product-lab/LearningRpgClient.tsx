"use client";

import { useState } from "react";

import type { LearningRpgDashboard } from "@/lib/learning-rpg";
import {
  appendLog,
  canOpenTempleGate,
  getCard,
  getCardBookProgress,
  getEventChoices,
  getEventDefinition,
  getHotspotStatus,
  getOwnedCards,
  getScene,
  initialGameState,
  type ActiveEvent,
  type CardId,
  type GameState,
  type SceneHotspot,
  type SceneId
} from "@/lib/learning-rpg-game";
import { EventOverlay, PlayShell, TitleScreen } from "@/components/product-lab/LearningRpgScreens";

type LearningRpgClientProps = {
  dashboard: LearningRpgDashboard;
  initialThemeId?: string;
};

export function LearningRpgClient({ dashboard }: LearningRpgClientProps) {
  const [game, setGame] = useState<GameState>(initialGameState);
  const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null);

  const scene = getScene(game.sceneId);
  const progress = getCardBookProgress(game);
  const ownedCards = getOwnedCards(game);

  function startNewGame() {
    setGame({
      ...initialGameState,
      started: true,
      screen: "play",
      dialogue: "飛鳥の町から探索を始めよう。",
      log: ["飛鳥の町に着いた。", "吹き出しホットスポットを順に開いていこう。"]
    });
    setActiveEvent(null);
  }

  function changeScene(sceneId: SceneId) {
    setGame((current) => ({
      ...current,
      sceneId,
      focusHotspotId: null,
      dialogue: `${getScene(sceneId).title} に移動した。`,
      log: appendLog(current.log, `${getScene(sceneId).title} に切り替えた。`)
    }));
    setActiveEvent(null);
  }

  function focusHotspot(hotspotId: string) {
    setGame((current) => ({
      ...current,
      focusHotspotId: hotspotId
    }));
  }

  function openHotspot(hotspot: SceneHotspot) {
    if (hotspot.kind === "event") {
      return;
    }

    setGame((current) => {
      if (hotspot.kind === "gate") {
        if (!canOpenTempleGate(current)) {
          const missing = current.ownedCardIds.length === 0 ? "まずカードを集めよう。" : `まだ足りないカードがある。${getCardBookProgress(current).missingRequiredCardIds.map((cardId) => getCard(cardId).title).join("、")} を集めよう。`;
          return {
            ...current,
            dialogue: missing,
            log: appendLog(current.log, "飛鳥寺の門はまだロックされている。")
          };
        }
        if (current.sCardClaimed) {
          return {
            ...current,
            dialogue: "飛鳥寺はすでに解放済みだ。",
            log: appendLog(current.log, "飛鳥寺カードはすでにある。")
          };
        }
        const card = getCard("asukadera");
        return {
          ...current,
          ownedCardIds: current.ownedCardIds.includes(card.id) ? current.ownedCardIds : [...current.ownedCardIds, card.id],
          insightPoints: current.insightPoints + card.insightValue,
          sCardClaimed: true,
          completedHotspotIds: current.completedHotspotIds.includes("temple-gate") ? current.completedHotspotIds : [...current.completedHotspotIds, "temple-gate"],
          dialogue: "Sランク『飛鳥寺』を解放した。",
          log: appendLog(current.log, "飛鳥寺カードを解放した。")
        };
      }

      if (!hotspot.cardId) return current;
      const status = getHotspotStatus(current, hotspot);
      if (status === "complete") {
        return {
          ...current,
          dialogue: `${getCard(hotspot.cardId).title} はもうカード帳にある。`,
          log: appendLog(current.log, `${hotspot.title} は完了済みだ。`)
        };
      }

      const card = getCard(hotspot.cardId);
      const nextOwned = current.ownedCardIds.includes(card.id) ? current.ownedCardIds : [...current.ownedCardIds, card.id];
      const nextState: GameState = {
        ...current,
        ownedCardIds: nextOwned,
        insightPoints: current.insightPoints + card.insightValue,
        completedHotspotIds: current.completedHotspotIds.includes(hotspot.id) ? current.completedHotspotIds : [...current.completedHotspotIds, hotspot.id],
        dialogue: `${card.title} を獲得した。`,
        log: appendLog(current.log, `${card.title} を手に入れた。`)
      };

      if (canOpenTempleGate(nextState) && !nextState.sCardClaimed) {
        nextState.dialogue = "条件がそろった。飛鳥寺のゲートが開き始めた。";
        nextState.log = appendLog(nextState.log, "飛鳥寺のゲートが解放された。");
      }

      return nextState;
    });
  }

  function claimTempleSCard() {
    setGame((current) => {
      if (!canOpenTempleGate(current)) {
        const missing = current.ownedCardIds.length === 0 ? "まずカードを集めよう。" : `まだ足りないカードがある。${getCardBookProgress(current).missingRequiredCardIds.map((cardId) => getCard(cardId).title).join("、")} を集めよう。`;
        return {
          ...current,
          dialogue: missing,
          log: appendLog(current.log, "飛鳥寺の門はまだロックされている。")
        };
      }

      if (current.sCardClaimed) {
        return {
          ...current,
          dialogue: "飛鳥寺はすでに解放済みだ。",
          log: appendLog(current.log, "飛鳥寺カードはすでにある。")
        };
      }

      const card = getCard("asukadera");
      return {
        ...current,
        ownedCardIds: current.ownedCardIds.includes(card.id) ? current.ownedCardIds : [...current.ownedCardIds, card.id],
        insightPoints: current.insightPoints + card.insightValue,
        sCardClaimed: true,
        completedHotspotIds: current.completedHotspotIds.includes("temple-gate") ? current.completedHotspotIds : [...current.completedHotspotIds, "temple-gate"],
        dialogue: "Sランク『飛鳥寺』を解放した。",
        log: appendLog(current.log, "飛鳥寺カードを解放した。")
      };
    });
  }

  function openEvent(hotspot: SceneHotspot) {
    if (!hotspot.eventId) return;
    if (game.ownedCardIds.length < 3) {
      setGame((current) => ({
        ...current,
        dialogue: "3枚そろうまではイベントは起こせない。まずカードを集めよう。",
        log: appendLog(current.log, "3択イベントにはまだ早い。")
      }));
      return;
    }

    const definition = getEventDefinition(hotspot.eventId);
    const cards = getEventChoices(game, hotspot.eventId).map((card) => card.id) as CardId[];
    setActiveEvent({
      eventId: hotspot.eventId,
      sceneId: game.sceneId,
      hotspotId: hotspot.id,
      cardIds: cards
    });
    setGame((current) => ({
      ...current,
      completedHotspotIds: current.completedHotspotIds.includes(hotspot.id) ? current.completedHotspotIds : [...current.completedHotspotIds, hotspot.id],
      dialogue: definition.prompt,
      log: appendLog(current.log, `${definition.title} を発生させた。`)
    }));
  }

  function chooseEventCard(cardId: string) {
    if (!activeEvent) return;
    const card = getCard(cardId as CardId);
    const reaction = card.reactions[activeEvent.eventId];
    const event = getEventDefinition(activeEvent.eventId);

    setGame((current) => {
      const nextOwned = current.ownedCardIds.includes(card.id) ? current.ownedCardIds.slice() : [...current.ownedCardIds, card.id];
      if (reaction.bonusCardId && !nextOwned.includes(reaction.bonusCardId)) {
        nextOwned.push(reaction.bonusCardId);
      }

      const nextState: GameState = {
        ...current,
        ownedCardIds: nextOwned,
        insightPoints: current.insightPoints + card.insightValue + reaction.insightBonus,
        completedHotspotIds: current.completedHotspotIds.includes(activeEvent.hotspotId) ? current.completedHotspotIds : [...current.completedHotspotIds, activeEvent.hotspotId],
        dialogue: `${card.title}: ${reaction.line}`,
        log: appendLog(current.log, `${event.successLine} (${card.title})`)
      };
      if (canOpenTempleGate(nextState) && !nextState.sCardClaimed) {
        nextState.log = appendLog(nextState.log, "飛鳥寺のゲートが開いた。");
      }
      return nextState;
    });

    setActiveEvent(null);
  }

  if (!game.started) {
    return <TitleScreen dashboard={dashboard} onStart={startNewGame} />;
  }

  return (
    <>
      <PlayShell
        state={game}
        scene={scene}
        progress={progress}
        ownedCards={ownedCards}
        onSceneChange={changeScene}
        onHotspotClick={openHotspot}
        onOpenEvent={openEvent}
        onClaimSCard={claimTempleSCard}
        onFocusHotspot={focusHotspot}
        gateReady={progress.gateReady}
      />
      <EventOverlay activeEvent={activeEvent} state={game} onChoose={chooseEventCard} onClose={() => setActiveEvent(null)} />
    </>
  );
}
