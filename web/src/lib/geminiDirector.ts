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
    あなたはボクセルアーティストです。5x5x5のグリッドに、誰が見てもわかる単純な物体を1つ作ってください。
    Y軸が上方向（0=地面、4=天井）。

    ルール:
    - 必ず「単純で具体的な物体」を1つだけ作る。傘、椅子、木、家、きのこ、剣、ケーキ、車、船、ロボットなど。
    - 抽象的な概念や雰囲気ではなく、形を見れば何かわかるもの。
    - ブロックは繋がっていること。地面(y=0)から積み上げる。
    - 現実的な色を使う（木なら茶色、葉なら緑、レンガなら赤など）。
    - 15〜35ブロック使用。
    - vibe_promptは物体の名前をそのまま日本語で短く書く。装飾や詩的表現は不要。
      良い例: "傘", "きのこ", "小さな家", "赤い車", "一本の木"
      悪い例: "森の奥にひっそり佇む小さな家"（詩的すぎ）、"静寂の塔"（抽象的すぎ）

    構造の例:
    - 家: y=0に床、y=1-2に壁、y=3に三角屋根
    - 木: (2,0,2)→(2,2,2)に茶色の幹、(2,3,2)周辺に緑の葉
    - 傘: y=3-4に平たい円形の傘部分、(2,0,2)→(2,3,2)に棒`,

    stylised: `
    あなたはボクセルアーティストです。5x5x5のグリッドに物体を作りますが、少し解釈の余地があるお題にしてください。
    Y軸が上方向（0=地面、4=天井）。

    ルール:
    - お題は「物体や場所は想像できるが、作り手の解釈が入る」もの。
      良い例: "海", "お祭り", "夕焼けの街", "宇宙ステーション", "魔法の森", "廃墟"
      悪い例: "傘"（具体的すぎ）、"存在の不安"（抽象的すぎ）
    - 形は見れば何を表しているかわかるが、色や配置に個性がある。
    - ブロックは繋がっていること。
    - 15〜35ブロック使用。
    - emissiveブロックを効果的に使う。
    - vibe_promptは場所やシーンを日本語で短く書く。
      良い例: "夕焼けの海", "ネオンの街角", "雪の温泉", "月面基地"`,

    abstract: `
    あなたは抽象ボクセル彫刻家です。5x5x5のグリッドに、感情や概念を表す構造を作ってください。
    Y軸が上方向（0=地面、4=天井）。

    ルール:
    - 具体的な物体ではなく、感情・概念・状態を形と色で表現する。
      良い例: "成長", "混沌", "孤独", "祝福", "緊張", "バランス"
    - 形、色、空間の使い方で感情を伝える（螺旋、密集、散在、グラデーションなど）。
    - ブロックは基本的に繋がっているが、意図的な隙間はOK。
    - 15〜35ブロック使用。
    - emissive/transparentで概念を強調する。
    - vibe_promptは感情や概念を日本語で短く書く。物体名は含めない。
      良い例: "静寂の中に芽生える不安", "崩壊と再生", "沸き立つ喜び"`,

    vibe: `
    あなたは純粋な雰囲気を作るボクセルアーティストです。5x5x5のグリッドに構造を作ってください。
    Y軸が上方向（0=地面、4=天井）。

    ルール:
    - 認識できるものは一切作らない。純粋な形と色。
    - プレイヤーは短い詩的テキストだけを手がかりにして自分で構築する。
    - 密度、垂直性、色の温度感、集合/散在に注目。
    - 10〜30ブロック使用。
    - vibe_promptは詩的で謎めいた共感覚的な日本語フレーズにする。
      良い例: "水底から聞こえる光の残響", "溶けかけた記憶の匂い"
    - 最高難度。意味深だが意図的に曖昧に。`,
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
            description: "構造のバイブを表す短い日本語の詩的なプロンプト。必ず日本語で出力すること。英語は不可。"
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
    - vibe_prompt: MUST be in Japanese (日本語). Never output English for this field.
    - vibe_vector: rate each axis 0-4 based on the actual structure properties
    - hint_svg: a simple SVG silhouette of the structure from the front
    - hint_foundation: 1-5 starter blocks from the structure as a hint for the player
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
