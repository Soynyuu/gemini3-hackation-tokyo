# Vibe Architect

**LLM → Human communication through 3D voxels.**

Vibe Architect inverts the typical AI interaction model. Instead of humans struggling to verbalise vague aesthetics for an LLM, the LLM expresses an abstract "vibe" as a hidden 3D voxel sculpture — and humans interpret it through building.

Built for Gemini 3 Hackathon Tokyo.

## Packages

| Package | Description | Public |
|---------|-------------|--------|
| [microvoxel-5](https://www.npmjs.com/package/microvoxel-5) | Voxel scoring & VibeVector analysis | npm |
| `web` | Vibe Architect game client (React + Three.js) | No |

## Quick Start

**Live Demo**: https://gemini-vibe-architect.pages.dev

1. 上記URLにアクセスします
2. タイトル画面で **Gemini API Key** を入力します（キーはブラウザの `localStorage` にのみ保存されます）
3. 「接続を開始する」ボタンを押すと、Gemini がランダムなお題（バイブス）と構造を生成します
4. 制限時間内にお題に沿った3D構造を構築してください
5. 終了後、Gemini Pro Vision があなたの作品を視覚的に解析し、適合スコアとフィードバックを提供します

### Local Development

```bash
cd web
bun install
bun dev
```

### Deploy (Cloudflare Pages)

```bash
bun run build
bunx wrangler pages deploy dist --project-name gemini-vibe-architect
```

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
