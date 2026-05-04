"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AuthGuard from "../components/AuthGuard";

type Writing = {
  id: string;
  title: string | null;
  content: string;
  genre: string | null;
  mood: string | null;
  emotion_color: string | null;
  is_public: boolean;
  created_at: string;
  floor: number | null;
  unit: number | null;
  building_id: string | null;
};

export default function LibraryPage() {
  const router = useRouter();
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Writing | null>(null);

  useEffect(() => {
    fetchWritings();
  }, []);

  async function fetchWritings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from("writings")
      .select("id, title, content, genre, mood, emotion_color, is_public, created_at, floor, unit, building_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setWritings(data ?? []);
    setLoading(false);
  }

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
          .fade-up  { animation: fadeUp 0.7s ease-out both; }
          .modal-in { animation: modalIn 0.45s ease-out both; }
          .writing-card {
            padding: 24px 28px;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 18px;
            background: rgba(255,255,255,0.015);
            cursor: pointer;
            transition: all 0.35s ease;
            text-align: left;
            width: 100%;
          }
          .writing-card:hover {
            border-color: rgba(255,255,255,0.15);
            background: rgba(255,255,255,0.035);
            transform: translateY(-2px);
          }
        `}</style>

        <div className="max-w-2xl mx-auto">

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

          <p className="fade-up" style={{
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "11px", letterSpacing: "0.42em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", marginBottom: "12px",
            animationDelay: "0.05s",
          }}>
            my library
          </p>

          <h1 className="fade-up" style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
            fontSize: "clamp(24px, 3.5vw, 40px)", lineHeight: 1.35,
            color: "rgba(255,255,255,0.88)", marginBottom: "8px",
            animationDelay: "0.1s",
          }}>
            내가 남긴 문장들
          </h1>

          <p className="fade-up" style={{
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "13px", color: "rgba(255,255,255,0.28)",
            letterSpacing: "0.06em", marginBottom: "48px",
            animationDelay: "0.15s",
          }}>
            {writings.length > 0 ? `${writings.length}편의 글` : "아직 쓴 글이 없습니다"}
          </p>

          {/* Loading */}
          {loading && (
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "13px", color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.08em",
            }}>
              불러오는 중...
            </p>
          )}

          {/* Writings list */}
          {!loading && (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "12px", animationDelay: "0.2s" }}>
              {writings.map((w) => (
                <button
                  key={w.id}
                  className="writing-card"
                  onClick={() => setSelected(w)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {w.emotion_color && (
                        <div style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: w.emotion_color,
                          boxShadow: `0 0 6px ${w.emotion_color}`,
                          flexShrink: 0,
                        }} />
                      )}
                      <p style={{
                        fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                        fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase",
                        color: "rgba(255,255,255,0.25)",
                      }}>
                        {w.genre ?? "—"}
                        {w.floor && w.unit ? ` · ${w.floor}F ${w.unit}호` : ""}
                      </p>
                    </div>
                    <p style={{
                      fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                      fontSize: "11px", color: "rgba(255,255,255,0.2)",
                      letterSpacing: "0.04em", flexShrink: 0, marginLeft: "12px",
                    }}>
                      {new Date(w.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>

                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
                    fontSize: "18px", color: "rgba(255,255,255,0.82)",
                    marginBottom: "8px", lineHeight: 1.3,
                  }}>
                    {w.title || "제목 없음"}
                  </h2>

                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
                    fontSize: "14px", color: "rgba(255,255,255,0.4)",
                    lineHeight: 1.7,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}>
                    {w.content}
                  </p>

                  {w.mood && (
                    <p style={{
                      fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                      fontSize: "11px", color: "rgba(255,255,255,0.25)",
                      marginTop: "10px", letterSpacing: "0.04em",
                    }}>
                      #{w.mood}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
          {/* 로그아웃 */}
          <div className="fade-up text-center" style={{ marginTop: "60px", animationDelay: "0.3s" }}>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
              style={{
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "12px", letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.2)",
                background: "transparent", border: "none",
                cursor: "pointer", transition: "color 0.3s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Modal */}
        {selected && (
          <div
            onClick={() => setSelected(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 50,
              background: "rgba(3,1,10,0.88)",
              backdropFilter: "blur(14px)",
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
                borderRadius: "24px",
                padding: "40px 44px",
                maxWidth: "600px", width: "100%",
                maxHeight: "80vh", overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <p style={{
                    fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                    fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.25)", marginBottom: "8px",
                  }}>
                    {selected.genre ?? "—"}
                    {selected.floor && selected.unit ? ` · ${selected.floor}F ${selected.unit}호` : ""}
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
                color: "rgba(255,255,255,0.75)",
                whiteSpace: "pre-wrap",
              }}>
                {selected.content}
              </p>

              <div style={{
                marginTop: "32px", paddingTop: "20px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
                      fontSize: "12px", color: "rgba(255,255,255,0.3)",
                      letterSpacing: "0.06em",
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
    </AuthGuard>
  );
}