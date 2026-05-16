export const STORAGE_KEY = "learning-rpg.card-exploration-mvp.v1";

export type SceneId = "asukamachi" | "artisan_workshop" | "temple_entrance";
export type Screen = "title" | "play";
export type CardId =
  | "asukamachi"
  | "asukagawa"
  | "soga_umaiko"
  | "asuka_workshop"
  | "clay_tiles"
  | "stone_carry"
  | "stone_steps"
  | "suiko"
  | "shotoku"
  | "asukadera";
export type EventId = "town_story" | "workshop_story" | "temple_story";
export type CardRank = "C" | "A" | "S";
export type HotspotStatus = "unconfirmed" | "complete" | "locked";
export type HotspotKind = "card" | "event" | "gate";

export type CardReaction = {
  line: string;
  insightBonus: number;
  bonusCardId?: CardId;
};

export type CardDefinition = {
  id: CardId;
  rank: CardRank;
  title: string;
  summary: string;
  sceneId: SceneId;
  insightValue: number;
  eventWeights: Record<EventId, number>;
  reactions: Record<EventId, CardReaction>;
};

export type SceneHotspot = {
  id: string;
  kind: HotspotKind;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  cardId?: CardId;
  eventId?: EventId;
  requiresCardIds?: CardId[];
};

export type SceneDefinition = {
  id: SceneId;
  title: string;
  subtitle: string;
  summary: string;
  accent: string;
  shellClassName: string;
  glowClassName: string;
  hotspotIds: string[];
};

export type ActiveEvent = {
  eventId: EventId;
  sceneId: SceneId;
  hotspotId: string;
  cardIds: CardId[];
};

export type GameState = {
  started: boolean;
  screen: Screen;
  sceneId: SceneId;
  focusHotspotId: string | null;
  dialogue: string;
  log: string[];
  ownedCardIds: CardId[];
  completedHotspotIds: string[];
  insightPoints: number;
  sCardClaimed: boolean;
};

export type CardBookProgress = {
  ownedCount: number;
  totalCount: number;
  completionRate: number;
  missingRequiredCardIds: CardId[];
  gateReady: boolean;
};

export const eventLibrary: Record<EventId, { title: string; prompt: string; successLine: string }> = {
  town_story: {
    title: "朝市の三択",
    prompt: "町の輪郭を読むなら、どのカードを手元に出す？",
    successLine: "町の空気が、歴史の地図に変わった。"
  },
  workshop_story: {
    title: "作業場の三択",
    prompt: "職人の視点で見るなら、どのカードを差し出す？",
    successLine: "工房の音が、寺院の輪郭に重なった。"
  },
  temple_story: {
    title: "寺の入口の三択",
    prompt: "門前の意味を読むなら、どのカードを掲げる？",
    successLine: "入口の空気が、寺の名前へつながった。"
  }
};

export const requiredGateCardIds: CardId[] = [
  "asukamachi",
  "asukagawa",
  "asuka_workshop",
  "clay_tiles",
  "suiko",
  "shotoku"
];

