# Task: Learning RPG 16x12 Field Expansion and Multiple Fields

## Status

Active

## Created date

2026-05-16

## Priority

High

## Target repository

```text
Fastmaster15/learning-rpg
```

## Background

Learning RPG currently has a playable first loop:

```text
Title → Town → Field → Encounter → Command battle → EXP/GOLD/Level up → Equipment/Inn → Treasure → Mini boss
```

This is good as a prototype, but the field is still too small and feels more like a board than an RPG world.

Current limitations:

- `fieldMap` is only 5x5.
- `FieldScreen` uses fixed `grid-cols-5 grid-rows-5`.
- The map does not yet support multiple connected areas.
- `goal` tile logic exists, but the current map does not actually contain a `goal` tile.
- Player position and screen state can become inconsistent when returning to town or opening status from field.
- Healing actions in battle currently do not consume a turn, weakening battle tension.

The next phase should make the game feel like a small connected RPG world, not a single-board prototype.

## Goal

Expand the field from a single 5x5 map into a multi-field structure, starting with **16 x 12 fields**.

The player should be able to move through multiple connected fields while preserving the existing RPG loop.

Target experience:

```text
Town Outskirts
↓
Grassland Road
↓
Forest Edge
↓
Forest Depth
↓
Mini Boss
↓
Goal / Chapter Clear Point
```

This task is about building a field architecture that can grow into later chapters.

## Key user direction

- Field size should be **16 x 12** for now.
- Add **multiple fields**, not just one larger field.
- Keep the hero visibly standing on the current tile.
- Make the field feel more exploratory.
- Preserve the current playable loop.

## Non-goals

Do not implement these in this task:

- Full chapter system
- Real learning quiz logic
- Generated image assets
- Enemy sprites
- Four-direction walking animation
- BGM
- Complex save slot UI
- Full RPG engine rewrite
- Large visual redesign unrelated to the field expansion

## Read first

Inspect these files first:

```text
README.md
docs/requirements/classic-jrpg-experience-requirements.md
src/app/product-lab/learning-rpg/page.tsx
src/components/product-lab/LearningRpgClient.tsx
src/components/product-lab/LearningRpgScreens.tsx
src/lib/learning-rpg.ts
src/lib/learning-rpg-game.ts
src/lib/learning-rpg-battle.ts
src/lib/learning-rpg-persistence.ts
src/data/learning-rpg.json
```

## Required changes

### 1. Replace single `fieldMap` with multiple 16x12 fields

Create a multi-field data structure.

Suggested shape:

```ts
export type FieldId = "town_outskirts" | "grassland_road" | "forest_edge" | "forest_depth";

export type FieldDefinition = {
  id: FieldId;
  name: string;
  width: number;
  height: number;
  startPosition: Position;
  tiles: string[][];
  encounterProfile: "safe" | "grassland" | "forest" | "boss_area";
  exits: Array<{
    x: number;
    y: number;
    toFieldId: FieldId;
    toPosition: Position;
    label: string;
  }>;
};
```

Use **16 columns x 12 rows** for every implemented field.

Minimum fields:

```text
1. town_outskirts
   - includes town entrance
   - light grass / road / water / safe surroundings
   - connects to grassland_road

2. grassland_road
   - main travel field
   - grassland enemies
   - at least one chest or optional side path
   - connects to town_outskirts and forest_edge

3. forest_edge
   - stronger enemies
   - denser forest
   - second chest or small reward if easy
   - connects to grassland_road and forest_depth

4. forest_depth
   - mini boss field
   - contains boss tile
   - contains goal tile, reachable after mini boss defeat
   - connects back to forest_edge
```

The exact layouts can be simple, but the movement should feel like gradually leaving safety and entering danger.

### 2. Add `fieldId` and `previousScreen` to `GameState`

Update game state to track the current field and status return state.

Suggested additions:

```ts
type GameState = {
  fieldId: FieldId;
  position: Position;
  previousScreen?: Screen | null;
  // existing fields...
};
```

