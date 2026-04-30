"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Building = {
  id: string;
  genre: string;
  name: string | null;
  floor_count: number;
  unit_per_floor: number;
  created_at: string;
  writings: Writing[];
};

type Writing = {
  id: string;
  title: string | null;
  floor: number | null;
  unit: number | null;
  emotion_color: string | null;
  building_id: string;
};

const GENRE_COLOR: Record<string, string> = {
  시: "#c8a8d8",
  소설: "#a8c4e0",
  일기: "#e0d0a8",
};

const GENRE_WIDTH: Record<string, number> = {
  시: 44,
  소설: 58,
  일기: 50,
};

const GENRE_LABEL: Record<string, string> = {
  시: "시집",
  소설: "소설관",
  일기: "일기탑",
};

export default function CityPage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [risingId, setRisingId] = useState<string | null>(null);
  const [stars] = useState(() =>
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 75,
      size: Math.random() * 1.8 + 0.4,
      dur: 3 + Math.random() * 5,
      delay: Math.random() * 6,
    }))
  );

  useEffect(() => {
    fetchCity();
  }, []);

  async function fetchCity() {
    setLoading(true);
    const { data: bData } = await supabase
      .from("buildings")
      .select("*")
      .order("created_at", { ascending: true });

    if (!bData || bData.length === 0) {
      setBuildings([]);
      setLoading(false);
      return;
    }

    const { data: wData } = await supabase
      .from("writings")
      .select("id, title, floor, unit, emotion_color, building_id")
      .in("building_id", bData.map((b) => b.id));

    setBuildings(
      bData.map((b) => ({
        ...b,
        writings: (wData ?? []).filter((w) => w.building_id === b.id),
      }))
    );
    setLoading(false);
  }

  const isEmpty = !loading && buildings.length === 0;

  // 건물 SVG 높이 계산 (층수 기반)
  function getBuildingHeight(b: Building) {
    const base = 60;
    const perFloor = 18;
    return base + b.floor_count * perFloor;
  }

  // 창문이 켜져 있는지 (글이 해당 위치에 있는지)
  function isWindowLit(b: Building, floor: number, unit: number) {
    return b.writings.some((w) => w.floor === floor && w.unit === unit);
  }

  function getWindowColor(b: Building, floor: number, unit: number) {
    const w = b.writings.find((wr) => wr.floor === floor && wr.unit === unit);
    return w?.emotion_color ?? GENRE_COLOR[b.genre] ?? "#e0d0b0";
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #03010a 0%, #080318 45%, #100828 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Crimson+Pro:wght@200;300&display=swap');

        @keyframes twinkle {
          0%,100% { opacity:var(--op); }
          50% { opacity:calc(var(--op)*0.15); }
        }
        @keyframes lampPulse {
          0%,100% { filter: drop-shadow(0 0 5px rgba(255,210,100,0.55)); }
          50%      { filter: drop-shadow(0 0 14px rgba(255,210,100,0.85)); }
        }
        @keyframes buildingRise {
          from { transform: translateY(110%); opacity:0; }
          to   { transform: translateY(0);    opacity:1; }
        }
        @keyframes winAppear {
          from { opacity:0; transform:scale(0.4); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes winBlink {
          0%,90%,100% { opacity:1; }
          95%          { opacity:0.25; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes groundGlow {
          0%,100% { opacity:0.18; }
          50%      { opacity:0.28; }
        }

        .star { animation: twinkle var(--dur) var(--dly) ease-in-out infinite; }
        .lamp { animation: lampPulse 2.8s ease-in-out infinite; }
        .building-rise { animation: buildingRise 1.1s cubic-bezier(0.22,1,0.36,1) forwards; }
        .win-appear   { animation: winAppear 0.5s ease-out forwards; }
        .win-blink    { animation: winBlink var(--bd) var(--bly) ease-in-out infinite; }
        .fade-up      { animation: fadeUp 0.8s ease-out both; }
        .ground-glow  { animation: groundGlow 4s ease-in-out infinite; }
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
              "--op": 0.25 + Math.random() * 0.55,
              "--dur": `${s.dur}s`,
              "--dly": `${s.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Nebula */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 35% at 25% 18%, rgba(80,40,160,0.1) 0%, transparent 70%), radial-gradient(ellipse 40% 28% at 78% 12%, rgba(40,70,150,0.07) 0%, transparent 60%)",
      }} />

      {/* Top nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 pt-7 pb-4">
        <p style={{
          fontFamily: "'Crimson Pro', serif", fontWeight: 200,
          fontSize: "11px", letterSpacing: "0.42em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
        }}>
          still — writing
        </p>
        <button
          onClick={() => router.push("/editor")}
          style={{
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "13px", letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.5)",
            background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "100px", padding: "7px 20px", cursor: "pointer",
            transition: "all 0.4s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "rgba(255,255,255,0.9)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          }}
        >
          + 글쓰기
        </button>
      </nav>

      {/* Empty state copy */}
      {isEmpty && (
        <div className="relative z-10 text-center mt-16 fade-up" style={{ animationDelay: "0.5s" }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontWeight: 300, fontSize: "clamp(15px, 2.2vw, 20px)",
            color: "rgba(255,255,255,0.28)", letterSpacing: "0.05em",
          }}>
            아직 아무도 살지 않는 밤입니다
          </p>
          <p style={{
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "13px", color: "rgba(255,255,255,0.18)",
            letterSpacing: "0.08em", marginTop: "10px",
          }}>
            첫 글을 쓰면 이곳에 건물이 생겨납니다
          </p>
        </div>
      )}

      {/* City canvas */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "55vh", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      >
        {/* Ground line */}
        <div
          className="absolute bottom-0 left-0 right-0 ground-glow"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, rgba(120,80,220,0.5) 30%, rgba(160,100,255,0.7) 50%, rgba(120,80,220,0.5) 70%, transparent 100%)",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0" style={{
          height: "40px",
          background: "linear-gradient(to top, rgba(60,20,120,0.22), transparent)",
        }} />

        {/* Streetlamp — always visible */}
        <div
          className="absolute lamp"
          style={{ bottom: "0px", left: "calc(50% - 80px)", zIndex: 10 }}
        >
          <svg width="18" height="90" viewBox="0 0 18 90" fill="none">
            {/* Pole */}
            <rect x="8" y="20" width="2" height="70" fill="rgba(200,190,170,0.55)" />
            {/* Arm */}
            <path d="M9 20 Q9 8 16 8" stroke="rgba(200,190,170,0.55)" strokeWidth="1.8" fill="none" />
            {/* Lamp head */}
            <ellipse cx="16" cy="7" rx="5" ry="3" fill="rgba(255,220,100,0.9)" />
            {/* Glow cone */}
            <polygon points="11,10 21,10 24,28 8,28" fill="rgba(255,210,80,0.07)" />
          </svg>
        </div>

        {/* Buildings */}
        {!loading && (
          <div
            style={{
              display: "flex", alignItems: "flex-end", gap: "6px",
              paddingBottom: "0px", paddingLeft: "16px", paddingRight: "16px",
              flexWrap: "nowrap", overflowX: "auto",
              maxWidth: "90vw",
            }}
          >
            {buildings.map((b, bi) => {
              const h = getBuildingHeight(b);
              const w = GENRE_WIDTH[b.genre] ?? 50;
              const color = GENRE_COLOR[b.genre] ?? "#b0b8c8";
              const isNew = risingId === b.id;

              return (
                <div
                  key={b.id}
                  className={isNew ? "building-rise" : ""}
                  onClick={() => router.push(`/building/${b.id}`)}
                  style={{
                    position: "relative", cursor: "pointer",
                    flexShrink: 0,
                    transition: "transform 0.3s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <svg
                    width={w}
                    height={h}
                    viewBox={`0 0 ${w} ${h}`}
                    style={{ display: "block" }}
                  >
                    {/* Building body */}
                    <rect
                      x={0} y={0} width={w} height={h}
                      fill={`hsl(240,18%,${9 + bi % 4}%)`}
                      stroke="rgba(255,255,255,0.04)"
                      strokeWidth="0.5"
                    />
                    {/* Roof accent */}
                    <rect x={0} y={0} width={w} height={2.5} fill={`${color}40`} />

                    {/* Windows — 2 units per floor */}
                    {Array.from({ length: b.floor_count }).map((_, floorIdx) => {
                      const floor = b.floor_count - floorIdx; // top floor = highest number
                      const y = 10 + floorIdx * 18;
                      return [0, 1].map((unit) => {
                        const x = unit === 0 ? 7 : w - 7 - 10;
                        const lit = isWindowLit(b, floor, unit + 1);
                        const wc = getWindowColor(b, floor, unit + 1);
                        return (
                          <g key={`${floor}-${unit}`}>
                            {lit && (
                              <rect
                                x={x - 1} y={y - 1} width={12} height={14}
                                fill={wc} opacity={0.12} rx={1}
                              />
                            )}
                            <rect
                              className={lit ? "win-blink" : ""}
                              x={x} y={y} width={10} height={12}
                              fill={lit ? wc : "rgba(255,255,255,0.04)"}
                              opacity={lit ? 0.82 : 1}
                              rx={0.5}
                              style={lit ? {
                                "--bd": `${8 + Math.random() * 10}s`,
                                "--bly": `${Math.random() * 6}s`,
                              } as React.CSSProperties : undefined}
                            />
                          </g>
                        );
                      });
                    })}
                  </svg>

                  {/* Genre label */}
                  <p style={{
                    position: "absolute", bottom: "-18px", left: "50%",
                    transform: "translateX(-50%)",
                    fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                    fontSize: "10px", letterSpacing: "0.06em",
                    color: `${color}99`, whiteSpace: "nowrap",
                  }}>
                    {GENRE_LABEL[b.genre] ?? b.genre}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom info */}
      {!isEmpty && !loading && (
        <div
          className="absolute fade-up"
          style={{
            bottom: "28px", left: "50%", transform: "translateX(-50%)",
            textAlign: "center", zIndex: 20,
            animationDelay: "0.3s",
          }}
        >
          <p style={{
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "12px", letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.22)",
          }}>
            {buildings.reduce((a, b) => a + b.writings.length, 0)}편의 글이 이 도시에 살고 있습니다
          </p>
        </div>
      )}
    </main>
  );
}