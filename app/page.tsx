"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

// --- Star data ---
const STAR_COUNT = 80;

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 60,
    size: Math.random() * 2 + 0.5,
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 6,
    opacity: 0.3 + Math.random() * 0.7,
  }));
}

// --- Building window data ---
function generateBuildings() {
  return [
    { x: 0,   width: 28, height: 72,  windows: generateWindows(2, 5) },
    { x: 24,  width: 20, height: 55,  windows: generateWindows(2, 4) },
    { x: 40,  width: 35, height: 88,  windows: generateWindows(3, 6) },
    { x: 72,  width: 24, height: 62,  windows: generateWindows(2, 5) },
    { x: 92,  width: 30, height: 80,  windows: generateWindows(2, 6) },
    { x: 118, width: 22, height: 50,  windows: generateWindows(2, 4) },
    { x: 136, width: 40, height: 96,  windows: generateWindows(3, 7) },
    { x: 172, width: 26, height: 68,  windows: generateWindows(2, 5) },
    { x: 194, width: 32, height: 84,  windows: generateWindows(2, 6) },
    { x: 222, width: 20, height: 58,  windows: generateWindows(2, 4) },
    { x: 238, width: 36, height: 92,  windows: generateWindows(3, 6) },
    { x: 270, width: 24, height: 66,  windows: generateWindows(2, 5) },
    { x: 290, width: 28, height: 76,  windows: generateWindows(2, 6) },
    { x: 314, width: 38, height: 100, windows: generateWindows(3, 7) },
    { x: 348, width: 22, height: 60,  windows: generateWindows(2, 4) },
    { x: 366, width: 30, height: 82,  windows: generateWindows(2, 6) },
    { x: 392, width: 25, height: 70,  windows: generateWindows(2, 5) },
    { x: 413, width: 34, height: 88,  windows: generateWindows(3, 6) },
    { x: 443, width: 20, height: 54,  windows: generateWindows(2, 4) },
    { x: 459, width: 28, height: 74,  windows: generateWindows(2, 5) },
    { x: 483, width: 36, height: 94,  windows: generateWindows(3, 7) },
    { x: 515, width: 22, height: 62,  windows: generateWindows(2, 5) },
    { x: 533, width: 30, height: 80,  windows: generateWindows(2, 6) },
    { x: 559, width: 24, height: 56,  windows: generateWindows(2, 4) },
    { x: 579, width: 38, height: 90,  windows: generateWindows(3, 6) },
    { x: 613, width: 26, height: 68,  windows: generateWindows(2, 5) },
    { x: 635, width: 32, height: 84,  windows: generateWindows(2, 6) },
    { x: 663, width: 20, height: 58,  windows: generateWindows(2, 4) },
    { x: 679, width: 36, height: 86,  windows: generateWindows(3, 6) },
    { x: 711, width: 24, height: 64,  windows: generateWindows(2, 5) },
    { x: 731, width: 30, height: 78,  windows: generateWindows(2, 6) },
    { x: 757, width: 38, height: 92,  windows: generateWindows(3, 7) },
    { x: 791, width: 22, height: 60,  windows: generateWindows(2, 4) },
    { x: 809, width: 31, height: 76,  windows: generateWindows(2, 5) },
  ];
}

function generateWindows(cols: number, rows: number) {
  return Array.from({ length: cols * rows }, (_, i) => ({
    id: i,
    col: i % cols,
    row: Math.floor(i / cols),
    lit: Math.random() > 0.35,
    color: getWindowColor(),
    blinkDelay: Math.random() * 10,
  }));
}

