"use client";

const genres = [
  {
    title: "시",
    description: "짧지만 오래 남는 것",
  },
  {
    title: "소설",
    description: "한 사람의 세계를 만드는 것",
  },
  {
    title: "일기",
    description: "오늘을 놓치지 않는 것",
  },
];

export default function StartPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-5xl mx-auto text-center">

        <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-6">
          begin writing
        </p>

        <h1 className="text-3xl md:text-5xl font-light leading-relaxed mb-14">
          어떤 글을 쓰고 싶나요
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {genres.map((genre) => (
            <button
              key={genre.title}
              className="rounded-3xl border border-white/10 p-8 text-left hover:border-white/30 hover:bg-white/[0.02] transition duration-500"
            >
              <h2 className="text-2xl font-light mb-4">
                {genre.title}
              </h2>

              <p className="opacity-60 leading-relaxed">
                {genre.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}