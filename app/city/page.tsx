"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AuthGuard from "../components/AuthGuard";

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

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  op: number;
};

const WINDOW_COLORS = [
  "#ffd97d",
  "#ffb347",
  "#a8daff",
  "#ffa8c5",
  "#b8f0b8",
  "#e8d5ff",
];

const GENRE_COLOR: Record<string, string> = {
  시: "#d8c8e8",
  소설: "#b8ccd8",
  일기: "#e8d8b0",
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

function getWindowColor(floor: number, unit: number, emotionColor?: string | null, buildingId?: string) {
  if (emotionColor) return emotionColor;
  const seed = buildingId ? buildingId.charCodeAt(0) + buildingId.charCodeAt(1) : 0;
  return WINDOW_COLORS[(floor * 2 + unit + seed) % WINDOW_COLORS.length];
}

// 건물 블록 컴포넌트
function BuildingBlock({
  b, bi, risingId, floatingLabel, hoveredId, setHoveredId, onCityClick,
  isWindowLit, getWritingColor,
}: {
  b: Building;
  bi: number;
  risingId: string | null;
  floatingLabel: { id: string; text: string } | null;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onCityClick: (id: string) => void;
  isWindowLit: (b: Building, floor: number, unit: number) => boolean;
  getWritingColor: (b: Building, floor: number, unit: number) => string;
}) {
  const bh = 60 + b.floor_count * 18;
  const bw = GENRE_WIDTH[b.genre] ?? 50;
  const accentColor = GENRE_COLOR[b.genre] ?? "#c8c0b0";
  const isNew = risingId === b.id;
  const showFloat = floatingLabel?.id === b.id;
  const isHovered = hoveredId === b.id;

  return (
    <div
      className={isNew ? "building-rise" : ""}
      onClick={() => onCityClick(b.id)}
      onMouseEnter={() => setHoveredId(b.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        width: bw,
        height: bh,
        outline: isHovered ? `1px solid ${accentColor}50` : "1px solid transparent",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.3s ease",
      }}
    >
      {showFloat && (
        <div className="float-label" style={{
          position: "absolute", top: "-32px", left: "50%",
          whiteSpace: "nowrap", pointerEvents: "none", zIndex: 30,
          fontFamily: "'Crimson Pro', serif", fontWeight: 200,
          fontSize: "11px", letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.55)",
          background: "rgba(10,5,25,0.7)",
          padding: "3px 10px", borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          {floatingLabel!.text}
        </div>
      )}

      {isHovered && (
        <div style={{
          position: "absolute", top: "-22px", left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap", pointerEvents: "none", zIndex: 30,
          fontFamily: "'Crimson Pro', serif", fontWeight: 200,
          fontSize: "10px", letterSpacing: "0.08em",
          color: `${accentColor}cc`,
        }}>
          {GENRE_LABEL[b.genre] ?? b.genre}
        </div>
      )}

      <div style={{
        position: "absolute", inset: 0,
        background: `hsl(240,18%,${9 + bi % 4}%)`,
        border: "0.5px solid rgba(255,255,255,0.04)",
      }} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2.5px",
        background: `${accentColor}30`,
      }} />

      {Array.from({ length: b.floor_count }).map((_, floorIdx) => {
        const floor = b.floor_count - floorIdx;
        const topPx = 10 + floorIdx * 18;
        return [0, 1].map((unitIdx) => {
          const unit = unitIdx + 1;
          const leftPx = unitIdx === 0 ? 7 : bw - 17;
          const lit = isWindowLit(b, floor, unit);
          const wc = getWritingColor(b, floor, unit);
          const bd = `${9 + (floor * 3 + unitIdx) % 8}s`;
          const bly = `${(floor + unitIdx) % 6}s`;
          return (
            <div
              key={`${floor}-${unitIdx}`}
              className={lit ? "win-lit" : ""}
              style={{
                position: "absolute",
                top: topPx, left: leftPx,
                width: 10, height: 12, borderRadius: 1,
                background: lit ? wc : "rgba(255,255,255,0.03)",
                opacity: lit ? 0.85 : 1,
                ...(lit ? {
                  "--wc": wc + "88",
                  "--bd": bd,
                  "--bly": bly,
                } as React.CSSProperties : {}),
              }}
            />
          );
        });
      })}
    </div>
  );
}