function getWindowColor() {
  const colors = [
    "#f5dfa0", // soft warm yellow
    "#e8c97a", // muted amber
    "#f0e4c0", // cream
    "#d4c5a0", // warm beige
    "#c8d8e8", // very muted blue
    "#e0d0b8", // pale gold
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function Home() {
  const router = useRouter(); 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/city");
    });
  }, []);
  
  const [stars] = useState(() => generateStars(STAR_COUNT));
  const [buildings] = useState(() => generateBuildings());
  const [mounted, setMounted] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const cityRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => setTitleVisible(true), 600);
    const t2 = setTimeout(() => setSubtitleVisible(true), 1400);
    const t3 = setTimeout(() => setButtonsVisible(true), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg, #03010a 0%, #0a0520 40%, #12082e 70%, #1a0f3e 100%)" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Crimson+Pro:ital,wght@0,200;0,300;1,200&display=swap');

        @keyframes twinkle {
          0%, 100% { opacity: var(--star-opacity); transform: scale(1); }
          50% { opacity: calc(var(--star-opacity) * 0.2); transform: scale(0.6); }
        }
        @keyframes drift {
          0% { transform: translateX(0px) translateY(0px); }
          33% { transform: translateX(8px) translateY(-4px); }
          66% { transform: translateX(-4px) translateY(6px); }
          100% { transform: translateX(0px) translateY(0px); }
        }
        @keyframes cityRise {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes windowBlink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.3; }
        }
        @keyframes fogDrift {
          0% { transform: translateX(-5%) scaleX(1); opacity: 0.06; }
          50% { transform: translateX(3%) scaleX(1.05); opacity: 0.1; }
          100% { transform: translateX(-5%) scaleX(1); opacity: 0.06; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0) rotate(-30deg); opacity: 0; width: 0; }
          10% { opacity: 1; }
          100% { transform: translateX(300px) translateY(120px) rotate(-30deg); opacity: 0; width: 120px; }
        }

        .star { animation: twinkle var(--duration) var(--delay) ease-in-out infinite, drift calc(var(--duration) * 2.5) var(--delay) ease-in-out infinite; }
        .city-group { animation: cityRise 2s 0.3s ease-out both; }
        .window-blink { animation: windowBlink calc(var(--blink-duration) * 1s) var(--blink-delay-val) ease-in-out infinite; }
        .fog-layer { animation: fogDrift 18s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.9s ease-out both; }
        .shooting { animation: shootingStar 4s 3s ease-in infinite; }

        .btn-primary {
          position: relative;
          padding: 14px 36px;
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 100px;
          font-family: 'Crimson Pro', serif;
          font-weight: 200;
          font-size: 15px;
          letter-spacing: 0.12em;
          color: white;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition: all 0.6s ease;
          overflow: hidden;
          text-decoration: none;
          display: inline-block;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(180,130,255,0.15), transparent 70%);
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .btn-primary:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.08); }
        .btn-primary:hover::before { opacity: 1; }

        .btn-secondary {
          padding: 14px 36px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          font-family: 'Crimson Pro', serif;
          font-weight: 200;
          font-size: 15px;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.6);
          background: transparent;
          cursor: pointer;
          transition: all 0.6s ease;
          text-decoration: none;
          display: inline-block;
        }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.9); }
      `}</style>

      {/* Stars */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                "--star-opacity": star.opacity,
                "--duration": `${star.duration}s`,
                "--delay": `${star.delay}s`,
              } as React.CSSProperties}
            />
          ))}

          {/* Shooting star */}
          <div
            className="absolute shooting"
            style={{
              top: "12%",
              left: "20%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
              width: "80px",
            }}
          />
        </div>
      )}

      {/* Nebula glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 40% at 30% 20%, rgba(80,40,160,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 75% 15%, rgba(40,80,160,0.08) 0%, transparent 60%)"
      }} />

      {/* City SVG */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ opacity: 0.55 }}>
        {mounted && (
          <svg
            ref={cityRef}
            viewBox="0 0 840 120"
            preserveAspectRatio="xMidYMax meet"
            className="w-full"
            style={{ display: "block", height: "120px" }}
          >
            <defs>
              <linearGradient id="skyGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2a1060" stopOpacity="0" />
                <stop offset="100%" stopColor="#1a0840" stopOpacity="0.6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="windowGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <g className="city-group">
              {buildings.map((b, bi) => {
                const svgHeight = 120;
                const buildingTop = svgHeight - b.height;
                const winW = (b.width - 10) / (Math.max(...b.windows.map(w => w.col)) + 1) * 0.6;
                const winH = winW * 1.4;
                const colCount = Math.max(...b.windows.map(w => w.col)) + 1;
                const rowCount = Math.max(...b.windows.map(w => w.row)) + 1;
                const colSpacing = (b.width - 10) / colCount;
                const rowSpacing = (b.height - 20) / (rowCount + 1);

                return (
                  <g key={bi}>
                    {/* Building body */}
                    <rect
                      x={b.x}
                      y={buildingTop}
                      width={b.width}
                      height={b.height}
                      fill={`hsl(240, 20%, ${8 + bi % 5}%)`}
                      stroke="rgba(255,255,255,0.04)"
                      strokeWidth="0.5"
                    />
                    {/* Building top accent */}
                    <rect
                      x={b.x}
                      y={buildingTop}
                      width={b.width}
                      height={3}
                      fill="rgba(255,255,255,0.06)"
                    />

                    {/* Windows */}
                    {b.windows.map((w) => {
                      if (!w.lit) return null;
                      const wx = b.x + 5 + w.col * colSpacing + (colSpacing - winW) / 2;
                      const wy = buildingTop + 15 + (w.row + 0.5) * rowSpacing;
                      return (
                        <g key={w.id}>
                          {/* Glow behind window */}
                          <rect
                            x={wx - 2}
                            y={wy - 2}
                            width={winW + 4}
                            height={winH + 4}
                            fill={w.color}
                            opacity={0.15}
                            rx={1}
                            filter="url(#windowGlow)"
                          />
                          {/* Window */}
                          <rect
                            className="window-blink"
                            x={wx}
                            y={wy}
                            width={winW}
                            height={winH}
                            fill={w.color}
                            opacity={0.85}
                            rx={0.5}
                            style={{
                              "--blink-duration": 8 + Math.random() * 12,
                              "--blink-delay-val": `${w.blinkDelay}s`,
                            } as React.CSSProperties}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Ground / horizon glow */}
              <rect x={0} y={112} width={840} height={8} fill="rgba(100,60,200,0.1)" />
              <ellipse cx={420} cy={116} rx={500} ry={10} fill="rgba(80,40,180,0.06)" />
            </g>

            {/* Fog layers */}
            <rect className="fog-layer" x={-50} y={90} width={940} height={30}
              fill="rgba(150,120,255,0.04)" rx={20}
              style={{ transformOrigin: "center" }}
            />
          </svg>
        )}
      </div>

      {/* Horizon glow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(60,20,120,0.3), transparent)" }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl" style={{ marginBottom: "180px" }}>
        <div style={{ opacity: titleVisible ? 1 : 0, transition: "none" }}>
          <p
            className="fade-up"
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontWeight: 200,
              fontSize: "11px",
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "28px",
              animationDelay: "0.6s",
            }}
          >
            still — writing
          </p>

          <h1
            className="fade-up"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(32px, 6vw, 62px)",
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.92)",
              letterSpacing: "0.01em",
              animationDelay: "0.8s",
              marginBottom: "20px",
            }}
          >
            오늘은 어떤 문장이<br />
            <em style={{ fontStyle: "italic", color: "rgba(200,170,255,0.9)" }}>당신을 기다리고</em> 있나요
          </h1>
        </div>

        <p
          className="fade-up"
          style={{
            fontFamily: "'Crimson Pro', serif",
            fontWeight: 200,
            fontSize: "15px",
            lineHeight: 1.9,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.04em",
            animationDelay: "1.4s",
            marginBottom: "48px",
            opacity: subtitleVisible ? undefined : 0,
          }}
        >
          저 도시의 불 켜진 창문들처럼,<br />
          오늘 밤도 누군가는 쓰고 있습니다.
        </p>

        <div
          className="fade-up"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            animationDelay: "2s",
            opacity: buttonsVisible ? undefined : 0,
          }}
        >
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/city" className="btn-primary">
              내 방으로 가기
            </Link>
            <Link href="/explore" className="btn-secondary">
              조용히 둘러보기
            </Link>
          </div>
          <Link
            href="/library"
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontWeight: 200,
              fontSize: "13px",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.25)",
              textDecoration: "none",
              transition: "color 0.4s",
              marginTop: "4px",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
          >
            나의 방 →
          </Link>
        </div>
      </div>
    </main>
  );
}