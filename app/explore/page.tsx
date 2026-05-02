"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type PublicWriting = {
  id: string;
  title: string | null;
  content: string;
  genre: string | null;
  mood: string | null;
  emotion_color: string | null;
  created_at: string;
};

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  op: number;
};

// 창문 그리드 설정
const COLS = 14;
const ROWS = 6;
const TOTAL = COLS * ROWS;

export default function ExplorePage() {
  const router = useRouter();
  const [writings, setWritings] = useState<PublicWriting[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [selected, setSelected] = useState<PublicWriting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStars(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 70,
        size: Math.random() * 1.6 + 0.4,
        dur: 3 + Math.random() * 5,
        delay: Math.random() * 6,
        op: 0.2 + Math.random() * 0.5,
      }))
    );
    fetchPublicWritings();
  }, []);

  async function fetchPublicWritings() {
    setLoading(true);
    const { data } = await supabase
      .from("writings")
      .select("id, title, content, genre, mood, emotion_color, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    setWritings(data ?? []);
    setLoading(false);
  }

  // 창문 배열 만들기 — 글 있는 자리는 켜짐, 나머지는 꺼짐
  const windows = Array.from({ length: TOTAL }, (_, i) => {
    const writing = writings[i] ?? null;
    return { index: i, writing };
  });

  return (
    <main
      className="relative min-h-screen"
      style={{
        background: "linear-gradient(180deg, #03010a 0%, #080318 50%, #100828 100%)",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Crimson+Pro:wght@200;300&display=swap');

        @keyframes twinkle {
          0%,100% { opacity:var(--op); }
          50% { opacity:calc(var(--op)*0.15); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes winBlink {
          0%,88%,100% { opacity:0.82; }
          93% { opacity:0.15; }
        }
        @keyframes winGlow {
          0%,100% { box-shadow: 0 0 4px 1px var(--wc); }
          50%      { box-shadow: 0 0 12px 3px var(--wc); }
        }
        @keyframes modalIn {
          from { opacity:0; transform:translateY(20px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes emptyPulse {
          0%,100% { opacity:0.04; }
          50%      { opacity:0.08; }
        }

        .star     { animation: twinkle var(--dur) var(--dly) ease-in-out infinite; }
        .fade-up  { animation: fadeUp 0.8s ease-out both; }
        .win-lit  {
          animation:
            winBlink var(--bd) var(--bly) ease-in-out infinite,
            winGlow  var(--bd) var(--bly) ease-in-out infinite;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .win-lit:hover { transform: scale(1.3); }
        .win-empty { animation: emptyPulse 4s ease-in-out infinite; }
        .modal-in { animation: modalIn 0.45s ease-out both; }
      `}</style>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white star"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.size, height: s.size,
              "--op": s.op,
              "--dur": `${s.dur}s`,
              "--dly": `${s.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Nebula */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 35% at 25% 18%, rgba(80,40,160,0.1) 0%, transparent 70%)",
      }} />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 pt-7 pb-4">
        <button
          onClick={() => router.push("/")}
          style={{
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "11px", letterSpacing: "0.42em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", background: "none", border: "none",
            cursor: "pointer", transition: "color 0.3s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >
          ← 돌아가기
        </button>
        <button
          onClick={() => router.push("/city")}
          style={{
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "13px", letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.45)",
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "100px", padding: "7px 20px", cursor: "pointer",
            transition: "all 0.4s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "rgba(255,255,255,0.85)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "rgba(255,255,255,0.45)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          내 도시로
        </button>
      </nav>

      {/* Header */}
      <div className="relative z-10 text-center px-6 pt-8 pb-12 fade-up" style={{ animationDelay: "0.2s" }}>
        <p style={{
          fontFamily: "'Crimson Pro', serif", fontWeight: 200,
          fontSize: "11px", letterSpacing: "0.42em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)", marginBottom: "14px",
        }}>
          city of lights
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
          fontSize: "clamp(22px, 3.5vw, 40px)", lineHeight: 1.35,
          color: "rgba(255,255,255,0.85)",
        }}>
          오늘 밤, 불 켜진 창문들
        </h1>
        {!loading && (
          <p style={{
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "13px", color: "rgba(255,255,255,0.28)",
            letterSpacing: "0.06em", marginTop: "10px",
          }}>
            {writings.length}개의 불빛이 켜져 있습니다
          </p>
        )}
      </div>

      {/* Window grid */}
      <div
        className="relative z-10 fade-up"
        style={{
          animationDelay: "0.4s",
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: "10px",
          maxWidth: "760px",
          margin: "0 auto",
          padding: "0 24px 60px",
        }}
      >
        {windows.map(({ index, writing }) => {
          if (writing) {
            const wc = writing.emotion_color ?? "#ffd97d";
            const bd = `${8 + (index % 9)}s`;
            const bly = `${index % 7}s`;
            return (
              <div
                key={writing.id}
                className="win-lit"
                onClick={() => setSelected(writing)}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1.3",
                  borderRadius: "2px",
                  background: wc,
                  "--wc": wc + "66",
                  "--bd": bd,
                  "--bly": bly,
                } as React.CSSProperties}
                title={writing.title ?? "제목 없음"}
              />
            );
          } else {
            return (
              <div
                key={`empty-${index}`}
                className="win-empty"
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1.3",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              />
            );
          }
        })}
      </div>

      {/* 꺼진 창문 안내 */}
      <div className="relative z-10 text-center pb-16 fade-up" style={{ animationDelay: "0.6s" }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontWeight: 300, fontSize: "14px",
          color: "rgba(255,255,255,0.18)", letterSpacing: "0.04em",
        }}>
          꺼진 창문은 당신의 불빛을 기다리고 있습니다
        </p>
        <button
          onClick={() => router.push("/start")}
          style={{
            marginTop: "14px",
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "13px", letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.35)",
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "100px", padding: "9px 24px", cursor: "pointer",
            transition: "all 0.4s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "rgba(255,255,255,0.75)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "rgba(255,255,255,0.35)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          글 쓰러 가기
        </button>
      </div>

      {/* Writing modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(3,1,10,0.88)", backdropFilter: "blur(14px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="modal-in"
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(15,8,30,0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px", padding: "40px 44px",
              maxWidth: "580px", width: "100%", maxHeight: "80vh", overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                {selected.genre && (
                  <p style={{
                    fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                    fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.25)", marginBottom: "8px",
                  }}>
                    {selected.genre}
                  </p>
                )}
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
                  fontSize: "22px", color: "rgba(255,255,255,0.88)",
                }}>
                  {selected.title || "제목 없음"}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.3)", fontSize: "20px",
                  lineHeight: 1, padding: "4px", transition: "color 0.3s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
              >
                ×
              </button>
            </div>

            <div style={{
              height: "1px",
              background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)",
              marginBottom: "28px",
            }} />

            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "17px", lineHeight: 1.95,
              color: "rgba(255,255,255,0.75)", whiteSpace: "pre-wrap",
            }}>
              {selected.content}
            </p>

            <div style={{
              marginTop: "32px", paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {selected.emotion_color && (
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: selected.emotion_color,
                    boxShadow: `0 0 8px ${selected.emotion_color}`,
                  }} />
                )}
                {selected.mood && (
                  <p style={{
                    fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                    fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em",
                  }}>
                    #{selected.mood}
                  </p>
                )}
              </div>
              <p style={{
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "11px", color: "rgba(255,255,255,0.2)",
              }}>
                {new Date(selected.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}