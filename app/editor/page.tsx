"use client";

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">

        <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-6">
          writing room
        </p>

        <input
          type="text"
          placeholder="제목을 적어주세요"
          className="w-full bg-transparent border-b border-white/10 pb-4 text-3xl font-light outline-none placeholder:text-white/30 mb-10"
        />

        <textarea
          placeholder="오늘은 어떤 문장을 쓰고 싶나요"
          className="w-full min-h-[400px] bg-transparent border border-white/10 rounded-3xl p-6 outline-none resize-none placeholder:text-white/30 leading-relaxed"
        />

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">

          <p className="text-sm opacity-50">
            지금의 감정: 고요한 새벽
          </p>

          <div className="flex gap-3">
            <button className="px-6 py-3 rounded-full border border-white/10 hover:border-white/40 transition">
              AI 도움 받기
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