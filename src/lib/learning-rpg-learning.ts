import type { LearningRpgDashboard, LearningRpgStage, LearningRpgTheme } from "@/lib/learning-rpg";

export type LearningGateKind = "learning_gate" | "knowledge_gate" | "quiz_gate" | "concept_key" | "route_unlock";
export type LearningAxis = "concept" | "reading" | "ordering" | "implementation" | "project" | "reflection";

export type LearningStagePlan = {
  stageId: string;
  stageTitle: string;
  stageSummary: string;
  stageType: LearningRpgStage["stage_type"];
  status: LearningRpgStage["status"];
  deviceRequirement: LearningRpgStage["device_requirement"];
  gateKind: LearningGateKind;
  axis: LearningAxis;
  linkedSkillIds: string[];
  unlockCue: string;
  futureRequirementNote: string;
};

export type LearningWorldPlan = {
  worldId: string;
  title: string;
  summary: string;
  curiosityCue: string;
  stageCount: number;
  stagePlans: LearningStagePlan[];
};

export type LearningThemePlan = {
  themeId: string;
  name: string;
  shortName: string;
  worldview: string;
  learningLoop: string;
  designPrinciple: string;
  gatePalette: LearningGateKind[];
  skillIndex: Record<string, string[]>;
  worlds: LearningWorldPlan[];
  primaryGate: LearningStagePlan | null;
  nextQuestTitle: string;
  nextQuestSummary: string;
  nextQuestDeviceRequirement: LearningRpgStage["device_requirement"];
};

const gatePalette: LearningGateKind[] = ["learning_gate", "knowledge_gate", "quiz_gate", "concept_key", "route_unlock"];

const stageTypeMap: Record<string, { gateKind: LearningGateKind; axis: LearningAxis; unlockCue: string }> = {
  reading_quiz: {
    gateKind: "knowledge_gate",
    axis: "reading",
    unlockCue: "読むことで扉の意味がわかる"
  },
  concept_quiz: {
    gateKind: "learning_gate",
    axis: "concept",
    unlockCue: "理解がそのまま通行証になる"
  },
  order_puzzle: {
    gateKind: "quiz_gate",
    axis: "ordering",
    unlockCue: "順序をそろえると道がつながる"
  },
  implementation: {
    gateKind: "concept_key",
    axis: "implementation",
    unlockCue: "手を動かすと鍵が組み上がる"
  },
  mini_project: {
    gateKind: "route_unlock",
    axis: "project",
    unlockCue: "小さな制作で次のルートが開く"
  },
  boss: {
    gateKind: "route_unlock",
    axis: "reflection",
    unlockCue: "総合理解が門を開く"
  },
  design_decision: {
    gateKind: "concept_key",
    axis: "reflection",
    unlockCue: "選ぶ理由が理解の鍵になる"
  }
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function deriveStagePlan(stage: LearningRpgStage): LearningStagePlan {
  const mapping = stageTypeMap[stage.stage_type] ?? stageTypeMap.concept_quiz;
  const linkedSkillIds = unique(stage.linked_skill_ids ?? []);
  return {
    stageId: stage.stage_id,
    stageTitle: stage.title,
    stageSummary: stage.summary,
    stageType: stage.stage_type,
    status: stage.status,
    deviceRequirement: stage.device_requirement,
    gateKind: mapping.gateKind,
    axis: mapping.axis,
    linkedSkillIds,
    unlockCue: mapping.unlockCue,
    futureRequirementNote: linkedSkillIds.length ? `agapat側で要件を決める候補: ${linkedSkillIds.join(", ")}` : "agapat側で要件を追加する余地あり"
  };
}

function buildSkillIndex(stages: LearningStagePlan[]) {
  return stages.reduce<Record<string, string[]>>((acc, stage) => {
    stage.linkedSkillIds.forEach((skillId) => {
      acc[skillId] = unique([...(acc[skillId] ?? []), stage.stageId]);
    });
    return acc;
  }, {});
}

function deriveCuriosityCue(world: LearningRpgTheme["worlds"][number]) {
  if (world.stages.some((stage) => stage.stage_type === "boss")) return "ボスを越えると道が開く構造";
  if (world.stages.some((stage) => stage.stage_type === "implementation")) return "手を動かすことで先へ進む構造";
  if (world.stages.some((stage) => stage.stage_type === "order_puzzle")) return "順序をそろえることで理解が進む構造";
  return "理解がルートを広げる構造";
}

export function buildLearningThemePlan(theme: LearningRpgTheme): LearningThemePlan {
  const worldPlans = theme.worlds.map((world) => {
    const stagePlans = world.stages.map(deriveStagePlan);
    return {
      worldId: world.world_id,
      title: world.title,
      summary: world.summary,
      curiosityCue: deriveCuriosityCue(world),
      stageCount: stagePlans.length,
      stagePlans
    };
  });
  const skillIndex = buildSkillIndex(worldPlans.flatMap((world) => world.stagePlans));
  const primaryGate =
    worldPlans
      .flatMap((world) => world.stagePlans)
      .find((stage) => stage.gateKind === "learning_gate" || stage.gateKind === "knowledge_gate" || stage.gateKind === "quiz_gate") ?? null;
  return {
    themeId: theme.theme_id,
    name: theme.name,
    shortName: theme.short_name,
    worldview: theme.worldview,
    learningLoop: "stage → skill → gate → route unlock → reflection",
    designPrinciple: "学びを進捗ではなく、鍵と地図の拡張として扱う",
    gatePalette,
    skillIndex,
    worlds: worldPlans,
    primaryGate,
    nextQuestTitle: theme.next_quest.title,
    nextQuestSummary: theme.next_quest.summary,
    nextQuestDeviceRequirement: theme.next_quest.device_requirement
  };
}

export function buildLearningFramework(dashboard: LearningRpgDashboard) {
  return dashboard.themes.map((theme) => buildLearningThemePlan(theme));
}

export function selectLearningThemePlan(dashboard: LearningRpgDashboard, themeId?: string) {
  const plans = buildLearningFramework(dashboard);
  return plans.find((plan) => plan.themeId === themeId) ?? plans[0] ?? null;
}