Rules:

- Initial field should be `town_outskirts` or equivalent.
- Town screen can remain a separate screen, but field position should stay consistent.
- Returning to town should reset `fieldId` and `position` to town entrance / starting point.
- Moving from one field to another should update both `fieldId` and `position`.

### 3. Make map rendering dynamic

Remove fixed `grid-cols-5 grid-rows-5` from `FieldScreen`.

Compute width and height from the active field definition.

Suggested implementation:

```tsx
const activeField = getActiveField(game.fieldId);

<div
  className="grid ..."
  style={{
    gridTemplateColumns: `repeat(${activeField.width}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${activeField.height}, minmax(0, 1fr))`
  }}
>
```

Requirements:

- 16x12 field should render without breaking the page.
- Mobile should remain playable.
- If needed, make the field horizontally scrollable or use smaller tile sizing on mobile.
- Do not hardcode 16 or 12 inside rendering logic except as field data.

### 4. Keep / extract `HeroSprite`

The player should remain visible on the current tile.

Create a reusable component if reasonable:

```text
src/components/product-lab/learning-rpg/HeroSprite.tsx
```

or keep it in `LearningRpgScreens.tsx` if simpler.

Hero display order:

1. Use future image path if available.
2. If image is not available, use CSS fallback hero.
3. Use the current `勇` text only as final fallback.

P0 requirement:

- It must be obvious which tile the player is standing on.
- The hero should sit visually on top of the tile, not replace the tile entirely.
- The implementation should be easy to swap with a real sprite later.

### 5. Add field transitions

Add transition behavior when the player steps on exit coordinates.

Suggested tile types:

```text
town
road
grass
forest
hill
water
shore
chest
boss
goal
exit
```

An exit should be defined by coordinates in the active field definition, not only by tile name.

Behavior:

- Step onto an exit coordinate.
- Update `fieldId` and `position` to destination field and coordinate.
- Add a log line like `森の入口へ進んだ。`
- Update dialogue if helpful.

### 6. Revise encounter logic by field / tile

Current encounter logic is based only on tile and step count.

Update it so encounter rate can differ by field and tile.

Suggested rules:

```text
town_outskirts: no random encounter or very rare
grassland_road: moderate encounter
forest_edge: frequent encounter
forest_depth: frequent / stronger encounter
boss tile: mini boss only
water: blocked
```

Do not overbalance this yet. Keep it simple.

### 7. Use `goal` tile properly

Add a real `goal` tile in `forest_depth`.

Behavior:

- Before mini boss defeat: reaching goal should show a message that the forest's light is unstable or the path is blocked.
- After mini boss defeat: reaching goal should set `objectiveCleared = true` and show a chapter-clear style message.
- Keep mini boss victory as a major milestone, but make the goal tile the final confirmation point if possible.

Preferred flow:

```text
Enter forest_depth
↓
Fight mini boss
↓
miniBossDefeated = true
↓
Move to goal tile
↓
objectiveCleared = true
↓
Display clear message
```

### 8. Fix status screen return behavior

Currently, status return behavior can send the player back to town even if they opened status from the field.

Add a previous-screen mechanism.

Suggested behavior:

- Opening status from town returns to town.
- Opening status from field returns to field.
- Opening status from battle returns to battle if battle state exists.

Suggested functions:

```ts
function openStatus() {
  setGame((current) => ({
    ...current,
    previousScreen: current.screen,
    screen: "status"
  }));
}

function closeStatus() {
  setGame((current) => ({
    ...current,
    screen: current.previousScreen ?? "town",
    previousScreen: null
  }));
}
```

### 9. Fix return-to-town behavior

When returning to town from field or defeat, keep screen and position consistent.

Add helper if useful:

```ts
function returnToTown(current: GameState): GameState
```

Behavior:

- `screen = "town"`
- `fieldId = "town_outskirts"`
- `position = town entrance / starting position`
- `currentEnemy = null`
- Add clear log / dialogue

