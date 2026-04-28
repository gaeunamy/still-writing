"use client";

import Link from "next/link";

const moods = ["고요한", "쓸쓸한", "따뜻한", "불안한", "몽환적인"];
const speakers = ["나", "익명의 화자", "주인공", "과거의 나"];
const settings = ["새벽", "여름", "바다", "도시", "기억 속 장소"];
const lengths = ["짧게", "적당히", "길게"];

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-5xl mx-auto">

        <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-6">
          writing setup
        </p>

        <h1 className="text-3xl md:text-5xl font-light leading-relaxed mb-14">
          어떤 문장을 만나고 싶나요
        </h1>

        <div className="space-y-12">

          <Section title="분위기" items={moods} />
          <Section title="화자" items={speakers} />
          <Section title="배경" items={settings} />
          <Section title="길이" items={lengths} />

        </div>

        <div className="mt-16 text-center">
          <Link
            href="/editor"
            className="px-8 py-4 rounded-full border border-white/20 hover:bg-white hover:text-black transition duration-500"
          >
            문장 쓰러 가기
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h2 className="text-lg mb-4 opacity-80">
        {title}
      </h2>

      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <button
            key={item}
            className="px-5 py-2 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}