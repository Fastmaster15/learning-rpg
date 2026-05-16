# Deprecated: Classic Field/Battle RPG Prototype

## Status

This folder records the retired classic RPG prototype.

The classic prototype used tile movement, field maps, random encounters, battle screens, equipment, HP/MP, items, and a forest boss loop.

It is no longer the active direction for Learning RPG.

## Reason for deprecation

The current Learning RPG direction is:

- historically grounded learning first
- one-illustration exploration maps
- speech-bubble hotspots
- historical card collection
- three-choice card interactions
- card gates
- S-rank historical cards
- cross-era card links

The classic field/battle RPG loop did not fit the new core design well enough.

## Former active files

The following active implementation files were removed from the runtime after being superseded by the card exploration MVP direction:

- `src/components/product-lab/LearningRpgClient.tsx`
- `src/components/product-lab/LearningRpgScreens.tsx`
- `src/components/product-lab/learning-rpg/HeroSprite.tsx`
- `src/components/product-lab/learning-rpg/EnemySprite.tsx`
- `src/components/product-lab/learning-rpg/BossSprite.tsx`
- `src/lib/learning-rpg-game.ts`
- `src/lib/learning-rpg-battle.ts`
- `src/lib/learning-rpg-learning.ts`
- `src/lib/learning-rpg-persistence.ts`

The old implementation remains recoverable from Git history before the cleanup commit.

## Replacement direction

The active MVP should implement:

1. Chapter 1 Asuka illustration exploration screen
2. Bubble hotspot states: unvisited, in progress, completed, revisit available, locked
3. Historical card pack and card ledger
4. Three-choice card interactions from owned cards
5. Card gates based on specific cards, counts, or sets
6. S-rank `飛鳥寺` card unlock

Primary spec:

- `docs/planning/integrated-learning-rpg-mvp-spec.md`

Related specs:

- `docs/planning/illustration-hotspot-exploration-spec.md`
- `docs/planning/card-choice-interaction-spec.md`
- `docs/planning/card-gate-progression-spec.md`
- `docs/planning/card-driven-event-progression-spec.md`
