"use client";

import { useRouter } from "next/navigation";

const genres = [
  {
    title: "시",
    sub: "짧지만 오래 남는 것",
    desc: "흩어진 감정을 한 줄로 모아요",
    icon: "✦",
  },
  {
    title: "소설",
    sub: "한 사람의 세계를 만드는 것",
    desc: "장면과 인물로 밤을 채워요",
    icon: "◈",
  },
  {
    title: "일기",
    sub: "오늘을 놓치지 않는 것",
    desc: "지금 이 순간을 기록해요",
    icon: "◇",
  },
];

export default function StartPage() {
  const router = useRouter();

  const handleSelect = (genre: string) => {
    localStorage.setItem("selectedGenre", genre);
    router.push("/setup");
  };

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: "linear-gradient(180deg, #03010a 0%, #080318 55%, #100828 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Crimson+Pro:wght@200;300&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cardGlow {
          0%,100% { box-shadow: 0 0 0px transparent; }
          50%      { box-shadow: 0 0 20px rgba(180,140,255,0.08); }
        }
        .fade-up { animation: fadeUp 0.8s ease-out both; }
        .genre-card {
          position: relative;
          padding: 32px 28px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          background: rgba(255,255,255,0.02);
          cursor: pointer;
          transition: all 0.5s ease;
          text-align: left;
        }
        .genre-card:hover {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
          transform: translateY(-4px);
          animation: cardGlow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="w-full max-w-4xl">
        <p
          className="fade-up text-center"
          style={{
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "11px", letterSpacing: "0.42em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", marginBottom: "28px",
            animationDelay: "0.1s",
          }}
        >
          still — writing
        </p>

        <h1
          className="fade-up text-center"
          style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
            fontSize: "clamp(26px, 4vw, 48px)", lineHeight: 1.35,
            color: "rgba(255,255,255,0.88)", letterSpacing: "0.01em",
            marginBottom: "48px", animationDelay: "0.2s",
          }}
        >
          오늘은 어떤 글을 쓸까요
        </h1>

        <div
          className="fade-up"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            animationDelay: "0.4s",
          }}
        >
          {genres.map((g) => (
            <button
              key={g.title}
              className="genre-card"
              onClick={() => handleSelect(g.title)}
            >
              <p style={{
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "22px", color: "rgba(255,255,255,0.25)",
                marginBottom: "14px",
              }}>
                {g.icon}
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
                fontSize: "24px", color: "rgba(255,255,255,0.88)",
                marginBottom: "8px", letterSpacing: "0.02em",
              }}>
                {g.title}
              </h2>
              <p style={{
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "12px", color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.06em", lineHeight: 1.6,
                marginBottom: "6px",
              }}>
                {g.sub}
              </p>
              <p style={{
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "12px", color: "rgba(255,255,255,0.22)",
                letterSpacing: "0.04em", lineHeight: 1.6,
              }}>
                {g.desc}
              </p>
            </button>
          ))}
        </div>

        <div
          className="fade-up text-center"
          style={{ marginTop: "36px", animationDelay: "0.6s" }}
        >
          <button
            onClick={() => router.push("/city")}
            style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "12px", letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.22)", background: "none",
              border: "none", cursor: "pointer", transition: "color 0.3s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}
          >
            ← 도시로 돌아가기
          </button>
        </div>
      </div>
    </main>
  );
}