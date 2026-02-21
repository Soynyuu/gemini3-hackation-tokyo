import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';

const evaluationSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        vibeScore: {
            type: Type.INTEGER,
            description: "A score from 0 to 100 based on how well the image matches the vibe prompt."
        },
        rationale: {
            type: Type.STRING,
            description: "A short, 1-2 sentence qualitative analysis in Japanese."
        }
    },
    required: ["vibeScore", "rationale"]
};

export const evaluateWithGemini = async (
    apiKey: string,
    base64Image: string,
    vibePrompt: string
): Promise<{ vibeScore: number; rationale: string }> => {
    const ai = new GoogleGenAI({ apiKey });

    // Clean the base64 string (remove data:image/png;base64, prefix)
    const base64Data = base64Image.split(',')[1] || base64Image;

    const prompt = `
    You are an AI Architect judging a human's attempt to build a 3D structure that matches a specific "vibe".
    The target vibe prompt was: "${vibePrompt}"

    Look at the provided image of their voxel structure.
    Evaluate how well the shape, color usage, and overall aesthetic map to the target vibe.
    Return a score (0-100) and a short feedback rationale in Japanese.
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: [
                { text: prompt },
                { inlineData: { data: base64Data, mimeType: "image/png" } }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: evaluationSchema,
                temperature: 0.2, // low temp for more consistent grading
            }
        });

        if (!response.text) {
            throw new Error("No response from Gemini Vision");
        }

        const result = JSON.parse(response.text);
        return {
            vibeScore: result.vibeScore,
            rationale: result.rationale
        };
    } catch (error) {
        console.error("Gemini Judge Error:", error);
        // Fallback if API fails to prevent hard crashing the reveal screen
        return {
            vibeScore: 50,
            rationale: "AI審査官への接続に失敗しました。構造的特徴に基づく仮スコアを適用しています。"
        };
    }
};
