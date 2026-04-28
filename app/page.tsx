"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center px-6">

      {/* background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_40%)]" />

      {/* floating light */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4 }}
        className="relative z-10 text-center max-w-3xl"
      >
        <p className="text-xs tracking-[0.4em] uppercase opacity-60 mb-6">
          still-writing
        </p>

        <h1 className="text-4xl md:text-7xl font-light leading-[1.4] tracking-tight">
          오늘은 어떤 문장이
          <br />
          당신을 기다리고 있나요
        </h1>

        <p className="mt-8 text-sm md:text-base opacity-60 leading-relaxed">
          우리는 글을 써주지 않습니다.
          <br />
          쓰고 싶어지게 만듭니다.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 rounded-full border border-white/20 hover:bg-white hover:text-black transition duration-500">
            시작하기
          </button>

          <button className="px-8 py-4 rounded-full border border-white/10 hover:border-white/40 transition duration-500">
            조용히 둘러보기
          </button>
        </div>
      </motion.div>
    </main>
  );
}