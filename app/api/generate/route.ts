import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 나중에 Claude로 교체할 때 이 함수만 바꾸면 됨
async function generateText(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `당신은 감성적인 글쓰기를 돕는 문장 조력자입니다.
사용자가 직접 창작할 수 있도록 첫 문장과 방향을 제안해주세요.
짧고 여운 있게, 직접 이어 쓸 수 있도록 마무리하세요.
절대 설명하거나 부연하지 마세요. 오직 문장만 써주세요.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 300,
    temperature: 0.9,
  });

  return response.choices[0].message.content ?? "";
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    const result = await generateText(prompt);
    return Response.json({ result });
  } catch (error) {
    console.error("AI generation error:", error);
    return Response.json({ error: "AI generation failed" }, { status: 500 });
  }
}