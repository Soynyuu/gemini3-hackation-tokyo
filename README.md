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

## Candidate mediums (prioritized)
1. Physical tokens (stackable blocks / colored tiles)
   - Pros: tangible, haptic feedback, good for public demos
   - Cons: logistic overhead, manufacturing
2. Visual boards (arrangements of shapes, colors, spacing)
   - Pros: easy to render, programmatic, supports rapid iteration
   - Cons: less haptic
3. Card decks with abstract attributes (cards map to attribute vectors)
   - Pros: low-fidelity, great for playtesting and rules games
4. Dynamic lighting/audio patterns (temporal dimension)
   - Pros: expressive for mood; good for immersive prototypes
   - Cons: needs hardware

## Representation & structure
- Define a low-dimensional vibe vector (e.g., 6–8 axes): warmth, contrast, tempo, randomness, density, openness, saturation, focus.
- Each axis has a small discrete set (e.g., 5 levels) so LLM outputs can be tokenized.
- Map vector slices to medium specifics:
  - For blocks: color = saturation, height = density, spacing = openness, tilt = randomness
  - For board: layout grid with color/value per cell

## Interaction loop
1. LLM generates a vibe vector or artifact description.
2. System renders artifact (visual/physical instructions) and presents to human player.
3. Human gives feedback: binary accept/reject, scalar rating, or edits (move tiles, swap cards).
4. LLM ingests feedback and proposes a refinement (new vector/artifact).

## Evaluation & Ground Truth
- Use pairwise comparison: humans choose between LLM output and target sample.
- Use reconstruction accuracy: can a human reproduce the target vibe when given LLM output as guidance?
- Measure convergence speed: how many refine cycles until human is satisfied?

## Prototype ideas (MVPs)
1. Tile Board (digital)
   - 8x8 grid, each tile has color and blur amount. LLM outputs a 6‑axis vector → mapped to tile parameters.
   - Humans click/drag to adjust; feedback sent back for refinement.
2. Card Game (physical/digital)
   - LLM deals a hand of attribute cards; players assemble a layout to match a sample vibe.
   - Easy for playtesting mechanics.
3. Haptic Blocks (demo)
   - 10 blocks with distinct colors/textures. LLM prescribes stack/arrangement to signal vibe.

## Implementation notes
- LLM prompt design: request a structured JSON output with named axes and discrete levels.
- Start with a deterministic mapping from vector→rendering to keep evaluation consistent.
- Build a small web UI for rapid iteration (React with simple canvas/grid).
- Optionally add simple physical output via a CNC/3D printed tokens set later.

## Next steps (MVP roadmap)
1. Finalize 6–8 vibe axes and discrete levels.
2. Implement the Tile Board digital prototype and a small React UI (`/web/tile-board`).
3. Create minimal LLM prompt that returns JSON vibe vectors; integrate with OpenAI/GPT or local model.
4. Run closed tests with 10 users to collect feedback loops and measure convergence.

---

This repository is private for the Gemini3 Hackation Tokyo team. See the issue "Design: LLM→Human Vibe — problem & proposed solution" for tracking research and decisions.
