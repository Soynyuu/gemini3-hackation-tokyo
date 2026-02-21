# Vibe Architect

**LLM → Human communication through 3D voxels.**

Vibe Architect inverts the typical AI interaction model. Instead of humans struggling to verbalise vague aesthetics for an LLM, the LLM expresses an abstract "vibe" as a hidden 3D voxel sculpture — and humans interpret it through building.

Built for Gemini 3 Hackathon Tokyo.

## Packages

| Package | Description | Public |
|---------|-------------|--------|
| `packages/voxel-core` | [microvoxel-5](https://www.npmjs.com/package/microvoxel-5) — voxel scoring & VibeVector analysis | npm |
| `web` | Vibe Architect game client (React + Three.js) | No |

## Concept

```
┌─────────────────┐     vibe_prompt      ┌─────────────────┐
│   Gemini LLM    │ ──────────────────→  │   Human Player  │
│   (Director)    │   abstract text hint  │   (Builder)     │
│                 │                       │                 │
│  Hidden plan:   │                       │  Builds voxels  │
│  voxels + vibe  │                       │  on 5×5×5 grid  │
└────────┬────────┘                       └────────┬────────┘
         │                                         │
         └──────────────┬──────────────────────────┘
                        ▼
              ┌─────────────────┐
              │  microvoxel-5   │
              │  Structure: 60% │
              │  Vibe:      40% │
              └─────────────────┘
```

1. **Director phase** — Gemini generates a hidden voxel structure with a VibeVector and an abstract text prompt
2. **Build phase** — The player has 120 seconds to build a voxel sculpture guided only by the text prompt
3. **Reveal phase** — Both structures are shown side-by-side with scores and Gemini Vision commentary

## What makes this different

- **VibeVector similarity** — A 6-axis descriptor (warmth, density, focus, randomness, saturation, verticality) that captures the *aesthetic feel* of a 3D structure, enabling numerical comparison of "vibe" independent of exact block placement
- **JSON Schema-driven LLM output** — All data types ship as reusable JSON Schemas for validated structured generation
- **Dual scoring** — Structure overlap (Jaccard, 60%) + aesthetic similarity (VibeVector, 40%)
- **Paradigm inversion** — LLMs propose, humans interpret and build

## Licence

MIT
