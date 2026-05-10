import dashboardJson from "@/data/learning-rpg.json";

export type LearningRpgStage = {
  stage_id: string;
  world_id: string;
  title: string;
  summary: string;
  status: "cleared" | "in_progress" | "locked";
  device_requirement: "mobile_ok" | "mobile_preferred" | "both" | "desktop_preferred" | "desktop_required";
  stage_type: string;
  exp_reward: number;
  linked_skill_ids?: string[];
};

export type LearningRpgTheme = {
  theme_id: string;
  name: string;
  short_name: string;
  worldview: string;
  primary_device: string;
  description: string;
  device_policy: {
    mobile: string;
    desktop: string;
  };
  player: {
    level: number;
    exp: number;
    next_level_exp: number;
    title: string;
  };
  worlds: Array<{
    world_id: string;
    title: string;
    summary: string;
    stages: LearningRpgStage[];
  }>;
  items: string[];
  bosses: string[];
  next_quest: {
    title: string;
    summary: string;
    device_requirement: LearningRpgStage["device_requirement"];
  };
};

export type LearningRpgDashboard = {
  schema_version: string;
  domain: string;
  status: string;
  purpose: string;
  engine: {
    name: string;
    summary: string;
    shared_parts: string[];
    mvp_note: string;
  };
  themes: LearningRpgTheme[];
};

export const learningRpgDashboard = dashboardJson as LearningRpgDashboard;