export const cardLibrary: CardDefinition[] = [
  {
    id: "asukamachi",
    rank: "C",
    title: "飛鳥の町",
    summary: "人が集まり、情報が行き来する章の起点。地名から景色を読み始めるための一枚。",
    sceneId: "asukamachi",
    insightValue: 1,
    eventWeights: {
      town_story: 5,
      workshop_story: 1,
      temple_story: 1
    },
    reactions: {
      town_story: { line: "町の名前を押さえると、出来事が生活の手触りを持つ。", insightBonus: 1 },
      workshop_story: { line: "町の輪郭が見えるほど、工房の役割も追いやすくなる。", insightBonus: 1 },
      temple_story: { line: "寺の前に立つ前提として、まず町の位置が要る。", insightBonus: 1 }
    }
  },
  {
    id: "asukagawa",
    rank: "C",
    title: "飛鳥川",
    summary: "道と人の流れを結ぶ、地形の手がかりになる川。ルートの読み解きに効く一枚。",
    sceneId: "asukamachi",
    insightValue: 1,
    eventWeights: {
      town_story: 5,
      workshop_story: 1,
      temple_story: 1
    },
    reactions: {
      town_story: { line: "川の流れを見ると、町の外と内のつながりが見えてくる。", insightBonus: 1, bonusCardId: "soga_umaiko" },
      workshop_story: { line: "運搬と水運を意識すると、工房の仕事が立体になる。", insightBonus: 1 },
      temple_story: { line: "寺の前の地形は、川筋と切り離せない。", insightBonus: 1 }
    }
  },
  {
    id: "soga_umaiko",
    rank: "A",
    title: "蘇我馬子",
    summary: "飛鳥期の政治を動かした人物の一人。寺院建立の背景をつかむための要点。",
    sceneId: "asukamachi",
    insightValue: 2,
    eventWeights: {
      town_story: 4,
      workshop_story: 2,
      temple_story: 3
    },
    reactions: {
      town_story: { line: "政治の中心を出すと、町の意味が一気に厚くなる。", insightBonus: 2 },
      workshop_story: { line: "工房の仕事は、権力の動きとつながっていたはずだ。", insightBonus: 1 },
      temple_story: { line: "寺の建立を考えるなら、人物の名前は外せない。", insightBonus: 2 }
    }
  },
  {
    id: "asuka_workshop",
    rank: "C",
    title: "飛鳥の工房",
    summary: "石と土と火が集まる現場。寺院の輪郭は、ここで少しずつ形になる。",
    sceneId: "artisan_workshop",
    insightValue: 1,
    eventWeights: {
      town_story: 1,
      workshop_story: 5,
      temple_story: 2
    },
    reactions: {
      town_story: { line: "町の外れに工房があると、往来の理由が見えてくる。", insightBonus: 1 },
      workshop_story: { line: "作業場の空気をつかめば、次のカードも集めやすい。", insightBonus: 1 },
      temple_story: { line: "寺の前には、まずこうした現場の積み重ねがある。", insightBonus: 1 }
    }
  },
  {
    id: "clay_tiles",
    rank: "C",
    title: "瓦と土の仕事",
    summary: "焼く・積む・支える。見た目の前に、寺を成り立たせる工程がある。",
    sceneId: "artisan_workshop",
    insightValue: 1,
    eventWeights: {
      town_story: 1,
      workshop_story: 5,
      temple_story: 2
    },
    reactions: {
      town_story: { line: "素材の仕事を追うと、町の外に広がる技術が見える。", insightBonus: 1 },
      workshop_story: { line: "瓦と土の段取りは、寺を現実にするための鍵だ。", insightBonus: 2, bonusCardId: "stone_carry" },
      temple_story: { line: "門前で感じる重みは、こうした細かな工程の積み重ね。", insightBonus: 1 }
    }
  },
  {
    id: "stone_carry",
    rank: "C",
    title: "石材の運搬",
    summary: "重い素材を動かすだけでも、街と工房と寺はつながる。副次的な補助カード。",
    sceneId: "artisan_workshop",
    insightValue: 1,
    eventWeights: {
      town_story: 1,
      workshop_story: 4,
      temple_story: 2
    },
    reactions: {
      town_story: { line: "運ぶ仕事が見えると、町の外へ伸びる道も気になる。", insightBonus: 1 },
      workshop_story: { line: "石を運ぶ力がなければ、寺の基礎は積めない。", insightBonus: 1 },
      temple_story: { line: "寺の入口で重さを感じるのは、運搬の仕事があるからだ。", insightBonus: 1 }
    }
  },
  {
    id: "stone_steps",
    rank: "C",
    title: "石段の導き",
    summary: "寺の入口へ近づく導線。門前の空気を先に伝える補助カード。",
    sceneId: "temple_entrance",
    insightValue: 1,
    eventWeights: {
      town_story: 1,
      workshop_story: 2,
      temple_story: 4
    },
    reactions: {
      town_story: { line: "石段の話を出すと、町の外にある目的地が見えてくる。", insightBonus: 1 },
      workshop_story: { line: "作業場の積み重ねが、石段の先にある寺へつながる。", insightBonus: 1 },
      temple_story: { line: "入口の石段を押さえると、門前の空気が一段濃くなる。", insightBonus: 1 }
    }
  },
  {
    id: "suiko",
    rank: "A",
    title: "推古天皇",
    summary: "飛鳥時代の政治を語る要の人物。寺院と制度の流れをつなぐカード。",
    sceneId: "temple_entrance",
    insightValue: 2,
    eventWeights: {
      town_story: 2,
      workshop_story: 2,
      temple_story: 5
    },
    reactions: {
      town_story: { line: "人名が入ると、町の出来事は時代のうねりに変わる。", insightBonus: 1 },
      workshop_story: { line: "制度の後ろ盾があれば、工房の仕事も寺へ届く。", insightBonus: 1 },
      temple_story: { line: "寺の入口にこの名を置くと、建立の意味が立ち上がる。", insightBonus: 2 }
    }
  },
  {
    id: "shotoku",
    rank: "A",
    title: "厩戸皇子",
    summary: "制度や思想の話に入りやすい人物。寺院の文脈で手がかりになる。",
    sceneId: "temple_entrance",
    insightValue: 2,
    eventWeights: {
      town_story: 2,
      workshop_story: 2,
      temple_story: 5
    },
    reactions: {
      town_story: { line: "人物を押さえると、町の流れが単なる地名ではなくなる。", insightBonus: 1 },
      workshop_story: { line: "工房の仕事も、思想の流れと無関係ではない。", insightBonus: 1 },
      temple_story: { line: "寺の入口でこの人物を選ぶと、章の軸が定まる。", insightBonus: 2 }
    }
  },
  {
    id: "asukadera",
    rank: "S",
    title: "飛鳥寺",
    summary: "条件を満たすと解放されるSランクカード。飛鳥の章を象徴する到達点。",
    sceneId: "temple_entrance",
    insightValue: 3,
    eventWeights: {
      town_story: 2,
      workshop_story: 2,
      temple_story: 6
    },
    reactions: {
      town_story: { line: "最終地点の名前が見えると、町のすべてがそこへつながる。", insightBonus: 2 },
      workshop_story: { line: "工房の積み重ねが、この寺の名前にまとまっていく。", insightBonus: 2 },
      temple_story: { line: "入口を越えて到達した感覚が、Sランクの重みになる。", insightBonus: 3 }
    }
  }
];

