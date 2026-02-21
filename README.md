# LLM → Human: Vibe Project

## Overview
We aim to invert the common Human→LLM instruction flow. Instead of humans trying to verbalize a vague aesthetic request ("make it feel nice"), an LLM produces a structured, perceivable artifact that communicates an intended "vibe" to a human. The artifact is designed so humans can easily judge and iterate on its core qualities without needing to translate them into words.

## Motivation
People can often tell when something "feels right" but cannot precisely describe why. Current tooling expects users to produce detailed instructions for LLMs; we propose the opposite: let LLMs express intent through mediums that humans can sense and evaluate directly.

## Problem framing
- Goal: Enable LLMs to communicate an abstract aesthetic ("vibe") to humans in a way that is:
  - Easily perceived and evaluated by humans
  - Structurable so an LLM can generate it reliably
  - Comparable against a ground-truth or target vibe

## Why LLM → Human
- Humans remain the best judges of subjective qualities. If LLMs can externalize their internal "intent" into a medium humans can inspect, humans can select/refine without needing to translate to exact wording.
- This enables new workflows: LLMs propose, humans curate.

## Chosen medium: Voxels (3D digital blocks)

We pivot to a voxel-based medium — a small 3D grid of colored blocks — as the canonical canvas for LLM→Human Vibe transfer. Voxels hit the sweet spot: visually expressive, structurally simple (a 3D array), and easy to compare mathematically against a hidden "ground-truth" voxel arrangement the LLM holds.

Why voxels?
- Visual + tactile feel: arrangements read as shapes, silhouettes, and negative space that humans judge quickly.
- Structured: represented as a 3D array of cells `V[x][y][z]` with simple attributes (presence, color, emissive flag), which lets the LLM compute exact structural differences.
- Fast to iterate: small grids (e.g., 5x5x5) keep a 2–3 minute play window realistic while still offering diverse forms.

Core constraints for hackathon MVP:
- Grid size: 5x5x5 (125 cells) — small and fast.
- Voxel attributes: `pos: [x,y,z]`, `color: #RRGGBB`, `type: [standard|emissive|transparent]`.
- Deterministic rendering: viewer displays colors and simple lighting consistently to make visual comparisons repeatable.

## Representation & structure
- Vibe vector: keep a compact, low-dimensional descriptor (6 axes) that the LLM outputs alongside or instead of a full voxel plan. Example axes: `warmth`, `density`, `focus`, `randomness`, `saturation`, `verticality`.
- Discretize each axis to 5 levels (0–4) so the LLM can reliably output tokenized values.
- Mapping to voxels: the system converts a vibe vector into pixel-level modifications or a suggested voxel plan:
  - `warmth` → color temperature mapping (cool blues → warm reds)
  - `density` → fraction of occupied cells in a bounding volume
  - `focus` → center-of-mass weighting vs. edge scattering
  - `randomness` → noise in placement (Perlin/simple RNG)
  - `saturation` → color intensity / presence of emissive voxels
  - `verticality` → preference for height vs. spread

This two-tier design (vector + voxels) keeps prompts compact while allowing exact structural comparison.

## Game loop — Vibe Architect (2–3 minutes)
1) Hidden goal generation (0–20s): the LLM samples a hidden voxel plan (the "director's ideal") and produces a short abstract Vibe prompt and optionally an Imagen-style inspiration image.
2) Build phase (20–140s): the player has ~2 minutes to assemble a voxel sculpture on a 5x5x5 grid guided only by the Vibe prompt / inspiration image. During play the LLM can stream JSON feedback periodically (every 5–10s) with short comments.
3) Finalize (140–180s): the player submits. The system computes:
   - Structure score: exact coordinate matches / Jaccard similarity between voxel occupancy sets.
   - Vibe score: Gemini Vision evaluates the screenshot vs. the Vibe prompt and returns a qualitative/quantitative rating.
4) Reveal: display the hidden director plan, the player's sculpture, scores, and the LLM's commentary.