Do not only call `setScreen("town")` when the intent is returning to town.

### 10. Make healing consume a battle turn

Currently, `heal` and `herb` can restore HP without enemy response.

Update battle flow:

- `たたかう` → enemy turn if enemy survives
- `火の玉` → enemy turn if enemy survives
- `小回復` → enemy turn
- `薬草` → enemy turn
- `にげる` → success or enemy turn on failure

This makes battle choices meaningful.

Edge cases:

- If healing restores HP, enemy attacks afterward.
- If the enemy defeats the player after healing, defeat behavior should still trigger.
- If there is no current enemy, do nothing safely.

### 11. Preserve existing save data as much as possible

Existing localStorage saves may not have `fieldId` or `previousScreen`.

Update `loadGame()` to safely default missing fields.

Suggested defaults:

```ts
fieldId: parsed.fieldId ?? "town_outskirts"
previousScreen: null
position: parsed.position ?? getField("town_outskirts").startPosition
```

If an old saved position is outside the new field dimensions, reset to the starting field position.

Do not introduce hard crashes for old saves.

### 12. Update README / docs lightly

Update README or add a short implementation note if appropriate.

Mention:

- fields are now 16x12
- multiple connected fields exist
- the prototype now supports a small world route from town outskirts to forest depth

Do not over-document if the code is clear.

## Suggested implementation order

1. Add field data model and 16x12 fields.
2. Add `fieldId` to `GameState`.
3. Update `getTile`, `isInsideMap`, `shouldEncounter`, and field helpers.
4. Update `FieldScreen` dynamic rendering.
5. Add field transition handling in `move()`.
6. Fix status return behavior.
7. Fix return-to-town behavior.
8. Make heal/herb consume a turn.
9. Add save migration defaults.
10. Run build and lint.

## Map design guidance

The 16x12 fields should be readable, not random.

### town_outskirts

Should include:

- town tile near left / lower area
- road leading east or north
- grassland around the road
- water or shore as boundary
- exit to grassland_road

### grassland_road

Should include:

- road crossing the field
- grass areas
- at least one chest or side reward if easy
- exit back to town_outskirts
- exit to forest_edge

### forest_edge

Should include:

- denser forest
- some road or path
- stronger encounter profile
- exit to grassland_road
- exit to forest_depth

### forest_depth

Should include:

- boss tile
- goal tile
- dense forest / hills
- exit back to forest_edge
- no need for many random features yet

## Acceptance criteria

- Field system supports multiple fields.
- Each implemented field is 16 columns x 12 rows.
- Player can move around the active field.
- Field rendering is dynamic and no longer hardcoded to 5x5.
- Player can transition between at least 4 fields.
- Hero remains visibly on the current tile.
- Town return keeps screen, fieldId, and position consistent.
- Status screen returns to the correct previous screen.
- Heal and herb consume a battle turn.
- Goal tile exists and is meaningful after mini boss defeat.
- Existing town → field → battle → growth → treasure → mini boss loop still works.
- Old localStorage saves do not crash the app.
- Mobile layout remains usable.
- `npm run build` passes.
- If lint is configured and works, `npm run lint` passes or known issues are documented.

## Validation commands

Run:

```bash
npm run build
```

If available:

```bash
npm run lint
```

## Known risks

- 16x12 maps may become too small on mobile if rendered as a single full grid.
- Dynamic grid sizing may require careful CSS to avoid overflow.
- Multiple fields require save migration defaults.
- Old `getTile(position)` logic may need to become `getTile(fieldId, position)`.
- Adding multiple fields without clear exits can make the player feel lost.
- Increasing field size without encounter balancing can make the game tedious.

## Final response format for Codex

When complete, report:

- Files changed
- Field IDs added
- Final field size
- How multiple field transitions work
- How dynamic grid rendering was implemented
- How status return behavior was fixed
- How return-to-town behavior was fixed
- How heal/herb turn consumption was implemented
- Build / lint results
- Known limitations
- Recommended next task
