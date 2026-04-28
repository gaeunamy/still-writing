"use client";

import { useState } from "react";
import Link from "next/link";

const modeTexts: Record<number, string> = {
  0: "오롯이 나만의 문장으로",
  25: "아주 조금, 시작만 함께",
  50: "함께 써 내려가기",
  75: "조금 더 기대어 보기",
  100: "누군가 나를 대신해줄 수 있다면",
};

export default function ModePage() {
  const [value, setValue] = useState(50);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-3xl mx-auto text-center">

        <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-6">
          creation mode
        </p>

        <h1 className="text-3xl md:text-5xl font-light leading-relaxed mb-6">
          얼마나 함께 쓸까요
        </h1>

        <p className="opacity-60 mb-14 leading-relaxed">
          당신이 더 많이 쓸 수도,
          <br />
          AI에게 조금 더 맡길 수도 있습니다.
        </p>

        <div className="space-y-8">
          <div className="flex justify-between text-sm opacity-70">
            <span>나</span>
            <span>AI</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="25"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full"
          />

          <p className="text-xl font-light">
            {modeTexts[value]}
          </p>

          <p className="text-sm opacity-50">
            AI 도움 정도: {value}%
          </p>
        </div>

        <div className="mt-14">
          <Link
            href="/setup"
            className="px-8 py-4 rounded-full border border-white/20 hover:bg-white hover:text-black transition duration-500"
          >
            다음으로
          </Link>
        </div>
      </div>
    </main>
  );
}