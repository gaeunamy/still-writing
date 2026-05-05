import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_TOKENS: Record<string, number> = {
  짧게: 150,
  적당히: 300,
  길게: 600,
};

async function generateText(prompt: string, length: string, mode: string): Promise<string> {
  const maxTokens = mode === "first" ? 80 : mode === "full" ? 800 : MAX_TOKENS[length] ?? 300;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `당신은 감성적인 글쓰기를 돕는 문장 조력자입니다.
사용자가 직접 창작할 수 있도록 첫 문장과 방향을 제안해주세요.
여운 있게, 직접 이어 쓸 수 있도록 마무리하세요.
절대 설명하거나 부연하지 마세요. 오직 문장만 써주세요.
절대 따옴표로 감싸지 마세요.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: maxTokens,
    temperature: 0.9,
  });

  const raw = response.choices[0].message.content ?? "";
  return raw.replace(/^["'"']+|["'"']+$/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const { prompt, length, mode } = await req.json();

    if (!prompt) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    const result = await generateText(prompt, length ?? "적당히", mode ?? "next");
    return Response.json({ result });
  } catch (error) {
    console.error("AI generation error:", error);
    return Response.json({ error: "AI generation failed" }, { status: 500 });
  }
}