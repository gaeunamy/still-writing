"use client";

const emotions = [
  "고요",
  "그리움",
  "불안",
  "새벽",
  "후회",
  "사랑",
  "상실",
  "시작",
];

const writings = [
  "아직도 그 여름은 발끝에 남아 있다",
  "나는 끝내 그 말을 하지 못했다",
  "새벽은 늘 가장 조용한 변명이었다",
  "당신은 떠났고 계절만 남았다",
  "모든 시작은 조금씩 늦게 온다",
];

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto">

        <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-6">
          emotion galaxy
        </p>

        <h1 className="text-3xl md:text-5xl font-light leading-relaxed mb-10">
          오늘은 어떤 감정의 밤인가요
        </h1>

        <div className="flex flex-wrap gap-3 mb-16">
          {emotions.map((emotion) => (
            <button
              key={emotion}
              className="px-5 py-2 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition"
            >
              {emotion}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {writings.map((writing, index) => (
            <div
              key={index}
              className="rounded-3xl border border-white/10 p-6 hover:border-white/30 hover:bg-white/[0.02] transition duration-500"
            >
              <p className="text-lg leading-relaxed font-light">
                {writing}
              </p>
            </div>
          ))}

          <div className="rounded-3xl border border-dashed border-white/20 p-6 flex items-center justify-center hover:border-white/40 transition">
            <p className="opacity-70">
              아직 이름 없는 별
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}