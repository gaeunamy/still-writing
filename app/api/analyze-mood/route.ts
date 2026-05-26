import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MOOD_COLORS: Record<string, string> = {
  고요한: "#a8c4e0",
  쓸쓸한: "#b0a8c8",
  몽환적인: "#c8a8d8",
  따뜻한: "#e0c8a0",
  기쁜: "#e0d8a0",
  우울한: "#909ab0",
  차분한: "#a0b8b0",
};

const MOOD_DEFINITIONS: Record<string, string> = {
  고요한: "잔잔하고 평온함",
  쓸쓸한: "외로움, 그리움",
  몽환적인: "신비롭고 몽상적, 꿈속 같음",
  따뜻한: "포근하고 온기가 느껴짐",
  기쁜: "밝고 행복함",
  우울한: "어둡고 침침함",
  차분한: "진정되고 안정적",
};

const VALID_MOODS = Object.keys(MOOD_COLORS);

async function analyzeMood(content: string, genre: string): Promise<{ mood: string; color: string }> {
  const genreContext = genre === "시" ? "시의" : genre === "소설" ? "소설의" : "일기의";
  
  const moodDefinitions = VALID_MOODS
    .map(mood => `- ${mood}: ${MOOD_DEFINITIONS[mood]}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `당신은 ${genreContext} 감정을 분석하는 전문가입니다.
사용자의 글을 읽고 가장 정확하게 표현하는 감정 태그 1개만 선택해주세요.

각 감정의 정의:
${moodDefinitions}

반드시 위 감정 중 1개만 선택하고, 선택한 감정 태그만 반환해주세요.
다른 설명이나 설명문은 절대 하지 마세요.`,
      },
      {
        role: "user",
        content: `다음 글을 분석하고 가장 정확한 감정 1개를 선택해주세요:\n\n"${content}"`,
      },
    ],
    max_tokens: 20,
    temperature: 0.5,
  });

  const analyzedMood = response.choices[0].message.content ?? "차분한";
  const cleanMood = analyzedMood.trim();
  
  const finalMood = VALID_MOODS.includes(cleanMood) ? cleanMood : "차분한";
  const color = MOOD_COLORS[finalMood];

  console.log(`📊 Mood analysis: "${cleanMood}" → "${finalMood}" (${color})`);

  return { mood: finalMood, color };
}

export async function POST(req: Request) {
  try {
    const { content, genre } = await req.json();

    if (!content) {
      return Response.json({ error: "content is required" }, { status: 400 });
    }

    const result = await analyzeMood(content, genre ?? "일기");
    return Response.json({ mood: result.mood, color: result.color });
  } catch (error) {
    console.error("Mood analysis error:", error);
    return Response.json({ error: "Mood analysis failed" }, { status: 500 });
  }
}