"use client";

import { useEffect, useState } from "react";

type WritingSetup = {
  mood: string;
  speaker: string;
  setting: string;
  length: string;
};

export default function EditorPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const [setup, setSetup] = useState<WritingSetup>({
    mood: "",
    speaker: "",
    setting: "",
    length: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("writingSetup");

    if (saved) {
      setSetup(JSON.parse(saved));
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);

    const prompt = `
${setup.mood} 분위기,
${setup.speaker} 시점,
${setup.setting} 배경,
${setup.length} 분량으로

감성적인 첫 문장을 제안해주세요.
직접 창작할 수 있도록 여운을 남겨주세요.
`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();

      if (data.result) {
        setContent(data.result);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-6">
          writing room
        </p>

        <input
          type="text"
          placeholder="제목을 적어주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border-b border-white/10 pb-4 text-3xl font-light outline-none placeholder:text-white/30 mb-10"
        />

        <textarea
          placeholder="오늘은 어떤 문장을 쓰고 싶나요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[400px] bg-transparent border border-white/10 rounded-3xl p-6 outline-none resize-none placeholder:text-white/30 leading-relaxed"
        />

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">

          <p className="text-sm opacity-50">
            지금의 분위기: {setup.mood || "설정 없음"}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-3 rounded-full border border-white/10 hover:border-white/40 transition"
            >
              {loading ? "생성 중..." : "AI 도움 받기"}
            </button>

            <button className="px-6 py-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition duration-500">
              저장하기
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}