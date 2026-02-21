# Vibe Architect

**Can you *feel* what an AI is thinking?**

Vibe Architect is a 3D voxel building game where the roles are reversed: an LLM expresses an abstract aesthetic as a hidden voxel sculpture, and you try to recreate the same *feeling* from a single cryptic text prompt.

Built for Gemini 3 Hackathon Tokyo.

> **[Play the demo →](https://vibe-architect.vercel.app)**

## How it works

1. **Gemini generates a hidden voxel structure** with a VibeVector and an abstract prompt (e.g. "孤立した塔の上に漂う、かすかな朝の光")
2. **You build** a voxel sculpture on a 5×5×5 grid in 120 seconds, guided only by the text prompt
3. **Reveal** — both structures appear side-by-side with dual scores and Gemini Vision commentary

### Scoring

| Component | Weight | Method |
|-----------|--------|--------|
| Structure | 60% | Jaccard similarity of voxel positions |
| Vibe | 40% | VibeVector distance — how closely the *aesthetic feel* matches |

Scoring is powered by [microvoxel-5](https://www.npmjs.com/package/microvoxel-5).

## Running locally

```bash
bun install
bun dev
```

### Gemini API key

The game prompts for a Gemini API key on the title screen. The key is stored in your browser's `localStorage` only and is never sent to any backend — it's used exclusively for direct client-side calls to the Gemini API.

Without a key, the game falls back to the mock director (randomly generated plans, no AI judge commentary).

## Tech stack

| Layer | Technology |
|-------|-----------|
| 3D rendering | React Three Fiber + drei |
| State | Zustand |
| LLM | Gemini 2.5 Flash (director) + Gemini 1.5 Pro Vision (judge) |
| Scoring | [microvoxel-5](https://www.npmjs.com/package/microvoxel-5) |
| Build | Vite |
| Styling | Tailwind CSS |

## Project structure

```
src/
├── components/
│   ├── 3d/              # Three.js voxel grid renderer
│   └── ui/              # Slice editor, toolbar, HUD, countdown
├── lib/
│   ├── geminiDirector.ts  # Gemini structured output → DirectorPlan
│   ├── geminiJudge.ts     # Gemini Vision → vibe score + commentary
│   ├── scoring.ts         # Re-exports from microvoxel-5
│   └── mockDirector.ts    # Offline fallback
├── store/
│   ├── gameStore.ts       # Zustand game state
│   └── types.ts           # Store types
├── pages/
│   └── Teaser.tsx         # Landing page
└── App.tsx                # Main game flow (title → build → reveal)
```

## Licence

MIT
