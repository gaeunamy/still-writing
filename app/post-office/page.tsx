"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AuthGuard from "../components/AuthGuard";

type Letter = {
  id: string;
  title: string | null;
  content: string;
  genre: string | null;
  mood: string | null;
  emotion_color: string | null;
  created_at: string;
  open_at: string | null;
};

const COLS = 5;
const ROWS = 4;
const TOTAL_BOXES = COLS * ROWS;

const WINDOW_COLORS = [
  "#ffd97d",
  "#ffb347",
  "#a8daff",
  "#ffa8c5",
  "#b8f0b8",
  "#e8d5ff",
];

function getDaysRemaining(openAt: string): number {
  const now = new Date();
  const target = new Date(openAt);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getBrightness(createdAt: string, openAt: string): number {
  const created = new Date(createdAt).getTime();
  const open = new Date(openAt).getTime();
  const now = Date.now();
  const total = open - created;
  const elapsed = now - created;
  const ratio = Math.min(Math.max(elapsed / total, 0), 1);
  return 0.06 + ratio * 0.88;
}

function isUnlocked(openAt: string | null): boolean {
  if (!openAt) return true;
  return new Date(openAt) <= new Date();
}

export default function PostOfficePage() {
  const router = useRouter();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Letter | null>(null);

  useEffect(() => {
    fetchLetters();
  }, []);

  async function fetchLetters() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from("writings")
      .select("id, title, content, genre, mood, emotion_color, created_at, open_at")
      .eq("user_id", user.id)
      .not("open_at", "is", null)
      .order("open_at", { ascending: true });

    setLetters(data ?? []);
    setLoading(false);
  }

  const totalBoxes = Math.max(TOTAL_BOXES, Math.ceil(letters.length / COLS) * COLS);

  return (
    <AuthGuard>
      <main
        className="relative min-h-screen px-6 py-14"
        style={{ background: "linear-gradient(180deg, #03010a 0%, #080318 55%, #100828 100%)" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Crimson+Pro:wght@200;300&display=swap');

          @keyframes fadeUp {
            from { opacity:0; transform:translateY(12px); }
            to   { opacity:1; transform:translateY(0); }
          }
          @keyframes modalIn {
            from { opacity:0; transform:translateY(20px) scale(0.98); }
            to   { opacity:1; transform:translateY(0) scale(1); }
          }
          @keyframes slotBlink {
            0%,80%,100% { opacity:1; box-shadow: 0 0 8px 3px var(--sc); }
            90%          { opacity:0.1; box-shadow: none; }
          }
          @keyframes slotGlow {
            0%,100% { opacity: var(--sb); box-shadow: 0 0 calc(var(--sb) * 10px) 2px var(--sc); }
            50%      { opacity: calc(var(--sb) * 1.4); box-shadow: 0 0 calc(var(--sb) * 16px) 3px var(--sc); }
          }

          .fade-up    { animation: fadeUp 0.7s ease-out both; }
          .modal-in   { animation: modalIn 0.45s ease-out both; }
          .slot-blink { animation: slotBlink 1.6s ease-in-out infinite; }
          .slot-glow  { animation: slotGlow 2.5s ease-in-out infinite; }
        `}</style>

        <div className="max-w-4xl mx-auto">

          {/* Back */}
          <button
            onClick={() => router.push("/city")}
            className="fade-up"
            style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "11px", letterSpacing: "0.38em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)", background: "none", border: "none",
              cursor: "pointer", transition: "color 0.3s", marginBottom: "32px",
              display: "block",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
          >
            ← 도시로
          </button>

          {/* Header */}
          <div className="fade-up" style={{ marginBottom: "40px", animationDelay: "0.05s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
                <rect x="1" y="1" width="24" height="18" rx="2" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" fill="none"/>
                <path d="M1 4 L13 12 L25 4" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" fill="none"/>
              </svg>
              <p style={{
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "20px", letterSpacing: "0.35em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}>
                POST BOX
              </p>
            </div>
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "13px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em",
            }}>
              {letters.length > 0
                ? `${letters.filter(l => isUnlocked(l.open_at)).length}통의 편지가 도착해 있습니다`
                : "아직 맡긴 편지가 없습니다"}
            </p>
          </div>

          {loading && (
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "13px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em",
            }}>
              불러오는 중...
            </p>
          )}

          {/* 우편함 패널 */}
          {!loading && (
            <div
              className="fade-up"
              style={{
                animationDelay: "0.15s",
                background: "linear-gradient(180deg, rgba(18,10,40,0.9) 0%, rgba(12,6,28,0.95) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px",
                padding: "20px",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gap: "10px",
              }}>
                {Array.from({ length: totalBoxes }).map((_, idx) => {
                  const letter = letters[idx] ?? null;
                  const unlocked = letter ? isUnlocked(letter.open_at) : false;
                  const daysLeft = letter?.open_at ? getDaysRemaining(letter.open_at) : 0;
                  const brightness = letter?.open_at && !unlocked
                    ? getBrightness(letter.created_at, letter.open_at)
                    : 1;
                  const slotColor = letter?.emotion_color
                    ?? WINDOW_COLORS[idx % WINDOW_COLORS.length];

                  return (
                    <div
                      key={idx}
                      onClick={() => { if (letter && unlocked) setSelected(letter); }}
                      style={{
                        position: "relative",
                        // 우편함 본체
                        background: "linear-gradient(160deg, rgba(38,28,72,0.95) 0%, rgba(25,18,52,0.98) 100%)",
                        border: "1px solid rgba(120,90,200,0.18)",
                        borderRadius: "6px",
                        padding: "10px 10px 10px 10px",
                        cursor: letter && unlocked ? "pointer" : "default",
                        transition: "all 0.3s",
                        height: "90px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 4px rgba(0,0,0,0.3)",
                      }}
                      onMouseEnter={e => {
                        if (letter && unlocked) {
                          e.currentTarget.style.borderColor = "rgba(120,160,210,0.45)";
                          e.currentTarget.style.background = "linear-gradient(160deg, rgba(40,58,82,0.95) 0%, rgba(28,42,62,0.98) 100%)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (letter && unlocked) {
                          e.currentTarget.style.borderColor = "rgba(80,110,150,0.25)";
                          e.currentTarget.style.background = "linear-gradient(160deg, rgba(30,45,65,0.9) 0%, rgba(20,32,48,0.95) 100%)";
                        }
                      }}
                    >
                      {/* 상단 — 제목 박스 (둥근 직사각형, 오른쪽 정렬) */}
                      <div style={{
                        background: letter 
                        ? unlocked 
                        ? "rgba(60,42,110,0.5)" 
                        : `rgba(45,32,85,${brightness * 0.4})` 
                        : "rgba(255,255,255,0.03)",
                        border: `1px solid ${letter 
                          ? unlocked 
                          ? "rgba(140,110,220,0.25)" 
                          : `rgba(110,85,180,${brightness * 0.2})` 
                          : "rgba(255,255,255,0.05)"}`,
                        borderRadius: "20px",
                        padding: "5px 10px",
                        minHeight: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}>
                        {letter ? (
                          <p style={{
                            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
                            fontSize: "11px", lineHeight: 1.3,
                            color: unlocked
                              ? "rgba(255,235,190,0.85)"
                              : `rgba(220,200,160,${Math.max(brightness * 0.7, 0.15)})`,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                            textAlign: "right",
                          }}>
                            {letter.title || "제목 없음"}
                          </p>
                        ) : (
                          <div style={{ width: "100%" }} />
                        )}
                      </div>

                      {/* 하단 — 왼쪽 슬롯 + 오른쪽 D-day */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}>
                        {/* 왼쪽 빛나는 슬롯 */}
                        <div style={{
                          width: "40%",
                          height: "7px",
                          background: "rgba(0,0,0,0.6)",
                          borderRadius: "3px",
                          border: "1px solid rgba(0,0,0,0.8)",
                          overflow: "hidden",
                          position: "relative",
                        }}>
                          {letter && (
                            <div
                              className={unlocked ? "slot-blink" : "slot-glow"}
                              style={{
                                position: "absolute", inset: 0,
                                background: slotColor,
                                borderRadius: "3px",
                                "--sc": slotColor + "aa",
                                "--sb": brightness,
                              } as React.CSSProperties}
                            />
                          )}
                        </div>

                        {/* 오른쪽 D-day */}
                        <p style={{
                          fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                          fontSize: "10px", letterSpacing: "0.04em",
                          color: letter
                            ? unlocked
                              ? `${slotColor}cc`
                              : `rgba(255,255,255,${Math.max(brightness * 0.5, 0.15)})`
                            : "rgba(255,255,255,0.06)",
                        }}>
                          {letter
                            ? unlocked
                              ? "open"
                              : daysLeft <= 1
                                ? "D-1"
                                : `D-${daysLeft}`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && (
            <div className="fade-up text-center" style={{ marginTop: "28px", animationDelay: "0.3s" }}>
              <button
                onClick={() => router.push("/start")}
                style={{
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "13px", letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.3)",
                  background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "100px", padding: "9px 24px", cursor: "pointer",
                  transition: "all 0.4s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                + 새 편지 쓰기
              </button>
            </div>
          )}
        </div>

        {/* 편지 열람 모달 */}
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
              <div style={{ textAlign: "center", marginBottom: "24px", fontSize: "28px" }}>✉️</div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <p style={{
                    fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                    fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.25)", marginBottom: "8px",
                  }}>
                    {new Date(selected.created_at).toLocaleDateString("ko-KR")} 에 쓴 편지
                  </p>
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
                {selected.open_at && (
                  <p style={{
                    fontFamily: "'Crimson Pro', serif", fontStyle: "italic",
                    fontWeight: 200, fontSize: "12px", color: "rgba(255,255,255,0.22)",
                  }}>
                    {new Date(selected.open_at).toLocaleDateString("ko-KR")} 도착
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}