function PostOfficeBuilding({ letterCount, onClick }: { letterCount: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const bw = 52;
  const bh = 80;
  const litCount = Math.min(letterCount, 6);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        width: bw,
        height: bh,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.3s ease",
      }}
    >
      {hovered && (
        <div style={{
          position: "absolute", top: "-22px", left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap", pointerEvents: "none", zIndex: 30,
          fontFamily: "'Crimson Pro', serif", fontWeight: 200,
          fontSize: "10px", letterSpacing: "0.08em",
          color: "rgba(255,220,150,0.8)",
        }}>
          우체국
        </div>
      )}

      <div style={{
        position: "absolute", inset: 0,
        background: "hsl(35, 15%, 10%)",
        border: "0.5px solid rgba(255,220,150,0.1)",
      }} />

      <svg width={bw} height={14} style={{ position: "absolute", top: -12, left: 0 }} viewBox={`0 0 ${bw} 14`}>
        <polygon points={`0,14 ${bw / 2},0 ${bw},14`} fill="hsl(35,15%,12%)" stroke="rgba(255,220,150,0.1)" strokeWidth="0.5" />
      </svg>

      <div style={{
        position: "absolute", top: -18, left: "50%",
        transform: "translateX(-50%)",
        width: 4, height: 4, borderRadius: "50%",
        background: "rgba(255,220,100,0.6)",
        boxShadow: "0 0 6px 2px rgba(255,220,100,0.4)",
      }} />

      <div style={{
        position: "absolute", top: 8, left: "50%",
        transform: "translateX(-50%)",
        whiteSpace: "nowrap",
        fontFamily: "'Crimson Pro', serif", fontWeight: 200,
        fontSize: "7px", letterSpacing: "0.15em",
        color: "rgba(255,220,150,0.5)",
      }}>
        POST
      </div>

      {Array.from({ length: 3 }).map((_, row) =>
        [0, 1].map((col) => {
          const idx = row * 2 + col;
          const lit = idx < litCount;
          const x = col === 0 ? 9 : bw - 19;
          const y = 22 + row * 16;
          return (
            <div
              key={`${row}-${col}`}
              className={lit ? "win-lit" : ""}
              style={{
                position: "absolute",
                top: y, left: x,
                width: 10, height: 10, borderRadius: 1,
                background: lit ? "#e8c870" : "rgba(255,255,255,0.03)",
                opacity: lit ? 0.85 : 1,
                ...(lit ? {
                  "--wc": "#e8c87066",
                  "--bd": `${10 + idx * 2}s`,
                  "--bly": `${idx}s`,
                } as React.CSSProperties : {}),
              }}
            />
          );
        })
      )}

      <div style={{
        position: "absolute", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: 14, height: 20,
        background: "rgba(255,220,100,0.06)",
        border: "0.5px solid rgba(255,220,100,0.12)",
        borderRadius: "3px 3px 0 0",
      }} />
    </div>
  );
}

export default function CityPage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [risingId, setRisingId] = useState<string | null>(null);
  const [floatingLabel, setFloatingLabel] = useState<{ id: string; text: string } | null>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [letterCount, setLetterCount] = useState(0);

  useEffect(() => {
    setStars(
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 75,
        size: Math.random() * 1.8 + 0.4,
        dur: 3 + Math.random() * 5,
        delay: Math.random() * 6,
        op: 0.25 + Math.random() * 0.55,
      }))
    );
    fetchCity();
  }, []);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const newBuildingId = params.get("newBuilding");
  if (newBuildingId) {
    setRisingId(newBuildingId);
    setTimeout(() => setRisingId(null), 1500);
  }
  fetchCity();
}, []);

  async function fetchCity() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    const { data: bData } = await supabase
      .from("buildings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!bData || bData.length === 0) {
      setBuildings([]);
      setLoading(false);

      const { count: postCount } = await supabase
        .from("writings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("open_at", "is", null);
      setLetterCount(postCount ?? 0);
      return;
    }

    const { data: wData } = await supabase
      .from("writings")
      .select("id, title, floor, unit, emotion_color, building_id")
      .in("building_id", bData.map((b) => b.id));

    const enriched = bData.map((b) => ({
      ...b,
      writings: (wData ?? []).filter((w) => w.building_id === b.id),
    }));

    setBuildings(enriched);

    const { count: postCount } = await supabase
      .from("writings")
      .select("id", { count: "exact", head: true })
      .not("open_at", "is", null);
    setLetterCount(postCount ?? 0);

    setLoading(false);

    if (enriched.length > 0) {
      const latest = enriched[enriched.length - 1];
      const total = enriched.reduce((a, b) => a + b.writings.length, 0);
      setFloatingLabel({ id: latest.id, text: `${total}편의 글이 살고 있습니다` });
      setTimeout(() => setFloatingLabel(null), 3000);
    }
  }

  const isEmpty = !loading && buildings.length === 0;

  function isWindowLit(b: Building, floor: number, unit: number) {
    return b.writings.some((w) => w.floor === floor && w.unit === unit);
  }