export const scenes: SceneDefinition[] = [
  {
    id: "asukamachi",
    title: "飛鳥の町",
    subtitle: "人と情報が集まる起点",
    summary: "町の輪郭をつかむと、川と工房と寺の関係が見えてくる。まずは視点の出発点をつかむ。",
    accent: "from-[#c28f61]/24 via-[#6a4e37]/18 to-[#1c242b]",
    shellClassName: "border-[#7f5d42] bg-[linear-gradient(180deg,rgba(72,53,40,0.94)_0%,rgba(23,32,40,0.98)_100%)]",
    glowClassName: "bg-[radial-gradient(circle_at_20%_10%,rgba(255,206,150,0.18),transparent_36%),radial-gradient(circle_at_78%_22%,rgba(180,224,255,0.12),transparent_30%),linear-gradient(180deg,rgba(23,32,40,0.12),rgba(23,32,40,0.6))]",
    hotspotIds: ["town-river", "town-market", "town-event", "town-gate"]
  },
  {
    id: "artisan_workshop",
    title: "職人の作業場",
    subtitle: "石と土の音がする場所",
    summary: "寺の輪郭を支えるのは、名前よりも先にある工程だ。作る手つきを見れば、時代の輪郭が見える。",
    accent: "from-[#9f7f51]/24 via-[#45513c]/18 to-[#1b2428]",
    shellClassName: "border-[#6f7d57] bg-[linear-gradient(180deg,rgba(47,58,44,0.95)_0%,rgba(20,30,36,0.98)_100%)]",
    glowClassName: "bg-[radial-gradient(circle_at_18%_16%,rgba(204,233,156,0.16),transparent_35%),radial-gradient(circle_at_76%_18%,rgba(226,191,146,0.12),transparent_32%),linear-gradient(180deg,rgba(23,34,30,0.14),rgba(20,30,36,0.66))]",
    hotspotIds: ["workshop-bench", "workshop-clay", "workshop-event", "workshop-stones"]
  },
  {
    id: "temple_entrance",
    title: "寺の入口",
    subtitle: "Sカードへ続く門前",
    summary: "ここで必要なカードと視点がそろうと、飛鳥寺のカードが解放される。",
    accent: "from-[#7f89ac]/22 via-[#3e4a67]/18 to-[#141b2a]",
    shellClassName: "border-[#56688a] bg-[linear-gradient(180deg,rgba(35,43,66,0.95)_0%,rgba(17,22,34,0.98)_100%)]",
    glowClassName: "bg-[radial-gradient(circle_at_22%_18%,rgba(180,204,255,0.17),transparent_34%),radial-gradient(circle_at_74%_18%,rgba(255,233,176,0.12),transparent_30%),linear-gradient(180deg,rgba(18,24,38,0.12),rgba(17,22,34,0.7))]",
    hotspotIds: ["temple-promenade", "temple-royalty", "temple-event", "temple-gate"]
  }
];

