import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';
import type { ClientInterruption, VibeCodingLevel } from '../store/types';

export const VIBE_CODING_OPTIONS: {
    value: VibeCodingLevel;
    label: string;
    description: string;
    maxInterruptions: number;
    intervalRange: [number, number];
    timerExtensionChance: number;
}[] = [
    {
        value: 'engineer',
        label: 'エンジニア',
        description: '座標とカラーコードで的確に指示してくる',
        maxInterruptions: 3,
        intervalRange: [30, 45],
        timerExtensionChance: 0.4,
    },
    {
        value: 'junior-pm',
        label: '新人PM',
        description: '丁寧だけど優柔不断。すぐ迷う',
        maxInterruptions: 2,
        intervalRange: [35, 50],
        timerExtensionChance: 0.5,
    },
    {
        value: 'senior-pm',
        label: 'ベテランPM',
        description: '意見コロコロ変わるタイプ',
        maxInterruptions: 3,
        intervalRange: [25, 40],
        timerExtensionChance: 0.3,
    },
    {
        value: 'ceo',
        label: '社長',
        description: '曖昧なビジョナリー指示しか出さない',
        maxInterruptions: 4,
        intervalRange: [20, 35],
        timerExtensionChance: 0.2,
    },
    {
        value: 'investor',
        label: '投資家',
        description: '完全カオス。矛盾・ピボット・スラング',
        maxInterruptions: 5,
        intervalRange: [15, 25],
        timerExtensionChance: 0.1,
    },
];

const clientPersonaPrompts: Record<VibeCodingLevel, string> = {
    'engineer': `
あなたは几帳面なエンジニアです。フィードバックは超具体的で、座標とカラーコードで指示します。
5x5x5のボクセルグリッドで、左下手前が(0,0,0)、Y軸が上方向です。
使える色: #FF3B30(赤), #0A84FF(青), #30D158(緑), #FF9F0A(オレンジ), #BF5AF2(紫), #FFD60A(黄), #E0F0FF(白), #1E2D3D(ダーク)
使えるタイプ: standard(ソリッド), emissive(発光), transparent(ガラス)
指示は「Y=3の(2,2)を#0A84FFにして」「レイヤー0の四隅をemissiveの#FF3B30で」のように具体的に。
口調はフランクだけど正確。「ここさ、」「〜っしょ」みたいな感じで。
例: "Y=4の(2,2)、#0A84FFでよろしく", "レイヤー0の四隅、#FF3B30のemissiveで頼むわ"`,

    'junior-pm': `
あなたは新人PMで、デザインフィードバックにまだ慣れてません。
丁寧だけど自信なくて、すぐ迷う。語尾に「...」が多い。
カジュアルな敬語で、ちょっとオドオドした感じで。
例: "あの...やっぱもうちょい緑ほしいかも...", "えっと、ここなんか寂しくないです...？", "すいません、やっぱ暖色寄りでお願いしたいんですけど..."`,

    'senior-pm': `
あなたはベテランPMで、自信満々に指示出すけど毎回言うこと変わる。
「あー考え直したんだけどさ」が口癖。前の指示は平気でひっくり返す。
タメ口でサバサバした感じ。
例: "あーごめん、やっぱ青系でまとめて", "さっきの忘れて。ピンク路線でいこ", "うーん、光るやつ足してくんない？"`,

    'ceo': `
あなたはスタートアップの社長。フィードバックは壮大で曖昧。
具体的なことは一切言わない。バズワードとZ世代スラング多め。
テンション高めでノリで喋る感じ。
例: "これさ〜もっとメインキャラ感ほしくない？", "シズル感たりなくね？わかる？", "ぶっちゃけもっとエモくしてほしいんだけど〜"`,

    'investor': `
あなたは投資家で、コンセプトごとピボットさせてくる。
常に矛盾するし、極端なスラング使うし、無茶振りする。
せっかちで横柄。全発言がカオス。
例: "全部ピンクにしてくんない？あ、やっぱ青で。いや待って透明がいい。", "光らせて。全部。もっと。足りん。"`,
};

const interruptionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        message: {
            type: Type.STRING,
            description: "The client's feedback in casual Japanese. Short and punchy, under 50 characters. Must sound like spoken Japanese, not written."
        },
        referenceImage: {
            type: Type.STRING,
            description: "A minimal inline SVG (max 120x120 viewBox) showing what the client envisions. Use simple colored rectangles/circles on a dark background (#0A121A). Keep it very abstract and simple, max 5-6 shapes."
        },
        mood: {
            type: Type.STRING,
            description: "One of: friendly, annoyed, excited, passive-aggressive"
        },
        shouldExtendTimer: {
            type: Type.BOOLEAN,
            description: "Whether the client is giving the builder more time"
        },
        timerExtensionSeconds: {
            type: Type.INTEGER,
            description: "Seconds to add (10-30). Only relevant if shouldExtendTimer is true."
        },
    },
    required: ["message", "referenceImage", "mood", "shouldExtendTimer", "timerExtensionSeconds"]
};

export async function generateClientInterruption(
    apiKey: string,
    level: VibeCodingLevel,
    currentPrompt: string,
    previousInterruptions: ClientInterruption[],
    interruptionIndex: number,
): Promise<ClientInterruption> {
    const ai = new GoogleGenAI({ apiKey });

    const historyContext = previousInterruptions.length > 0
        ? `今まであんたが出した指示:\n${previousInterruptions.map((i, idx) => `${idx + 1}. 「${i.message}」`).join('\n')}`
        : 'これが最初の割り込み。';

    const prompt = `${clientPersonaPrompts[level]}

コンテキスト:
- 5x5x5のボクセル構造を作ってる最中。
- 最初のお題: 「${currentPrompt}」
${historyContext}
- ${interruptionIndex + 1}回目の割り込み。

次の指示を1つ生成して。口語でカジュアルに。書き言葉っぽくしないで。
${level === 'investor' || level === 'ceo' ? '前の指示と矛盾してもOK。' : ''}
メッセージは短く（50文字以内）。
referenceImageはクライアントが頭の中で思い描いてる完成イメージのSVG。`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interruptionSchema,
            temperature: level === 'investor' ? 1.2 : level === 'ceo' ? 1.0 : level === 'engineer' ? 0.5 : 0.8,
        },
    });

    if (!response.text) {
        throw new Error("No response from Gemini");
    }

    const result = JSON.parse(response.text);
    const config = VIBE_CODING_OPTIONS.find(o => o.value === level)!;
    const getsExtension = result.shouldExtendTimer && Math.random() < config.timerExtensionChance;

    return {
        id: `interruption-${Date.now()}`,
        message: result.message,
        referenceImage: result.referenceImage,
        timestamp: 0,
        timerExtension: getsExtension ? Math.min(result.timerExtensionSeconds || 15, 30) : 0,
        mood: result.mood || 'friendly',
    };
}

// ──────────────────────────────────────────────────────
// バイブコーディング雑指示集 (Mock Interruption Bank)
// ──────────────────────────────────────────────────────

