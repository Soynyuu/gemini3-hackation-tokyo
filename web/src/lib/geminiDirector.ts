import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';
import type { DirectorPlan } from '../store/types';

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
            description: "List of voxels making up the hidden structure. Around 10-30 voxels."
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
            description: "A short, poetic, abstract prompt in Japanese describing the vibe of the structure. (e.g., '水面に浮かぶネオンの残骸')"
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

export const generateGeminiDirectorPlan = async (apiKey: string): Promise<DirectorPlan> => {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    You are an AI Architect. Your task is to design a small 3D voxel structure within a 5x5x5 grid (coordinates 0 to 4).
    The structure should represent a specific abstract concept, emotion, or "vibe".
    
    Guidelines:
    - Keep the block count reasonable (10 to 30 blocks).
    - Use colors and block types (standard, emissive, transparent) creatively to match the vibe.
    - The vibe_prompt MUST be in Japanese and sounds poetic or slightly cyber/abstract.
    - Important: Output strictly matching the requested JSON schema.
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.0-flash',
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
