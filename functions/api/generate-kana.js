// This serverless function runs on Cloudflare.
// It securely calls the Gemini API to generate kana readings for song titles and artist names.
import { GoogleGenAI, Type } from '@google/genai';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
});

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
    }

    // FIX: Updated to use env.API_KEY as per the coding guidelines for consistency.
    if (!env.API_KEY) {
        return jsonResponse({ error: 'API_KEY is not configured on the server.' }, 500);
    }
    
    try {
        const { songs } = await request.json();

        if (!Array.isArray(songs) || songs.length === 0) {
            return jsonResponse({ error: 'Invalid input: songs array is required.' }, 400);
        }
        
        // FIX: Updated to use env.API_KEY as per the coding guidelines.
        const ai = new GoogleGenAI({ apiKey: env.API_KEY });

        const prompt = `以下の日本の曲名とアーティスト名のJSONリストについて、一般的なカタカナの読み仮名を括弧付きで追記した結果を返してください。
- 英語名、数字、記号のみ、または既にカタカナ/ひらがなの場合は、読み仮名は不要です。その場合は元の文字列をそのまま updatedTitle/updatedArtist に入れてください。
- 読み仮名が必要な漢字や英語表記の場合のみ「元の名前(カタカナ)」の形式にしてください。

リスト:
${JSON.stringify(songs)}
`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            originalTitle: {
                                type: Type.STRING,
                                description: "元の曲名",
                            },
                            updatedTitle: {
                                type: Type.STRING,
                                description: "ふりがなを追記した曲名",
                            },
                            originalArtist: {
                                type: Type.STRING,
                                description: "元のアーティスト名",
                            },
                            updatedArtist: {
                                type: Type.STRING,
                                description: "ふりがなを追記したアーティスト名",
                            },
                        },
                        required: ["originalTitle", "updatedTitle", "originalArtist", "updatedArtist"],
                    },
                },
            },
        });
        
        // With responseSchema, the response.text is guaranteed to be a valid JSON string
        // matching the schema.
        const kanaResults = JSON.parse(response.text);
        
        return jsonResponse(kanaResults);

    } catch (error) {
        console.error('Kana generation failed:', error);
        return jsonResponse({ error: 'Failed to generate kana from AI model.' }, 500);
    }
}