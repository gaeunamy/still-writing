import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "당신은 감성적인 글쓰기를 돕는 문장 조력자입니다. 사용자가 직접 창작할 수 있도록 첫 문장과 방향을 제안해주세요.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return Response.json({
      result: response.choices[0].message.content,
    });
  } catch (error) {
    return Response.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}