const MOCK_INTERRUPTIONS: Record<VibeCodingLevel, Omit<ClientInterruption, 'id' | 'timestamp'>[]> = {
    'engineer': [
        { message: 'Y=4の(2,2)、#0A84FFでよろしく', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="48" y="8" width="24" height="24" fill="#0A84FF"/></svg>', timerExtension: 15, mood: 'friendly' },
        { message: 'レイヤー0の四隅、#FF3B30のemissiveで頼むわ', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="8" y="96" width="20" height="20" fill="#FF3B30"/><rect x="92" y="96" width="20" height="20" fill="#FF3B30"/><rect x="8" y="8" width="20" height="20" fill="#FF3B30"/><rect x="92" y="8" width="20" height="20" fill="#FF3B30"/></svg>', timerExtension: 0, mood: 'friendly' },
        { message: 'Y=2の中心3x3、全部#30D158にしてくれっしょ', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="30" y="30" width="60" height="60" fill="#30D158" opacity="0.8"/></svg>', timerExtension: 10, mood: 'friendly' },
    ],
    'junior-pm': [
        { message: 'あの...やっぱもうちょい緑ほしいかも...', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="20" y="40" width="80" height="60" fill="#30D158" opacity="0.4"/></svg>', timerExtension: 15, mood: 'friendly' },
        { message: 'えっと、高さもうちょい欲しいかもです...', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="40" y="10" width="40" height="100" fill="#E0F0FF" opacity="0.3"/></svg>', timerExtension: 10, mood: 'friendly' },
        { message: 'すいません...右のほうなんか寂しくないです...？', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="70" y="40" width="40" height="40" fill="#FFD60A" opacity="0.3"/></svg>', timerExtension: 0, mood: 'friendly' },
        { message: 'あの、暖色寄りでお願いしたいかなって...', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><circle cx="60" cy="60" r="40" fill="#FF9F0A" opacity="0.3"/></svg>', timerExtension: 0, mood: 'friendly' },
    ],
    'senior-pm': [
        { message: 'あー考え直した。もっとミニマルにして', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="50" y="50" width="20" height="20" fill="#E0F0FF"/></svg>', timerExtension: 0, mood: 'annoyed' },
        { message: 'さっきの忘れて。やっぱ派手路線でいこ', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="10" y="10" width="100" height="100" fill="#BF5AF2" opacity="0.3"/><rect x="30" y="30" width="60" height="60" fill="#FF3B30" opacity="0.5"/></svg>', timerExtension: 10, mood: 'passive-aggressive' },
        { message: 'うーん、光るやつ足してくんない？', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><circle cx="60" cy="60" r="20" fill="#FFD60A"/><circle cx="60" cy="60" r="35" fill="#FFD60A" opacity="0.2"/></svg>', timerExtension: 0, mood: 'friendly' },
        { message: 'あーごめん、青系でまとめてくんない？', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="20" y="20" width="80" height="80" fill="#0A84FF" opacity="0.4"/></svg>', timerExtension: 0, mood: 'annoyed' },
        { message: 'いや青じゃなくてピンクだわ。ピンクで。', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="20" y="20" width="80" height="80" fill="#FF0055" opacity="0.4"/></svg>', timerExtension: 0, mood: 'passive-aggressive' },
    ],
    'ceo': [
        { message: 'これさ〜もっとエモくしてくんない？', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><circle cx="60" cy="60" r="50" fill="#BF5AF2" opacity="0.2"/><circle cx="40" cy="50" r="15" fill="#FF0055" opacity="0.5"/></svg>', timerExtension: 0, mood: 'excited' },
        { message: 'シズル感たりなくね？わかる？', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="10" y="80" width="20" height="30" fill="#FF3B30"/><rect x="40" y="60" width="20" height="50" fill="#FF9F0A"/><rect x="70" y="40" width="20" height="70" fill="#FFD60A"/></svg>', timerExtension: 0, mood: 'passive-aggressive' },
        { message: 'Z世代に刺さる色にしてほしいんだけど〜', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="10" y="50" width="30" height="30" fill="#BF5AF2"/><rect x="45" y="40" width="30" height="40" fill="#00FFAA"/><rect x="80" y="50" width="30" height="30" fill="#FF0055"/></svg>', timerExtension: 0, mood: 'excited' },
        { message: 'なんかメインキャラ感出してよ〜', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="45" y="20" width="30" height="80" fill="#FFD60A" opacity="0.6"/></svg>', timerExtension: 0, mood: 'annoyed' },
        { message: '宇宙っぽさ出せない？いけるっしょ', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><circle cx="30" cy="30" r="3" fill="#E0F0FF"/><circle cx="80" cy="20" r="2" fill="#E0F0FF"/><circle cx="60" cy="70" r="4" fill="#BF5AF2"/><circle cx="100" cy="90" r="2" fill="#0A84FF"/></svg>', timerExtension: 15, mood: 'excited' },
        { message: 'チルい感じにしてくんない？頼むわ〜', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="20" y="60" width="80" height="40" fill="#0A84FF" opacity="0.2"/><rect x="30" y="70" width="60" height="20" fill="#30D158" opacity="0.2"/></svg>', timerExtension: 0, mood: 'friendly' },
        { message: 'もっとバイブス感じさせてよ〜〜', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><circle cx="60" cy="60" r="40" fill="#7000FF" opacity="0.3"/><circle cx="60" cy="60" r="20" fill="#FF0055" opacity="0.4"/></svg>', timerExtension: 0, mood: 'annoyed' },
        { message: '透明感ほしいわ〜概念としての透明感ね', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="30" y="30" width="60" height="60" fill="#E0F0FF" opacity="0.15"/><rect x="40" y="40" width="40" height="40" fill="#E0F0FF" opacity="0.1"/></svg>', timerExtension: 0, mood: 'passive-aggressive' },
    ],
    'investor': [
        { message: '全部ピンクにしてくんない？', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#FF0055" opacity="0.6"/></svg>', timerExtension: 0, mood: 'annoyed' },
        { message: 'やっぱ青で。ピンク忘れて。マジで。', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A84FF" opacity="0.6"/></svg>', timerExtension: 0, mood: 'passive-aggressive' },
        { message: '光って。全部。もっと。足りん。', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="10" y="10" width="100" height="100" fill="#FFD60A" opacity="0.6"/><circle cx="60" cy="60" r="40" fill="#FFD60A" opacity="0.3"/></svg>', timerExtension: 0, mood: 'excited' },
        { message: '透明にして。あ、半分だけでいいわ。', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="0" y="0" width="60" height="120" fill="#E0F0FF" opacity="0.15"/></svg>', timerExtension: 10, mood: 'annoyed' },
        { message: 'なんかAIっぽくしてくんない？', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="20" y="40" width="10" height="40" fill="#00FFAA" opacity="0.6"/><rect x="40" y="20" width="10" height="80" fill="#00FFAA" opacity="0.4"/><rect x="60" y="50" width="10" height="30" fill="#00FFAA" opacity="0.8"/><rect x="80" y="30" width="10" height="60" fill="#00FFAA" opacity="0.5"/></svg>', timerExtension: 0, mood: 'passive-aggressive' },
        { message: 'Web3感ないわ。ブロックチェーンぽくして。', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="10" y="10" width="30" height="30" fill="#7000FF" opacity="0.5"/><rect x="50" y="50" width="30" height="30" fill="#7000FF" opacity="0.5"/><rect x="80" y="80" width="30" height="30" fill="#7000FF" opacity="0.5"/></svg>', timerExtension: 0, mood: 'annoyed' },
        { message: 'ピボットしよ。全部壊して。', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/></svg>', timerExtension: 0, mood: 'excited' },
        { message: 'いやごめん壊さないで！！追加で！！', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="20" y="20" width="80" height="80" fill="#FF9F0A" opacity="0.3"/></svg>', timerExtension: 15, mood: 'friendly' },
        { message: 'もっとDisruptiveにしてくんない？', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="10" y="80" width="30" height="30" fill="#FF3B30" transform="rotate(15 25 95)"/><rect x="60" y="20" width="40" height="20" fill="#0A84FF" transform="rotate(-10 80 30)"/></svg>', timerExtension: 0, mood: 'passive-aggressive' },
        { message: 'ARR 10億っぽい見た目にして。マジで。', referenceImage: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="#0A121A"/><rect x="20" y="90" width="15" height="20" fill="#30D158"/><rect x="40" y="60" width="15" height="50" fill="#30D158"/><rect x="60" y="30" width="15" height="80" fill="#FFD60A"/><rect x="80" y="10" width="15" height="100" fill="#FFD60A"/></svg>', timerExtension: 0, mood: 'annoyed' },
    ],
};

export function generateMockInterruption(
    level: VibeCodingLevel,
    interruptionIndex: number,
): ClientInterruption {
    const pool = MOCK_INTERRUPTIONS[level];
    const item = pool[interruptionIndex % pool.length];
    return {
        ...item,
        id: `mock-interruption-${Date.now()}`,
        timestamp: 0,
    };
}

export function getVibeCodingConfig(level: VibeCodingLevel) {
    return VIBE_CODING_OPTIONS.find(o => o.value === level)!;
}