Players can then replay quickly with a different Vibe or director personality.

## Scoring & evaluation
- Structural score: compute voxel-set similarity (intersection / union) and weight matches by `type` and `color` similarity. Report as percentage.
- Vibe score: use Gemini Pro Vision to score how well the player's screenshot matches the abstract Vibe prompt (0–100) and return JSON with `score`, `rationale`, and `salient_features`.
- Combined score: weighted sum (e.g., 0.6 structure + 0.4 vibe) for a final ranking.

For experiments, track convergence (# of builds to reach threshold), and inter-rater agreement when multiple humans judge the same Vibe.

## MVP plan — what we'll build for the hackathon
1) Web voxel builder (`/web/voxel-board`)
   - A lightweight Three.js or React + canvas UI with a 5x5x5 editable grid, color picker, quick-fill tools (pour, pillar, scatter).
   - Export/import JSON for `voxels` and `vibe_vector`.
2) LLM integration
   - Director agent: outputs hidden `director_plan` (voxel JSON), `vibe_prompt` (text), and optional `imagen_prompt` for an inspiration image.
   - Live feedback: use structured JSON responses from Gemini for periodic hints and emotional commentary.
3) Scoring & reveal
   - Compute structural and vibe scores server-side; show side-by-side reveal and LLM commentary.

Keep the first demo local and offline-capable (mock LLM outputs) so we can iterate without API limits, then switch to Gemini endpoints for the final demo.

## Implementation notes
- Data structures (hackathon-ready JSON):

```json
{
  "grid_size": [5,5,5],
  "voxels": [
    {"pos":[0,0,1], "color":"#FF3B30", "type":"emissive"},
    {"pos":[1,2,0], "color":"#0A84FF", "type":"standard"}
  ],
  "vibe_vector": {"warmth":3, "density":2, "focus":4, "randomness":1, "saturation":3, "verticality":2},
  "vibe_prompt":"Faint morning glow over an isolated tower"
}
```

- LLM outputs should use `response_mime_type: "application/json"` and conform to a simple schema: `director_plan`, `vibe_vector`, `vibe_prompt`, `imagen_prompt` (optional), and periodic `feedback` blobs.
- Rendering: keep lighting neutral and deterministic; use an orthographic camera for fair screen-space comparisons.
- Local-first dev: implement a mock director generator and an offline-scoring function so we can demo without external APIs.

## Quick Start (Web)

このプロジェクトは現在 Cloudflare Pages にデプロイされています。

🌍 **Live Demo**: [https://gemini-vibe-architect.pages.dev](https://gemini-vibe-architect.pages.dev)

### 遊び方
1. 上記URLにアクセスします。
2. タイトル画面で **Gemini API Key** を入力します。（キーはブラウザの `localStorage` にのみ保存されます）
3. 「接続を開始する」ボタンを押すと、Geminiがランダムなお題（バイブス）と構造を生成します。
4. 制限時間内にお題に沿った3D構造を構築してください。
5. 終了後、Gemini Pro Vision があなたの作品を視覚的に解析し、適合スコアとフィードバックを提供します。

## Local Development / Deployment

### セットアップ
```bash
cd web
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```

### デプロイ (Cloudflare Pages)
Wrangler を使用してデプロイします。
```bash
npm run build
npx wrangler pages deploy dist --project-name gemini-vibe-architect
```

---
*Created for Gemini 3 Hackathon Tokyo 2026*

## Next steps (MVP roadmap)
1. Finalize 6–8 vibe axes and discrete levels.
2. Implement the Tile Board digital prototype and a small React UI (`/web/tile-board`).
3. Create minimal LLM prompt that returns JSON vibe vectors; integrate with OpenAI/GPT or local model.
4. Run closed tests with 10 users to collect feedback loops and measure convergence.

---

This repository is private for the Gemini3 Hackation Tokyo team. See the issue "Design: LLM→Human Vibe — problem & proposed solution" for tracking research and decisions.
