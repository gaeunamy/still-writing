const writings = [
  {
    emotion: "새벽",
    preview: "우리는 늘 가장 조용한 시간에 가장 큰 마음을 만난다.",
  },
  {
    emotion: "여름",
    preview: "그해 여름은 끝났는데, 아직도 네가 덥다.",
  },
  {
    emotion: "후회",
    preview: "하지 못한 말들은 오래 살아남는다.",
  },
  {
    emotion: "미련",
    preview: "끝났다는 말보다 더 오래 남는 건 침묵이었다.",
  },
  {
    emotion: "외로움",
    preview: "누군가를 기다리는 일은 종종 나를 잃는 일이었다.",
  },
  {
    emotion: "사랑",
    preview: "좋아한다는 말보다 먼저 눈이 기억했다.",
  },
];

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-6xl mx-auto">

        <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-6">
          quiet explore
        </p>

        <h1 className="text-3xl md:text-5xl font-light leading-relaxed mb-14">
          조용히, 다른 사람의 문장을 만나요
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {writings.map((item) => (
            <div
              key={item.preview}
              className="rounded-3xl border border-white/10 p-8 hover:border-white/30 hover:bg-white/[0.02] transition duration-500"
            >
              <p className="text-sm opacity-50 mb-4">
                #{item.emotion}
              </p>

              <p className="leading-relaxed text-lg font-light">
                {item.preview}
              </p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}