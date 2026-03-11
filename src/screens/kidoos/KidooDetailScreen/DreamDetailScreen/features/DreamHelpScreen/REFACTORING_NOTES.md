# DreamHelpScreen Refactoring Notes

**Current State**: 469 lines (monolithic)
**Goal**: Fragment into 4 semantic sections (~100 L each)

## Fragmentation Plan

### Structure to Create
```
DreamHelpScreen/
├── index.tsx (main component, ~50 L)
├── sections/
│   ├── BedtimeHelpSection.tsx (Startup + Red + Config Loaded)
│   ├── WakeupHelpSection.tsx (Pairing + Rainbow)
│   ├── DefaultColorHelpSection.tsx (Red Pulse + Child Request)
│   └── NighttimeAlertHelpSection.tsx (Parent Response)
├── utils/
│   └── colorHelpers.ts (darkenColor + icon helpers)
└── types/
    └── ColorItem.ts (ColorItem interface + COLOR_ITEMS)
```

## Implementation Steps

1. **Extract utils** (~30 L)
   - `colorHelpers.ts`: darkenColor(), PulsingLedIcon, SpiralLedIcon

2. **Extract types** (~50 L)
   - `types/ColorItem.ts`: ColorItem interface + COLOR_ITEMS array
   - Shared between all sections

3. **Create sections** (~100 L each)
   - Each section renders a subset of COLOR_ITEMS
   - Uses common ColorItem component
   - Grouped by use case (bedtime, wakeup, etc)

4. **Refactor main** (~50 L)
   - Import sections
   - Render in ScrollView
   - Title + header only

## Benefits

- ✅ Each section ~100 L (vs 469 L total)
- ✅ Semantic grouping by feature
- ✅ Easier to maintain/test individual sections
- ✅ Reusable utils and types
- ✅ Follows component composition patterns

## Estimated Effort

- Extraction: 20 min
- Testing: 10 min
- **Total: ~30 min for full implementation**

## Notes

- COLOR_ITEMS can stay in types/ColorItem.ts
- Icon components (PulsingLedIcon, SpiralLedIcon) → utils/
- Keep main index.tsx minimal (composition only)
- Each section is pure, no hooks needed