export const sceneById = Object.fromEntries(scenes.map((scene) => [scene.id, scene])) as Record<SceneId, SceneDefinition>;

export const hotspotById = {
  "town-river": {
    id: "town-river",
    kind: "card",
    title: "川面の泡",
    subtitle: "飛鳥川の流れを拾う",
    x: 20,
    y: 67,
    cardId: "asukagawa"
  },
  "town-market": {
    id: "town-market",
    kind: "card",
    title: "町札の輪郭",
    subtitle: "飛鳥の町を手に入れる",
    x: 48,
    y: 42,
    cardId: "asukamachi"
  },
  "town-event": {
    id: "town-event",
    kind: "event",
    title: "朝市の問い",
    subtitle: "3択カードイベント",
    x: 76,
    y: 57,
    eventId: "town_story"
  },
  "town-gate": {
    id: "town-gate",
    kind: "gate",
    title: "寺への気配",
    subtitle: "条件達成でS解放",
    x: 84,
    y: 80,
    cardId: "asukadera",
    requiresCardIds: requiredGateCardIds
  },
  "workshop-bench": {
    id: "workshop-bench",
    kind: "card",
    title: "作業台の木目",
    subtitle: "飛鳥の工房を拾う",
    x: 24,
    y: 60,
    cardId: "asuka_workshop"
  },
  "workshop-clay": {
    id: "workshop-clay",
    kind: "card",
    title: "土と瓦",
    subtitle: "瓦と土の仕事を拾う",
    x: 55,
    y: 38,
    cardId: "clay_tiles"
  },
  "workshop-event": {
    id: "workshop-event",
    kind: "event",
    title: "工房の問い",
    subtitle: "3択カードイベント",
    x: 76,
    y: 63,
    eventId: "workshop_story"
  },
  "workshop-stones": {
    id: "workshop-stones",
    kind: "card",
    title: "石の荷",
    subtitle: "石材の運搬を拾う",
    x: 42,
    y: 82,
    cardId: "stone_carry"
  },
  "temple-promenade": {
    id: "temple-promenade",
    kind: "card",
    title: "石段の手前",
    subtitle: "寺の入口の空気を拾う",
    x: 27,
    y: 61,
    cardId: "stone_steps"
  },
  "temple-royalty": {
    id: "temple-royalty",
    kind: "card",
    title: "朝廷の気配",
    subtitle: "推古天皇を拾う",
    x: 58,
    y: 39,
    cardId: "suiko"
  },
  "temple-event": {
    id: "temple-event",
    kind: "event",
    title: "門前の問い",
    subtitle: "3択カードイベント",
    x: 76,
    y: 57,
    eventId: "temple_story"
  },
  "temple-gate": {
    id: "temple-gate",
    kind: "gate",
    title: "飛鳥寺の門",
    subtitle: "Sランク解放",
    x: 84,
    y: 80,
    cardId: "asukadera",
    requiresCardIds: requiredGateCardIds
  }
} as const satisfies Record<string, SceneHotspot>;

export const sceneHotspots: Record<SceneId, SceneHotspot[]> = {
  asukamachi: [hotspotById["town-river"], hotspotById["town-market"], hotspotById["town-event"], hotspotById["town-gate"]],
  artisan_workshop: [hotspotById["workshop-bench"], hotspotById["workshop-clay"], hotspotById["workshop-event"], hotspotById["workshop-stones"]],
  temple_entrance: [hotspotById["temple-promenade"], hotspotById["temple-royalty"], hotspotById["temple-event"], hotspotById["temple-gate"]]
};

