# Task: Learning RPG Card Exploration MVP

## Status

Completed

## Created date

2026-05-16

## Updated date

2026-05-16

## Target repository

```text
Fastmaster15/learning-rpg
```

## Summary

Implemented a temporary Japanese-history card exploration MVP for `/product-lab/learning-rpg`.

### Delivered

- Three scene transitions: 飛鳥の町, 職人の作業場, 寺の入口
- Bubble-style hotspots with `未確認 / 完了済み / ロック中` states
- Card acquisition and card-book progress for the 飛鳥 pack
- 3-choice card events driven by owned cards
- Card-dependent reaction changes
- S-rank `飛鳥寺` gate unlock flow
- No visible tile movement, battle, equipment, or save UI in the MVP surface

### Verification

- `NEXT_DISABLE_SWC_NATIVE=1 npm run build`
- `npm run lint`

