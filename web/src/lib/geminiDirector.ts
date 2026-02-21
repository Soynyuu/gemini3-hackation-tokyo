import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';
import type { DirectorPlan } from '../store/types';

export type DifficultyLevel = 'concrete' | 'stylised' | 'abstract' | 'vibe';

export const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; description: string }[] = [
    { value: 'concrete', label: '具象', description: '家・木・塔など、誰でもわかる形' },
    { value: 'stylised', label: 'デフォルメ', description: '形はわかるが、色や配置に個性がある' },
    { value: 'abstract', label: '抽象', description: '感情や概念を形で表現' },
    { value: 'vibe', label: 'バイブス', description: 'テキストの雰囲気だけが手がかり' },
];

const difficultyPrompts: Record<DifficultyLevel, string> = {
    concrete: `
    You are a voxel artist. Build a clearly recognisable real-world object in a 5x5x5 grid.
    Y axis is vertical (0 = ground, 4 = top).

    RULES:
    - Build something anyone can identify: a house, tree, chair, bridge, tower, castle, boat, mushroom, robot, etc.
    - Blocks must be connected. Build from the ground up (y=0).
    - Use realistic colours (brown for wood, green for leaves, red for brick, etc.)
    - Use 15-35 blocks.
    - The vibe_prompt should name the object poetically in Japanese (e.g. "森の奥にひっそり佇む小さな家"). MANDATORY: MUST BE IN JAPANESE.

    Examples:
    - House: floor at y=0, walls y=1-2, triangular roof y=3
    - Tree: brown trunk at (2,0,2)→(2,2,2), green canopy around (2,3,2)
    - Tower: narrow column with wider base, flag on top`,

    stylised: `
    You are a voxel artist with a unique style. Build a recognisable object in a 5x5x5 grid, but with creative liberties.
    Y axis is vertical (0 = ground, 4 = top).

    RULES:
    - The shape should be identifiable but stylised — exaggerated proportions, unusual colours, artistic choices.
    - Example: a tree with purple leaves, a house that leans, a robot with oversized head.
    - Blocks must be connected. Build from ground up.
    - Use 15-35 blocks.
    - Use "emissive" blocks for dramatic effect.
    - The vibe_prompt should describe the mood/style in Japanese (e.g. "夕焼けに染まる歪んだ灯台"). MANDATORY: MUST BE IN JAPANESE.`,

    abstract: `
    You are an abstract voxel sculptor. Create a structure in a 5x5x5 grid that represents a concept or emotion.
    Y axis is vertical (0 = ground, 4 = top).

    RULES:
    - The structure represents an abstract idea: growth, chaos, balance, loneliness, celebration, tension, etc.
    - It should NOT look like a specific real object — instead use form, colour, and space to convey feeling.
    - Use interesting spatial arrangements: spirals, clusters, sparse floating connected pieces, gradients.
    - Blocks should mostly be connected but can have deliberate gaps.
    - Use 15-35 blocks.
    - Use colour and emissive/transparent types to reinforce the concept.
    - The vibe_prompt should describe the feeling in Japanese without naming any object (e.g. "静寂の中に芽生える不安"). MANDATORY: MUST BE IN JAPANESE.`,

    vibe: `
    You are a voxel artist creating pure atmosphere. Create a structure in a 5x5x5 grid.
    Y axis is vertical (0 = ground, 4 = top).

    RULES:
    - Do NOT create anything recognisable. Pure form and colour.
    - The player will only see a short poetic text hint — they must interpret the vibe and build.
    - Focus on: density, verticality, warmth/coolness of colour, clustering vs scattering.
    - Use 10-30 blocks.
    - The vibe_prompt should be a cryptic, poetic, synesthetic Japanese phrase (e.g. "水底から聞こえる光の残響"). MANDATORY: MUST BE IN JAPANESE.
    - This is the hardest difficulty — the prompt should be evocative but deliberately ambiguous.`,
};

const directorSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        grid_size: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "Always [5, 5, 5]"
        },
        voxels: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    pos: {
                        type: Type.ARRAY,
                        items: { type: Type.INTEGER },
                        description: "Array of 3 integers [x, y, z] between 0 and 4"
                    },
                    color: {
                        type: Type.STRING,
                        description: "Hex color code, e.g., #FF3B30, #0A84FF, #30D158"
                    },
                    type: {
                        type: Type.STRING,
                        description: "Must be one of: standard, emissive, transparent"
                    }
                },
                required: ["pos", "color", "type"]
            },
            description: "List of voxels making up the hidden structure."
        },
        vibe_vector: {
            type: Type.OBJECT,
            properties: {
                warmth: { type: Type.INTEGER, description: "0-4" },
                density: { type: Type.INTEGER, description: "0-4" },
                focus: { type: Type.INTEGER, description: "0-4" },
                randomness: { type: Type.INTEGER, description: "0-4" },
                saturation: { type: Type.INTEGER, description: "0-4" },
                verticality: { type: Type.INTEGER, description: "0-4" }
            },
            required: ["warmth", "density", "focus", "randomness", "saturation", "verticality"]
        },
        vibe_prompt: {
            type: Type.STRING,
            description: "A short, poetic prompt in Japanese describing the vibe of the structure."
        },
        hint_svg: {
            type: Type.STRING,
            description: "A valid, simple inline SVG string depicting a 2D abstract shape or silhouette that matches the vibe. Use cyber colors. Max 300x300 viewBox."
        },
        hint_foundation: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    pos: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                    color: { type: Type.STRING },
                    type: { type: Type.STRING }
                },
                required: ["pos", "color", "type"]
            },
            description: "A small subset (1-5 blocks) of the main voxels to act as a starting foundation for the player."
        }
    },
    required: ["grid_size", "voxels", "vibe_vector", "vibe_prompt", "hint_svg", "hint_foundation"]
};

export const generateGeminiDirectorPlan = async (
    apiKey: string,
    difficulty: DifficultyLevel = 'concrete',
): Promise<DirectorPlan> => {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = difficultyPrompts[difficulty] + `

    OUTPUT FORMAT:
    - grid_size must be [5, 5, 5]
    - vibe_vector: rate each axis 0-4 based on the actual structure properties
    - hint_svg: a simple SVG silhouette of the structure from the front
    - hint_foundation: 1-5 starter blocks from the structure as a hint for the player
    - IMPORTANT: The 'vibe_prompt' field MUST be in Japanese. No English allowed in this field.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: directorSchema,
                temperature: 0.9,
            }
        });

        if (!response.text) {
            throw new Error("No response from Gemini");
        }

        const plan = JSON.parse(response.text) as DirectorPlan;
        return plan;
    } catch (error) {
        console.error("Gemini Director Error:", error);
        throw error;
    }
};
