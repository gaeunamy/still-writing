"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type WritingSetup = {
  genre: string;
  mood: string;
  speaker: string;
  image: string;
  view: string;
  setting: string;
  ending: string;
  length: string;
};

type SaveMode = "public" | "private" | "future" | null;

const MOOD_COLORS: Record<string, string> = {
  고요한: "#a8c4e0",
  쓸쓸한: "#b0a8c8",
  몽환적인: "#c8a8d8",
  따뜻한: "#e0c8a0",
  기쁜: "#e0d8a0",
  우울한: "#909ab0",
  차분한: "#a0b8b0",
};

const FLOORS_PER_BUILDING = 6;
const UNITS_PER_FLOOR = 2;

async function assignBuildingSlot(genre: string): Promise<{
  buildingId: string;
  floor: number;
  unit: number;
  isNew: boolean;
}> {
  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, floor_count, unit_per_floor")
    .eq("genre", genre)
    .order("created_at", { ascending: true });

  for (const building of buildings ?? []) {
    const { data: writings } = await supabase
      .from("writings")
      .select("floor, unit")
      .eq("building_id", building.id);

    const occupied = new Set((writings ?? []).map((w) => `${w.floor}-${w.unit}`));

    const empty: { floor: number; unit: number }[] = [];
    for (let floor = 1; floor <= building.floor_count; floor++) {
      for (let unit = 1; unit <= UNITS_PER_FLOOR; unit++) {
        if (!occupied.has(`${floor}-${unit}`)) {
          empty.push({ floor, unit });
        }
      }
    }
    if (empty.length > 0) {
      const pick = empty[Math.floor(Math.random() * empty.length)];
      return { buildingId: building.id, floor: pick.floor, unit: pick.unit, isNew: false };
    }
  }

  // 빈 슬롯 없음 → 새 건물 생성
const genreNames: Record<string, string> = { 시: "시집", 소설: "소설관", 일기: "일기탑" };
  const count = (buildings ?? []).length;
  const name = `${genreNames[genre] ?? genre} ${count + 1}호`;

  const randomFloors = Math.floor(Math.random() * 5) + 4; // 4~8층 랜덤

  const { data: newBuilding, error } = await supabase
    .from("buildings")
    .insert({ genre, name, floor_count: randomFloors, unit_per_floor: UNITS_PER_FLOOR })
    .select()
    .single();

  if (error || !newBuilding) throw new Error("건물 생성 실패");

  // 새 건물 1층도 랜덤 유닛
  const firstUnit = Math.random() < 0.5 ? 1 : 2;
  return { buildingId: newBuilding.id, floor: 1, unit: firstUnit, isNew: true };
}