function getWritingColor(b: Building, floor: number, unit: number) {
  const w = b.writings.find((wr) => wr.floor === floor && wr.unit === unit);
  return getWindowColor(floor, unit, w?.emotion_color, b.id);
}

  // 건물을 홀수/짝수 인덱스로 좌/우 분리
  const leftBuildings = buildings.filter((_, i) => i % 2 === 0).reverse();
  const rightBuildings = buildings.filter((_, i) => i % 2 === 1);

  return (
    <AuthGuard>
      <main
        className="relative min-h-screen"
        style={{
          background: "linear-gradient(180deg, #03010a 0%, #080318 45%, #100828 100%)",
          overflow: "hidden",
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
          @keyframes winBlink {
            0%,88%,100% { opacity:0.85; }
            93%          { opacity:0.15; }
          }
          @keyframes fadeUp {
            from { opacity:0; transform:translateY(14px); }
            to   { opacity:1; transform:translateY(0); }
          }
          @keyframes groundGlow {
            0%,100% { opacity:0.18; }
            50%      { opacity:0.28; }
          }
          @keyframes floatLabel {
            0%   { opacity:0; transform:translateX(-50%) translateY(6px); }
            15%  { opacity:1; transform:translateX(-50%) translateY(0); }
            75%  { opacity:1; transform:translateX(-50%) translateY(0); }
            100% { opacity:0; transform:translateX(-50%) translateY(-8px); }
          }
          @keyframes winGlow {
            0%,100% { box-shadow: 0 0 4px 1px var(--wc); }
            50%      { box-shadow: 0 0 10px 3px var(--wc); }
          }

          .star          { animation: twinkle var(--dur) var(--dly) ease-in-out infinite; }
          .lamp          { animation: lampPulse 2.8s ease-in-out infinite; }
          .building-rise { animation: buildingRise 1.1s cubic-bezier(0.22,1,0.36,1) forwards; }
          .win-lit {
            animation:
              winBlink var(--bd) var(--bly) ease-in-out infinite,
              winGlow var(--bd) var(--bly) ease-in-out infinite;
          }
          .fade-up     { animation: fadeUp 0.8s ease-out both; }
          .ground-glow { animation: groundGlow 4s ease-in-out infinite; }
          .float-label { animation: floatLabel 3s ease-in-out forwards; }
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
            onClick={() => router.push("/start")}
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

        {/* Empty state */}
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
          style={{ height: "58vh", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}
        >
          {/* Ground glow */}
          <div className="absolute bottom-0 left-0 right-0 ground-glow" style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, rgba(120,80,220,0.5) 30%, rgba(160,100,255,0.7) 50%, rgba(120,80,220,0.5) 70%, transparent 100%)",
          }} />
          <div className="absolute bottom-0 left-0 right-0" style={{
            height: "40px",
            background: "linear-gradient(to top, rgba(60,20,120,0.22), transparent)",
          }} />

          {!loading && (
            <div style={{
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              width: "100%", paddingTop: "40px", overflow: "visible",
            }}>
              {/* 왼쪽 건물들 — 중앙에서 바깥으로 */}
              <div style={{ display: "flex", alignItems: "flex-end", flexDirection: "row", gap: "6px" }}>
                {leftBuildings.map((b, bi) => (
                  <BuildingBlock
                    key={b.id} b={b} bi={bi}
                    risingId={risingId} floatingLabel={floatingLabel}
                    hoveredId={hoveredId} setHoveredId={setHoveredId}
                    onCityClick={(id) => router.push(`/building/${id}`)}
                    isWindowLit={isWindowLit} getWritingColor={getWritingColor}
                  />
                ))}
              </div>

              {/* 가로등 */}
              <div className="lamp" style={{ flexShrink: 0, zIndex: 10, marginBottom: 0, marginRight: "16px" }}>
                <svg width="18" height="90" viewBox="0 0 18 90" fill="none">
                  <rect x="8" y="20" width="2" height="70" fill="rgba(200,190,170,0.55)" />
                  <path d="M9 20 Q9 8 16 8" stroke="rgba(200,190,170,0.55)" strokeWidth="1.8" fill="none" />
                  <ellipse cx="16" cy="7" rx="5" ry="3" fill="rgba(255,220,100,0.9)" />
                  <polygon points="11,10 21,10 24,28 8,28" fill="rgba(255,210,80,0.07)" />
                </svg>
              </div>

              {/* 우체국 — 가로등 바로 오른쪽 */}
              <PostOfficeBuilding
                letterCount={letterCount}
                onClick={() => router.push("/post-office")}
              />

              {/* 오른쪽 건물들 */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", marginLeft: "6px" }}>
                {rightBuildings.map((b, bi) => (
                  <BuildingBlock
                    key={b.id} b={b} bi={bi}
                    risingId={risingId} floatingLabel={floatingLabel}
                    hoveredId={hoveredId} setHoveredId={setHoveredId}
                    onCityClick={(id) => router.push(`/building/${id}`)}
                    isWindowLit={isWindowLit} getWritingColor={getWritingColor}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}