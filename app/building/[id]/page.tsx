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

type Slot = { floor: number; unit: number };

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
  const [allBuildings, setAllBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedWriting, setSelectedWriting] = useState<Writing | null>(null);
  const [movingWriting, setMovingWriting] = useState<Writing | null>(null);
  const [moveMode, setMoveMode] = useState<"same" | "other" | null>(null);
  const [emptySlots, setEmptySlots] = useState<Slot[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<Writing | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

    // 다른 건물 목록
    const { data: allB } = await supabase
      .from("buildings")
      .select("*")
      .order("created_at", { ascending: true });
    setAllBuildings(allB ?? []);

    setLoading(false);
  }

  // 같은 건물 빈 슬롯 계산
  function calcEmptySlots(b: Building, ws: Writing[], excludeWriting: Writing): Slot[] {
    const occupied = new Set(ws.map(w => `${w.floor}-${w.unit}`));
    occupied.delete(`${excludeWriting.floor}-${excludeWriting.unit}`);
    const slots: Slot[] = [];
    for (let floor = 1; floor <= b.floor_count; floor++) {
      for (let unit = 1; unit <= 2; unit++) {
        if (!occupied.has(`${floor}-${unit}`)) slots.push({ floor, unit });
      }
    }
    return slots;
  }

  // 이사 시작
  function startMove(writing: Writing) {
    setMovingWriting(writing);
    setMoveMode(null);
    setSelectedWriting(null);
  }

  // 같은 건물 내 이사
  function startSameMove(writing: Writing) {
    if (!building) return;
    const slots = calcEmptySlots(building, writings, writing);
    setEmptySlots(slots);
    setMoveMode("same");
  }

  // 슬롯 선택 → 이사 실행
  async function executeMove(slot: Slot) {
    if (!movingWriting) return;
    setActionLoading(true);
    const { error } = await supabase
      .from("writings")
      .update({ floor: slot.floor, unit: slot.unit })
      .eq("id", movingWriting.id);

    if (!error) {
      await fetchBuilding();
      setMovingWriting(null);
      setMoveMode(null);
    }
    setActionLoading(false);
  }

  // 다른 건물로 이사
  async function executeMoveToBuilding(targetBuildingId: string) {
    if (!movingWriting) return;
    setActionLoading(true);

    // 타겟 건물 빈 슬롯 찾기
    const { data: targetWritings } = await supabase
      .from("writings")
      .select("floor, unit")
      .eq("building_id", targetBuildingId);

    const { data: targetBuilding } = await supabase
      .from("buildings")
      .select("*")
      .eq("id", targetBuildingId)
      .single();

    if (!targetBuilding) { setActionLoading(false); return; }

    const occupied = new Set((targetWritings ?? []).map((w: any) => `${w.floor}-${w.unit}`));
    let targetSlot: Slot | null = null;

    for (let floor = 1; floor <= targetBuilding.floor_count; floor++) {
      for (let unit = 1; unit <= 2; unit++) {
        if (!occupied.has(`${floor}-${unit}`)) {
          targetSlot = { floor, unit };
          break;
        }
      }
      if (targetSlot) break;
    }

    if (!targetSlot) {
      alert("해당 건물에 빈 자리가 없습니다.");
      setActionLoading(false);
      return;
    }

    const { error } = await supabase
      .from("writings")
      .update({ building_id: targetBuildingId, floor: targetSlot.floor, unit: targetSlot.unit })
      .eq("id", movingWriting.id);

    if (!error) {
      await fetchBuilding();
      setMovingWriting(null);
      setMoveMode(null);
      router.push(`/building/${targetBuildingId}`);
    }
    setActionLoading(false);
  }

  // 삭제
  async function executeDelete(writing: Writing) {
    setActionLoading(true);
    const { error } = await supabase
      .from("writings")
      .delete()
      .eq("id", writing.id);

    if (!error) {
      await fetchBuilding();
      setConfirmDelete(null);
      setSelectedWriting(null);
    }
    setActionLoading(false);
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
        @keyframes modalIn {
          from { opacity:0; transform:translateY(20px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .fade-up  { animation: fadeUp 0.7s ease-out both; }
        .modal-in { animation: modalIn 0.45s ease-out both; }
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
          transform: translateX(3px);
        }
        .unit-empty {
          padding: 16px 20px;
          border: 1px dashed rgba(255,255,255,0.06);
          border-radius: 14px;
          background: transparent;
        }
        .slot-btn {
          padding: 10px 18px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-family: 'Crimson Pro', serif;
          font-weight: 200;
          font-size: 13px;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.3s;
        }
        .slot-btn:hover {
          border-color: rgba(255,255,255,0.35);
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.04);
        }
        .action-btn {
          font-family: 'Crimson Pro', serif;
          font-weight: 200;
          font-size: 12px;
          letter-spacing: 0.08em;
          padding: 7px 16px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          transition: all 0.3s;
        }
        .action-btn:hover {
          border-color: rgba(255,255,255,0.28);
          color: rgba(255,255,255,0.8);
        }
        .delete-btn {
          font-family: 'Crimson Pro', serif;
          font-weight: 200;
          font-size: 12px;
          letter-spacing: 0.08em;
          padding: 7px 16px;
          border-radius: 100px;
          border: 1px solid rgba(255,80,80,0.2);
          background: transparent;
          color: rgba(255,120,120,0.6);
          cursor: pointer;
          transition: all 0.3s;
        }
        .delete-btn:hover {
          border-color: rgba(255,80,80,0.45);
          color: rgba(255,120,120,0.9);
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
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
          color: "rgba(255,255,255,0.3)", marginBottom: "12px", animationDelay: "0.05s",
        }}>
          {GENRE_LABEL[building.genre] ?? building.genre}
        </p>

        <h1 className="fade-up" style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
          fontSize: "clamp(24px, 3.5vw, 40px)", lineHeight: 1.35,
          color: "rgba(255,255,255,0.88)", marginBottom: "8px", animationDelay: "0.1s",
        }}>
          {building.name ?? `${GENRE_LABEL[building.genre]} 1호`}
        </h1>

        <p className="fade-up" style={{
          fontFamily: "'Crimson Pro', serif", fontWeight: 200,
          fontSize: "13px", color: "rgba(255,255,255,0.28)",
          letterSpacing: "0.06em", marginBottom: "48px", animationDelay: "0.15s",
        }}>
          {writings.length}편의 글이 살고 있습니다
        </p>

        {/* Floor list */}
        <div className="space-y-6 fade-up" style={{ animationDelay: "0.2s" }}>
          {Array.from({ length: building.floor_count }).map((_, idx) => {
            const floor = building.floor_count - idx;
            const unit1 = writings.find(w => w.floor === floor && w.unit === 1);
            const unit2 = writings.find(w => w.floor === floor && w.unit === 2);

            return (
              <div key={floor}>
                <p style={{
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)", marginBottom: "8px",
                }}>
                  {floor}F
                </p>
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
                          fontSize: "11px", color: "rgba(255,255,255,0.08)",
                          marginTop: "4px",
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

      {/* ── 글 상세 모달 ── */}
      {selectedWriting && !movingWriting && !confirmDelete && (
        <div
          onClick={() => setSelectedWriting(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(3,1,10,0.85)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
          }}
        >
          <div
            className="modal-in"
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(15,8,30,0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px", padding: "40px 44px",
              maxWidth: "600px", width: "100%", maxHeight: "80vh", overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
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
              {selectedWriting.content}
            </p>

            <div style={{
              marginTop: "32px", paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: "12px",
            }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
                    fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em",
                  }}>
                    #{selectedWriting.mood}
                  </p>
                )}
              </div>

              {/* 이사 / 삭제 버튼 */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="action-btn" onClick={() => startMove(selectedWriting)}>
                  이사하기
                </button>
                <button className="delete-btn" onClick={() => {
                  setConfirmDelete(selectedWriting);
                  setSelectedWriting(null);
                }}>
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 이사 모드 선택 ── */}
      {movingWriting && !moveMode && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(3,1,10,0.88)", backdropFilter: "blur(14px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
          }}
        >
          <div className="modal-in" style={{
            background: "rgba(15,8,30,0.96)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px", padding: "40px 44px",
            maxWidth: "480px", width: "100%",
          }}>
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)", marginBottom: "12px",
            }}>
              이사하기
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "20px", color: "rgba(255,255,255,0.85)", marginBottom: "32px",
            }}>
              어디로 이사할까요?
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className="slot-btn" style={{ textAlign: "left", borderRadius: "14px", padding: "16px 20px" }}
                onClick={() => startSameMove(movingWriting)}
              >
                <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: "4px", fontSize: "14px" }}>같은 건물 안에서</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>이 건물의 다른 층/호로 이동</p>
              </button>
              <button className="slot-btn" style={{ textAlign: "left", borderRadius: "14px", padding: "16px 20px" }}
                onClick={() => setMoveMode("other")}
              >
                <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: "4px", fontSize: "14px" }}>다른 건물로</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>도시의 다른 건물로 이동</p>
              </button>
            </div>

            <button
              onClick={() => setMovingWriting(null)}
              style={{
                marginTop: "24px", background: "none", border: "none",
                cursor: "pointer", color: "rgba(255,255,255,0.25)",
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "12px", letterSpacing: "0.08em",
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* ── 같은 건물 빈 슬롯 선택 ── */}
      {movingWriting && moveMode === "same" && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(3,1,10,0.88)", backdropFilter: "blur(14px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
          }}
        >
          <div className="modal-in" style={{
            background: "rgba(15,8,30,0.96)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px", padding: "40px 44px",
            maxWidth: "480px", width: "100%",
          }}>
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)", marginBottom: "12px",
            }}>
              빈 자리 선택
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "20px", color: "rgba(255,255,255,0.85)", marginBottom: "28px",
            }}>
              어느 자리로 옮길까요?
            </h2>

            {emptySlots.length === 0 ? (
              <p style={{
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "13px", color: "rgba(255,255,255,0.3)",
              }}>
                이 건물에 빈 자리가 없습니다
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {emptySlots.map(slot => (
                  <button
                    key={`${slot.floor}-${slot.unit}`}
                    className="slot-btn"
                    disabled={actionLoading}
                    onClick={() => executeMove(slot)}
                  >
                    {slot.floor}F — {slot.unit}호
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setMoveMode(null)}
              style={{
                marginTop: "24px", background: "none", border: "none",
                cursor: "pointer", color: "rgba(255,255,255,0.25)",
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "12px", letterSpacing: "0.08em",
              }}
            >
              ← 뒤로
            </button>
          </div>
        </div>
      )}

      {/* ── 다른 건물 선택 ── */}
      {movingWriting && moveMode === "other" && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(3,1,10,0.88)", backdropFilter: "blur(14px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
          }}
        >
          <div className="modal-in" style={{
            background: "rgba(15,8,30,0.96)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px", padding: "40px 44px",
            maxWidth: "480px", width: "100%",
          }}>
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)", marginBottom: "12px",
            }}>
              건물 선택
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "20px", color: "rgba(255,255,255,0.85)", marginBottom: "28px",
            }}>
              어느 건물로 이사할까요?
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {allBuildings.filter(b => b.id !== id).map(b => (
                <button
                  key={b.id}
                  className="slot-btn"
                  style={{ textAlign: "left", borderRadius: "14px", padding: "14px 20px" }}
                  disabled={actionLoading}
                  onClick={() => executeMoveToBuilding(b.id)}
                >
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", marginBottom: "2px" }}>
                    {b.name ?? GENRE_LABEL[b.genre]}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                    {GENRE_LABEL[b.genre] ?? b.genre} · {b.floor_count}층
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setMoveMode(null)}
              style={{
                marginTop: "24px", background: "none", border: "none",
                cursor: "pointer", color: "rgba(255,255,255,0.25)",
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "12px", letterSpacing: "0.08em",
              }}
            >
              ← 뒤로
            </button>
          </div>
        </div>
      )}

      {/* ── 삭제 확인 ── */}
      {confirmDelete && (
        <div
          onClick={() => setConfirmDelete(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(3,1,10,0.88)", backdropFilter: "blur(14px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
          }}
        >
          <div
            className="modal-in"
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(15,8,30,0.96)",
              border: "1px solid rgba(255,80,80,0.15)",
              borderRadius: "24px", padding: "40px 44px",
              maxWidth: "420px", width: "100%",
            }}
          >
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "22px", color: "rgba(255,255,255,0.85)", marginBottom: "12px",
            }}>
              정말 삭제할까요?
            </h2>
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "13px", color: "rgba(255,255,255,0.35)",
              lineHeight: 1.7, marginBottom: "32px",
            }}>
              "{confirmDelete.title || "제목 없음"}"이 도시에서 사라집니다.<br />
              이 창문의 불도 꺼집니다.
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                className="action-btn"
                onClick={() => setConfirmDelete(null)}
              >
                취소
              </button>
              <button
                className="delete-btn"
                disabled={actionLoading}
                onClick={() => executeDelete(confirmDelete)}
              >
                {actionLoading ? "삭제 중..." : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}