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

const VALID_MOODS = Object.keys(MOOD_COLORS);

async function analyzeMood(content: string, genre: string): Promise<{ mood: string; color: string }> {
  const moodList = VALID_MOODS.join(", ");
  const genreContext = genre === "시" ? "시의" : genre === "소설" ? "소설의" : "일기의";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `당신은 ${genreContext} 감정을 분석하는 전문가입니다.
글의 내용을 읽고 가장 어울리는 감정 태그 1개를 다음 목록에서 선택해주세요:
${moodList}

반드시 위 목록 중 하나만 선택하고, 선택한 감정 태그만 반환해주세요.
다른 설명은 절대 하지 마세요.`,
      },
      {
        role: "user",
        content: `다음 글을 읽고 가장 어울리는 감정을 선택해주세요:\n\n"${content}"`,
      },
    ],
    max_tokens: 50,
    temperature: 0.7,
  });

  const analyzedMood = response.choices[0].message.content ?? "차분한";
  const cleanMood = analyzedMood.trim();
  
  // 유효한 mood인지 확인, 아니면 기본값
  const finalMood = VALID_MOODS.includes(cleanMood) ? cleanMood : "차분한";
  const color = MOOD_COLORS[finalMood];

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