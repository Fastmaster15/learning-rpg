export const LEARNING_RPG_IMAGE_ROOT = "/images/learning-rpg";
export const LEARNING_RPG_CHARACTER_ROOT = `${LEARNING_RPG_IMAGE_ROOT}/characters`;
export const LEARNING_RPG_BOSS_ROOT = `${LEARNING_RPG_IMAGE_ROOT}/bosses`;
export const LEARNING_RPG_FIELD_ATLAS_ROOT = `${LEARNING_RPG_IMAGE_ROOT}/field-atlas`;

export const learningRpgAssetPaths = {
  heroFront: `${LEARNING_RPG_CHARACTER_ROOT}/hero-front.jpg`,
  forestLord: `${LEARNING_RPG_BOSS_ROOT}/forest-lord.jpg`,
  fieldAtlasRoot: LEARNING_RPG_FIELD_ATLAS_ROOT
} as const;