export default function EditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<SaveMode>(null);
  const [saved, setSaved] = useState(false);
  const [isNewBuilding, setIsNewBuilding] = useState(false);

  const [setup, setSetup] = useState<WritingSetup>({
    genre: "", mood: "", speaker: "", image: "",
    view: "", setting: "", ending: "", length: "",
  });

  useEffect(() => {
    const s = localStorage.getItem("writingSetup");
    if (s) setSetup(JSON.parse(s));
    const genre = localStorage.getItem("selectedGenre");
    if (!genre) router.push("/start");
    else setSetup((prev) => ({ ...prev, genre: prev.genre || genre }));
  }, []);

  const moodColor = MOOD_COLORS[setup.mood] ?? "#a0a8b8";

  const handleGenerate = async () => {
    if (!setup.genre) return;
    setLoading(true);
    let prompt = "";
    if (setup.genre === "시") {
      prompt = `${setup.mood || "고요한"} 정서, ${setup.speaker || "나"} 화자, ${setup.image || "밤"} 이미지, ${setup.length || "적당히"} 분량으로 감성적인 시의 첫 문장을 제안해주세요. 직접 이어 쓸 수 있도록 여운을 남겨주세요.`;
    } else if (setup.genre === "소설") {
      prompt = `${setup.view || "1인칭"} 시점, ${setup.setting || "도시"} 배경, ${setup.ending || "열린 결말"} 분위기로 독자가 몰입할 수 있는 소설의 첫 장면을 제안해주세요.`;
    } else {
      prompt = `${setup.mood || "차분한"} 감정으로 오늘의 일기 첫 문장을 제안해주세요. 솔직하고 여운 있게.`;
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.result) setContent((prev) => prev ? prev + "\n\n" + data.result : data.result);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async (mode: SaveMode) => {
    if (!content.trim()) return;
    setSaving(true);
    setSaveMode(mode);

    try {
      const genre = setup.genre || "일기";
      const { buildingId, floor, unit, isNew } = await assignBuildingSlot(genre);
      setIsNewBuilding(isNew);

      const { error } = await supabase.from("writings").insert({
        title: title || null,
        content,
        genre,
        mood: setup.mood || null,
        is_public: mode === "public",
        emotion_color: moodColor,
        building_id: buildingId,
        floor,
        unit,
      });

      if (error) {
        console.error("Supabase insert error:", JSON.stringify(error));
        throw error;
      }

      const local = JSON.parse(localStorage.getItem("savedWritings") || "[]");
      localStorage.setItem("savedWritings", JSON.stringify([
        { id: Date.now(), title, content, createdAt: new Date().toISOString(), mode },
        ...local,
      ]));

      setSaved(true);
      setTimeout(() => router.push("/city"), 2400);
    } catch (e) {
      console.error("Save error:", e);
      alert("저장 중 오류가 발생했습니다.");
      setSaving(false);
      setSaveMode(null);
    }
  };

  return (
    <main
      className="min-h-screen text-white px-6 py-14 transition-all duration-1000"
      style={{
        background: `radial-gradient(ellipse at 65% 0%, ${moodColor}15 0%, transparent 55%), linear-gradient(180deg, #03010a 0%, #0a0520 100%)`,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Crimson+Pro:wght@200;300&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes paperIn { from{opacity:0;transform:scaleY(0.97) translateY(10px)} to{opacity:1;transform:scaleY(1) translateY(0)} }
        @keyframes savePublic  { 0%{opacity:1;transform:scale(1) translateY(0)} 100%{opacity:0;transform:scale(0.98) translateY(-24px)} }
        @keyframes savePrivate { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(32px)} }
        @keyframes saveFuture  { 0%{opacity:1;transform:translateY(0) rotate(0deg)} 100%{opacity:0;transform:translateY(-70px) rotate(-10deg)} }
        @keyframes lampPulse   { 0%,100%{box-shadow:0 0 10px 2px rgba(255,215,100,0.18)} 50%{box-shadow:0 0 22px 5px rgba(255,215,100,0.36)} }
        .page-in  { animation: fadeIn  0.8s ease-out both; }
        .paper-in { animation: paperIn 0.85s 0.2s ease-out both; }
        .lamp-btn { animation: lampPulse 3s ease-in-out infinite; }
        .save-public  { animation: savePublic  2.2s ease-in-out forwards; }
        .save-private { animation: savePrivate 2.2s ease-in-out forwards; }
        .save-future  { animation: saveFuture  2.2s ease-in-out forwards; }
        textarea {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 300; line-height: 1.95;
          caret-color: ${moodColor};
        }
        textarea::placeholder { color: rgba(255,255,255,0.18); }
        textarea:focus { outline: none; }
        .save-btn {
          font-family: 'Crimson Pro', serif; font-weight: 200;
          font-size: 13.5px; letter-spacing: 0.07em;
          padding: 10px 22px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.11);
          background: transparent; color: rgba(255,255,255,0.6);
          cursor: pointer; transition: all 0.4s ease; white-space: nowrap;
        }
        .save-btn:hover { border-color:rgba(255,255,255,0.32); color:rgba(255,255,255,0.92); background:rgba(255,255,255,0.03); }
        .save-btn:disabled { opacity:0.4; cursor:default; }
      `}</style>

      <div className="page-in max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push("/city")}
            style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "11px", letterSpacing: "0.38em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)", background: "none", border: "none",
              cursor: "pointer", transition: "color 0.3s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
          >
            ← 도시로
          </button>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="lamp-btn"
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 18px", borderRadius: "100px",
              border: `1px solid ${moodColor}35`,
              background: `${moodColor}0a`,
              color: moodColor,
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "13px", letterSpacing: "0.06em",
              cursor: loading ? "default" : "pointer",
              transition: "all 0.4s",
            }}
          >
            <span>🕯</span>
            {loading ? "생각 중..." : "AI 도움 받기"}
          </button>
        </div>

        {/* Paper */}
        <div
          className={`paper-in ${saved ? `save-${saveMode}` : ""}`}
          style={{
            background: "rgba(255,255,255,0.028)",
            border: "1px solid rgba(255,255,255,0.065)",
            borderRadius: "22px", padding: "38px 42px",
            backdropFilter: "blur(10px)",
          }}
        >
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%", background: "transparent", border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              paddingBottom: "14px", marginBottom: "26px",
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "24px", color: "rgba(255,255,255,0.82)", outline: "none",
            }}
          />
          <textarea
            placeholder="오늘은 어떤 문장을 쓰고 싶나요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%", minHeight: "380px",
              background: "transparent", border: "none",
              color: "rgba(255,255,255,0.8)", resize: "none",
            }}
          />
        </div>

        {/* Mood dot */}
        <div className="flex items-center gap-2 mt-5 mb-7">
          <div style={{
            width: "5px", height: "5px", borderRadius: "50%",
            background: moodColor, boxShadow: `0 0 7px ${moodColor}`,
          }} />
          <p style={{
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "12px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em",
          }}>
            {setup.genre && `${setup.genre} · `}
            {setup.mood ? `${setup.mood} 감정` : "감정 설정 없음"}
          </p>
        </div>

        {/* Save buttons */}
        {!saved && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "9px", justifyContent: "center" }}>
            <button className="save-btn" onClick={() => handleSave("public")} disabled={saving}>
              🌙 도시의 창문에 불 켜기
            </button>
            <button className="save-btn" onClick={() => handleSave("private")} disabled={saving}>
              🔒 혼자 간직하기
            </button>
            <button className="save-btn" onClick={() => handleSave("future")} disabled={saving}>
              ✉️ 미래의 나에게
            </button>
          </div>
        )}

        {/* Save feedback */}
        {saved && (
          <p style={{
            textAlign: "center",
            fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
            fontWeight: 300, fontSize: "17px",
            color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em", marginTop: "8px",
          }}>
            {isNewBuilding
              ? "새 건물이 도시에 솟아올랐습니다."
              : saveMode === "public" ? "당신의 창문에 불이 켜졌습니다."
              : saveMode === "private" ? "서랍 속에 조용히 간직되었습니다."
              : "밤하늘 어딘가로 날아갔습니다."}
          </p>
        )}
      </div>
    </main>
  );
}