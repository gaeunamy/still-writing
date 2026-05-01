"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Writing = {
  id: string;
  title: string | null;
  content: string;
  floor: number;
  unit: number;
  mood: string | null;
  emotion_color: string | null;
  is_public: boolean;
  created_at: string;
};

type Building = {
  id: string;
  genre: string;
  name: string | null;
  floor_count: number;
  unit_per_floor: number;
};

const GENRE_LABEL: Record<string, string> = {
  시: "시집",
  소설: "소설관",
  일기: "일기탑",
};

export default function BuildingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [building, setBuilding] = useState<Building | null>(null);
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWriting, setSelectedWriting] = useState<Writing | null>(null);

  useEffect(() => {
    if (id) fetchBuilding();
  }, [id]);

  async function fetchBuilding() {
    setLoading(true);

    const { data: bData } = await supabase
      .from("buildings")
      .select("*")
      .eq("id", id)
      .single();

    if (!bData) { router.push("/city"); return; }
    setBuilding(bData);

    const { data: wData } = await supabase
      .from("writings")
      .select("id, title, content, floor, unit, mood, emotion_color, is_public, created_at")
      .eq("building_id", id)
      .order("floor", { ascending: false });

    setWritings(wData ?? []);
    setLoading(false);
  }

  if (loading) return (
    <main style={{ background: "#03010a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "'Crimson Pro', serif", fontWeight: 200, fontSize: "14px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
        건물로 들어가는 중...
      </p>
    </main>
  );

  if (!building) return null;

  return (
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
        @keyframes slideIn {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes modalIn {
          from { opacity:0; transform:translateY(24px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .fade-up  { animation: fadeUp  0.7s ease-out both; }
        .slide-in { animation: slideIn 0.5s ease-out both; }
        .modal-in { animation: modalIn 0.5s ease-out both; }

        .unit-card {
          padding: 16px 20px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          background: rgba(255,255,255,0.02);
          cursor: pointer;
          transition: all 0.35s ease;
          text-align: left;
          width: 100%;
        }
        .unit-card:hover {
          border-color: rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.04);
          transform: translateX(4px);
        }
        .unit-empty {
          padding: 16px 20px;
          border: 1px dashed rgba(255,255,255,0.06);
          border-radius: 14px;
          background: transparent;
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

        {/* Header */}
        <p className="fade-up" style={{
          fontFamily: "'Crimson Pro', serif", fontWeight: 200,
          fontSize: "11px", letterSpacing: "0.42em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)", marginBottom: "12px",
          animationDelay: "0.05s",
        }}>
          {GENRE_LABEL[building.genre] ?? building.genre}
        </p>

        <h1 className="fade-up" style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
          fontSize: "clamp(24px, 3.5vw, 40px)", lineHeight: 1.35,
          color: "rgba(255,255,255,0.88)", marginBottom: "8px",
          animationDelay: "0.1s",
        }}>
          {building.name ?? `${GENRE_LABEL[building.genre]} 1호`}
        </h1>

        <p className="fade-up" style={{
          fontFamily: "'Crimson Pro', serif", fontWeight: 200,
          fontSize: "13px", color: "rgba(255,255,255,0.28)",
          letterSpacing: "0.06em", marginBottom: "48px",
          animationDelay: "0.15s",
        }}>
          {writings.length}편의 글이 살고 있습니다
        </p>

        {/* Floor list — top floor first */}
        <div className="space-y-3 fade-up" style={{ animationDelay: "0.2s" }}>
          {Array.from({ length: building.floor_count }).map((_, idx) => {
            const floor = building.floor_count - idx;
            const unit1 = writings.find(w => w.floor === floor && w.unit === 1);
            const unit2 = writings.find(w => w.floor === floor && w.unit === 2);

            return (
              <div key={floor}>
                {/* Floor label */}
                <p style={{
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)", marginBottom: "8px",
                }}>
                  {floor}F
                </p>

                {/* Two units per floor */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[unit1, unit2].map((writing, ui) => {
                    const unit = ui + 1;
                    return writing ? (
                      <button
                        key={writing.id}
                        className="unit-card"
                        onClick={() => setSelectedWriting(writing)}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <div style={{
                            width: "6px", height: "6px", borderRadius: "50%",
                            background: writing.emotion_color ?? "#e0d0b0",
                            boxShadow: `0 0 6px ${writing.emotion_color ?? "#e0d0b0"}`,
                            flexShrink: 0,
                          }} />
                          <p style={{
                            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                            fontSize: "10px", letterSpacing: "0.2em",
                            color: "rgba(255,255,255,0.25)",
                          }}>
                            {floor}F — {unit}호
                          </p>
                        </div>
                        <p style={{
                          fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
                          fontSize: "15px", color: "rgba(255,255,255,0.78)",
                          lineHeight: 1.4,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}>
                          {writing.title || "제목 없음"}
                        </p>
                        {writing.mood && (
                          <p style={{
                            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                            fontSize: "11px", color: "rgba(255,255,255,0.28)",
                            marginTop: "6px", letterSpacing: "0.04em",
                          }}>
                            #{writing.mood}
                          </p>
                        )}
                      </button>
                    ) : (
                      <div key={`empty-${unit}`} className="unit-empty">
                        <p style={{
                          fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                          fontSize: "11px", color: "rgba(255,255,255,0.12)",
                          letterSpacing: "0.08em",
                        }}>
                          {floor}F — {unit}호
                        </p>
                        <p style={{
                          fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                          fontSize: "11px", color: "rgba(255,255,255,0.1)",
                          marginTop: "6px",
                        }}>
                          비어있음
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Writing modal */}
      {selectedWriting && (
        <div
          onClick={() => setSelectedWriting(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(3,1,10,0.85)",
            backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="modal-in"
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(15,8,30,0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px",
              padding: "40px 44px",
              maxWidth: "600px", width: "100%",
              maxHeight: "80vh", overflowY: "auto",
            }}
          >
            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
              <div>
                <p style={{
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.25)", marginBottom: "8px",
                }}>
                  {selectedWriting.floor}F — {selectedWriting.unit}호
                </p>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
                  fontSize: "22px", color: "rgba(255,255,255,0.88)",
                }}>
                  {selectedWriting.title || "제목 없음"}
                </h2>
              </div>
              <button
                onClick={() => setSelectedWriting(null)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.3)", fontSize: "20px",
                  lineHeight: 1, padding: "4px",
                  transition: "color 0.3s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
              >
                ×
              </button>
            </div>

            {/* Divider */}
            <div style={{
              height: "1px",
              background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)",
              marginBottom: "28px",
            }} />

            {/* Content */}
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "17px", lineHeight: 1.95,
              color: "rgba(255,255,255,0.75)",
              whiteSpace: "pre-wrap",
            }}>
              {selectedWriting.content}
            </p>

            {/* Footer */}
            <div style={{
              marginTop: "32px", paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {selectedWriting.emotion_color && (
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: selectedWriting.emotion_color,
                    boxShadow: `0 0 8px ${selectedWriting.emotion_color}`,
                  }} />
                )}
                {selectedWriting.mood && (
                  <p style={{
                    fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                    fontSize: "12px", color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.06em",
                  }}>
                    #{selectedWriting.mood}
                  </p>
                )}
              </div>
              <p style={{
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "11px", color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.04em",
              }}>
                {new Date(selectedWriting.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}