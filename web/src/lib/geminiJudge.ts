import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';
import type { ClientInterruption } from '../store/types';

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
    vibePrompt: string,
    interruptionHistory?: ClientInterruption[],
): Promise<{ vibeScore: number; rationale: string }> => {
    const ai = new GoogleGenAI({ apiKey });

    const base64Data = base64Image.split(',')[1] || base64Image;

    const hasInterruptions = interruptionHistory && interruptionHistory.length > 0;

    const interruptionContext = hasInterruptions
        ? `\n\n重要: ビルド中にクライアントが何度も仕様を変更しました。
指示の変遷（最新が最も重要）:
初期指示: 「${vibePrompt}」
${interruptionHistory.map((i, idx) => `${idx + 1}. 「${i.message}」`).join('\n')}

最新の指示を最重視しつつ、途中の変更に対応できていればボーナス評価してください。
仕様変更が多い中での制作は困難なので、やや寛容に評価してください。`
        : '';

    const prompt = hasInterruptions
        ? `あなたはAIアーキテクトとして、人間が作った3Dボクセル構造を評価します。
これは「バイブコーディング」セッションで、気まぐれなクライアントが途中で仕様を変えまくりました。
${interruptionContext}

画像に写っているボクセル構造を見て、最終的な指示にどれだけ応えられたか評価してください。
スコア (0-100) と短いフィードバック（日本語で1-2文）を返してください。`
        : `あなたはAIアーキテクトとして、人間が作った3Dボクセル構造を評価します。
目標のバイブ指示: 「${vibePrompt}」

画像に写っているボクセル構造を見て、形・色使い・全体の雰囲気がお題にどれだけ合っているか評価してください。
スコア (0-100) と短いフィードバック（日本語で1-2文）を返してください。`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { text: prompt },
                { inlineData: { data: base64Data, mimeType: "image/png" } }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: evaluationSchema,
                temperature: 0.2,
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
        return {
            vibeScore: 50,
            rationale: "AI審査官への接続に失敗しました。構造的特徴に基づく仮スコアを適用しています。"
        };
    }
};