export const initialGameState: GameState = {
  started: false,
  screen: "title",
  sceneId: "asukamachi",
  focusHotspotId: null,
  dialogue: "飛鳥の町から、カード探索を始めよう。",
  log: ["飛鳥の章の準備が整った。"],
  ownedCardIds: [],
  completedHotspotIds: [],
  insightPoints: 0,
  sCardClaimed: false
};

function rankWeight(rank: CardRank) {
  return rank === "S" ? 3 : rank === "A" ? 2 : 1;
}

export function getScene(sceneId: SceneId) {
  return sceneById[sceneId];
}

export function getHotspots(sceneId: SceneId) {
  return sceneHotspots[sceneId];
}

export function getCard(cardId: CardId) {
  return cardLibrary.find((card) => card.id === cardId) ?? cardLibrary[0];
}

export function isCardOwned(state: Pick<GameState, "ownedCardIds">, cardId: CardId) {
  return state.ownedCardIds.includes(cardId);
}

export function getOwnedCards(state: Pick<GameState, "ownedCardIds">) {
  return cardLibrary.filter((card) => state.ownedCardIds.includes(card.id));
}

export function getRequiredMissingCardIds(state: Pick<GameState, "ownedCardIds">) {
  return requiredGateCardIds.filter((cardId) => !state.ownedCardIds.includes(cardId));
}

export function canOpenTempleGate(state: Pick<GameState, "ownedCardIds" | "insightPoints">) {
  return getRequiredMissingCardIds(state).length === 0 && state.insightPoints >= 7;
}

export function getHotspotStatus(state: Pick<GameState, "ownedCardIds" | "completedHotspotIds" | "insightPoints" | "sCardClaimed">, hotspot: SceneHotspot): HotspotStatus {
  if (hotspot.kind === "gate") {
    if (hotspot.cardId === "asukadera" && state.sCardClaimed) return "complete";
    return canOpenTempleGate(state) ? "unconfirmed" : "locked";
  }

  if (hotspot.kind === "event") {
    return state.completedHotspotIds.includes(hotspot.id) ? "complete" : "unconfirmed";
  }

  if (hotspot.cardId && state.ownedCardIds.includes(hotspot.cardId)) {
    return "complete";
  }

  return "unconfirmed";
}

export function getCardBookProgress(state: Pick<GameState, "ownedCardIds" | "insightPoints" | "sCardClaimed">): CardBookProgress {
  const ownedCount = state.ownedCardIds.length;
  const totalCount = cardLibrary.length;
  return {
    ownedCount,
    totalCount,
    completionRate: totalCount === 0 ? 0 : ownedCount / totalCount,
    missingRequiredCardIds: getRequiredMissingCardIds(state),
    gateReady: canOpenTempleGate(state)
  };
}

export function getCardRankLabel(rank: CardRank) {
  return rank === "S" ? "S" : rank === "A" ? "A" : "C";
}

export function getEventChoices(state: Pick<GameState, "ownedCardIds">, eventId: EventId) {
  return getOwnedCards(state)
    .slice()
    .sort((left, right) => {
      const weightGap = right.eventWeights[eventId] - left.eventWeights[eventId];
      if (weightGap !== 0) return weightGap;
      const rankGap = rankWeight(right.rank) - rankWeight(left.rank);
      if (rankGap !== 0) return rankGap;
      return left.title.localeCompare(right.title, "ja");
    })
    .slice(0, 3);
}

export function getEventDefinition(eventId: EventId) {
  return eventLibrary[eventId];
}

export function getHotspotCardLabel(hotspot: SceneHotspot) {
  if (hotspot.kind === "gate") return "S";
  if (hotspot.kind === "event") return "3択";
  if (!hotspot.cardId) return "";
  return getCardRankLabel(getCard(hotspot.cardId).rank);
}

export function appendLog(log: string[], line: string, max = 8) {
  return [line, ...log].slice(0, max);
}
