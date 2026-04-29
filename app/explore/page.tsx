"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const writings = [
  {
    emotion: "새벽",
    preview: "우리는 늘 가장 조용한 시간에 가장 큰 마음을 만난다.",
    fullText:
      "우리는 늘 가장 조용한 시간에 가장 큰 마음을 만난다. 아무도 없는 새벽의 공기 속에서, 오래 숨겨두었던 마음들이 조심스럽게 모습을 드러낸다.",
  },
  {
    emotion: "여름",
    preview: "그해 여름은 끝났는데, 아직도 네가 덥다.",
    fullText:
      "그해 여름은 끝났는데, 아직도 네가 덥다. 지나간 계절은 사라졌지만, 어떤 사람은 오래도록 체온처럼 남아 있다.",
  },
  {
    emotion: "후회",
    preview: "하지 못한 말들은 오래 살아남는다.",
    fullText:
      "하지 못한 말들은 오래 살아남는다. 시간이 지나도 사라지지 않고, 가장 조용한 순간마다 다시 마음을 두드린다.",
  },
  {
    emotion: "미련",
    preview: "끝났다는 말보다 더 오래 남는 건 침묵이었다.",
    fullText:
      "끝났다는 말보다 더 오래 남는 건 침묵이었다. 아무 말도 하지 못했던 순간들이 오히려 더 깊은 흔적이 되었다.",
  },
  {
    emotion: "외로움",
    preview: "누군가를 기다리는 일은 종종 나를 잃는 일이었다.",
    fullText:
      "누군가를 기다리는 일은 종종 나를 잃는 일이었다. 그 사람의 발소리를 상상하며, 나는 조금씩 나를 잊어갔다.",
  },
  {
    emotion: "사랑",
    preview: "좋아한다는 말보다 먼저 눈이 기억했다.",
    fullText:
      "좋아한다는 말보다 먼저 눈이 기억했다. 사람은 말보다 먼저 시선으로 마음을 들키는 법이었다.",
  },
];

export default function ExplorePage() {
  const [openedCard, setOpenedCard] = useState<number | null>(null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white px-6 py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-6">
          quiet explore
        </p>

        <h1 className="text-3xl md:text-5xl font-light leading-relaxed mb-14">
          조용히, 다른 사람의 문장을 만나요
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {writings.map((item, index) => (
            <div
              key={item.preview}
              onClick={() =>
                setOpenedCard(openedCard === index ? null : index)
              }
              className="rounded-3xl border border-white/10 p-8 cursor-pointer hover:border-white/30 hover:bg-white/[0.02] transition duration-500"
            >
              <p className="text-sm opacity-50 mb-4">
                #{item.emotion}
              </p>

              <p className="leading-relaxed text-lg font-light">
                {item.preview}
              </p>

              {openedCard === index && (
                <p className="mt-6 text-sm opacity-70 leading-relaxed">
                  {item.fullText}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}