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

const CHAR_LIMITS: Record<string, number> = {
  짧게: 200,
  적당히: 500,
  길게: 1500,
};

const FLOORS_PER_BUILDING = 6;
const UNITS_PER_FLOOR = 2;

async function assignBuildingSlot(genre: string, userId: string | null, forceNew = false): Promise<{
  buildingId: string;
  floor: number;
  unit: number;
  isNew: boolean;
}> {
  const latestBuildingId = localStorage.getItem(`latestBuilding_${genre}`);
  console.log("🏢 latestBuildingId:", latestBuildingId);
  
  // 최근 건물이 있고 새 건물을 강제로 만드는 것이 아니면 먼저 확인
  if (latestBuildingId && !forceNew) {
    const { data: latestBuilding } = await supabase
      .from("buildings")
      .select("id, floor_count, unit_per_floor")
      .eq("id", latestBuildingId)
      .single();

    console.log("🏢 latestBuilding found:", latestBuilding);

    if (latestBuilding) {
      const { data: writings } = await supabase
        .from("writings")
        .select("floor, unit")
        .eq("building_id", latestBuilding.id);

      const occupied = new Set((writings ?? []).map((w) => `${w.floor}-${w.unit}`));
      const empty: { floor: number; unit: number }[] = [];

      for (let floor = 1; floor <= latestBuilding.floor_count; floor++) {
        for (let unit = 1; unit <= UNITS_PER_FLOOR; unit++) {
          if (!occupied.has(`${floor}-${unit}`)) empty.push({ floor, unit });
        }
      }

      console.log("🏢 empty slots in latest building:", empty);

      if (empty.length > 0) {
        const pick = empty[Math.floor(Math.random() * empty.length)];
        console.log("✅ Assigned to latest building:", pick);
        return { buildingId: latestBuilding.id, floor: pick.floor, unit: pick.unit, isNew: false };
      }
    }
  }

  // 기존 건물들 확인
  const { data: buildings } = await supabase
    .from("buildings")
    .select("id, floor_count, unit_per_floor")
    .eq("genre", genre)
    .eq("user_id", userId ?? "")
    .order("created_at", { ascending: true });

  if (!forceNew) {
    for (const building of buildings ?? []) {
      const { data: writings } = await supabase
        .from("writings")
        .select("floor, unit")
        .eq("building_id", building.id);

      const occupied = new Set((writings ?? []).map((w) => `${w.floor}-${w.unit}`));
      const empty: { floor: number; unit: number }[] = [];

      for (let floor = 1; floor <= building.floor_count; floor++) {
        for (let unit = 1; unit <= UNITS_PER_FLOOR; unit++) {
          if (!occupied.has(`${floor}-${unit}`)) empty.push({ floor, unit });
        }
      }

      if (empty.length > 0) {
        const pick = empty[Math.floor(Math.random() * empty.length)];
        return { buildingId: building.id, floor: pick.floor, unit: pick.unit, isNew: false };
      }
    }
  }

  // 새 건물 생성
  const genreNames: Record<string, string> = { 시: "시집", 소설: "소설관", 일기: "일기탑" };
  const count = (buildings ?? []).length;
  const name = `${genreNames[genre] ?? genre} ${count + 1}호`;
  const randomFloors = Math.floor(Math.random() * 5) + 4;

  const { data: newBuilding, error } = await supabase
    .from("buildings")
    .insert({ genre, name, floor_count: randomFloors, unit_per_floor: UNITS_PER_FLOOR, user_id: userId })
    .select()
    .single();

  if (error || !newBuilding) throw new Error("건물 생성 실패");

  // 새 건물을 만들면 바로 localStorage에 저장
  localStorage.setItem(`latestBuilding_${genre}`, newBuilding.id);
  console.log("✅ New building created and saved:", newBuilding.id);

  const firstUnit = Math.random() < 0.5 ? 1 : 2;
  return { buildingId: newBuilding.id, floor: 1, unit: firstUnit, isNew: true };
}

const DATE_PRESETS = [
  { label: "1주 후", days: 7 },
  { label: "1달 후", days: 30 },
  { label: "3달 후", days: 90 },
  { label: "6달 후", days: 180 },
  { label: "1년 후", days: 365 },
];

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
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

  // 날짜 모달
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  // 제목 모달
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [pendingSaveMode, setPendingSaveMode] = useState<SaveMode>(null);

  // 건물 모달
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [pendingSave, setPendingSave] = useState<{ mode: SaveMode; openAt?: string } | null>(null);
  const [genreCount, setGenreCount] = useState(0);

  // AI
  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiMode, setAiMode] = useState<"first" | "next" | "full" | null>(null);

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

    // 페이지 로드 시 최신 건물 ID를 localStorage에 초기화
    if (genre) {
      const initLatestBuilding = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: latestBuilding } = await supabase
          .from("buildings")
          .select("id")
          .eq("genre", genre)
          .eq("user_id", user?.id ?? "")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (latestBuilding?.id) {
          localStorage.setItem(`latestBuilding_${genre}`, latestBuilding.id);
          console.log("✅ Latest building initialized:", latestBuilding.id);
        }
      };
      initLatestBuilding();
    }
  }, []);

  const moodColor = MOOD_COLORS[setup.mood] ?? "#a0a8b8";
  const charLimit = CHAR_LIMITS[setup.length] ?? 500;

  const handleGenerate = async (mode: "first" | "next" | "full") => {
    if (!setup.genre) return;
    setAiMode(mode);
    setLoading(true);

    const lengthGuide: Record<string, string> = {
      짧게: "100자 이내로",
      적당히: "200자 내외로",
      길게: "400자 내외로",
    };
    const lengthText = lengthGuide[setup.length] || "200자 내외로";

    let prompt = "";

if (mode === "first") {
      if (setup.genre === "시") {
        prompt = `${setup.speaker || "나"} 화자, ${setup.image || "밤"} 이미지를 담아 감성적인 시를 ${lengthText} 제안해주세요. 직접 이어 쓸 수 있도록 여운을 남겨주세요. 반드시 1~2문장만 써주세요.`;
      } else if (setup.genre === "소설") {
        prompt = `${setup.view || "1인칭"} 시점, ${setup.setting || "도시"} 배경, ${setup.ending || "열린 결말"} 분위기로 독자가 몰입할 수 있는 소설의 첫 장면을 ${lengthText} 제안해주세요. 반드시 1~2문장만 써주세요.`;
      } else {
        prompt = `오늘 하루를 돌아볼 수 있는 일기 시작 질문 1개만 던져주세요. 짧고 구체적으로, 질문만 써주세요.`;
      }
    } else if (mode === "next") {
      const currentText = content.trim() || "아직 쓴 내용이 없습니다.";
      if (setup.genre === "시") {
        prompt = `다음은 지금까지 쓴 시입니다:\n\n"${currentText}"\n\n이 흐름에 자연스럽게 이어지는 다음 문장을 ${lengthText} 제안해주세요. 같은 이미지와 감정을 유지해주세요.`;
      } else if (setup.genre === "소설") {
        prompt = `다음은 지금까지 쓴 소설입니다:\n\n"${currentText}"\n\n이 장면에서 자연스럽게 이어지는 다음 문장을 ${lengthText} 제안해주세요. 같은 시점과 분위기를 유지해주세요.`;
      } else {
        prompt = `다음은 지금까지 쓴 일기입니다:\n\n"${currentText}"\n\n이 내용을 읽고 더 깊이 들어갈 수 있는 질문 1개만 던져주세요. 질문만 써주세요.`;
      }
    } else if (mode === "full") {
      const titleHint = title ? `제목: "${title}"\n` : "";
      const contentHint = content.trim() ? `지금까지 쓴 내용:\n"${content.trim()}"\n\n이 내용을 바탕으로 ` : "";
      if (setup.genre === "시") {
        prompt = `${titleHint}${contentHint}${setup.speaker || "나"} 화자, ${setup.image || "밤"} 이미지를 담아 완성된 시 한 편을 ${lengthText} 써주세요.`;
      } else if (setup.genre === "소설") {
        prompt = `${titleHint}${contentHint}${setup.view || "1인칭"} 시점, ${setup.setting || "도시"} 배경, ${setup.ending || "열린 결말"} 분위기의 소설 한 편을 ${lengthText} 써주세요.`;
      } else {
        prompt = `${titleHint}${contentHint}오늘 하루를 돌아볼 수 있는 일기 작성용 질문 4~5개를 만들어주세요. 번호 없이 · 기호로 시작하게 써주세요. 질문만 써주세요.`;
      }
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, length: setup.length || "적당히", mode }),
      });
      const data = await res.json();
      if (data.result) {
        if (mode === "full") {
          setContent(data.result);
        } else {
          setContent((prev) => prev ? prev + "\n\n" + data.result : data.result);
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
    setAiMode(null);
    setAiExpanded(false);
  };

  const handleSave = async (mode: SaveMode, openAt?: string, forceNew = false) => {
    if (!content.trim()) return;

    // 1. 제목 없으면 모달
    if (!title.trim() && !showTitleModal && pendingSaveMode === null) {
      setPendingSaveMode(mode);
      setShowTitleModal(true);
      return;
    }

    // 2. 미래의 나에게 — 날짜 선택
    if (mode === "future" && !openAt) {
      setSaveMode("future");
      setShowDatePicker(true);
      return;
    }

    // 3. 6편 체크
    if (mode !== "future" && !forceNew && pendingSave === null) {
      const { data: { user } } = await supabase.auth.getUser();
      const { count } = await supabase
        .from("writings")
        .select("id", { count: "exact", head: true })
        .eq("genre", setup.genre || "일기")
        .eq("user_id", user?.id ?? "")
        .is("open_at", null);

      const currentCount = (count ?? 0) + 1;
      if (currentCount % 6 === 0) {
        setGenreCount(currentCount);
        setPendingSave({ mode, openAt });
        setShowBuildModal(true);
        return;
      }
    }

    setSaving(true);
    setSaveMode(mode);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 비동기 타이밍 이슈 방지를 위해 최종 저장 제목 가공 처리
      const finalTitle = title.trim() || "[無題]";

      // AI가 글의 mood를 분석
      let analyzedMood = setup.mood || null;
      let analyzedColor = moodColor;

      if (content.trim()) {
        try {
          const moodRes = await fetch("/api/analyze-mood", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: content.trim(), genre: setup.genre || "일기" }),
          });
          const moodData = await moodRes.json();
          if (moodData.mood && moodData.color) {
            analyzedMood = moodData.mood;
            analyzedColor = moodData.color;
            console.log("✨ AI analyzed mood:", analyzedMood, "color:", analyzedColor);
          }
        } catch (e) {
          console.error("Mood analysis failed, using setup mood:", e);
          // 분석 실패 시 setup mood 사용
        }
      }

      if (mode === "future") {
        const { error } = await supabase.from("writings").insert({
          title: finalTitle,
          content,
          genre: setup.genre || "일기",
          mood: analyzedMood,
          is_public: false,
          emotion_color: analyzedColor,
          open_at: openAt ? new Date(openAt).toISOString() : null,
          user_id: user?.id ?? null,
        });
        if (error) { console.error("Supabase insert error:", JSON.stringify(error)); throw error; }
      } else {
        const genre = setup.genre || "일기";
        const { buildingId, floor, unit, isNew } = await assignBuildingSlot(genre, user?.id ?? null, forceNew);
        setIsNewBuilding(isNew);

        // assignBuildingSlot 함수 내에서 이미 localStorage에 저장되므로 중복 저장 제거

        const { error } = await supabase.from("writings").insert({
          title: finalTitle,
          content,
          genre,
          mood: analyzedMood,
          is_public: mode === "public",
          emotion_color: analyzedColor,
          building_id: buildingId,
          floor,
          unit,
          user_id: user?.id ?? null,
        });
        if (error) { console.error("Supabase insert error:", JSON.stringify(error)); throw error; }
      }

      const local = JSON.parse(localStorage.getItem("savedWritings") || "[]");
      localStorage.setItem("savedWritings", JSON.stringify([
        { id: Date.now(), title: finalTitle, content, createdAt: new Date().toISOString(), mode },
        ...local,
      ]));

      setSaved(true);
      setPendingSave(null);
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
        @keyframes savePublic  { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0.98) translateY(-24px)} }
        @keyframes savePrivate { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(32px)} }
        @keyframes saveFuture  { 0%{opacity:1;transform:translateY(0) rotate(0deg)} 100%{opacity:0;transform:translateY(-70px) rotate(-10deg)} }
        @keyframes lampPulse   { 0%,100%{box-shadow:0 0 10px 2px rgba(255,215,100,0.18)} 50%{box-shadow:0 0 22px 5px rgba(255,215,100,0.36)} }
        @keyframes modalIn { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        .page-in  { animation: fadeIn  0.8s ease-out both; }
        .paper-in { animation: paperIn 0.85s 0.2s ease-out both; }
        .lamp-btn { animation: lampPulse 3s ease-in-out infinite; }
        .save-public  { animation: savePublic  2.2s ease-in-out forwards; }
        .save-private { animation: savePrivate 2.2s ease-in-out forwards; }
        .save-future  { animation: saveFuture  2.2s ease-in-out forwards; }
        .modal-in { animation: modalIn 0.45s ease-out both; }
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
        .date-preset {
          font-family: 'Crimson Pro', serif; font-weight: 200;
          font-size: 13px; letter-spacing: 0.06em;
          padding: 9px 20px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent; color: rgba(255,255,255,0.55);
          cursor: pointer; transition: all 0.3s;
        }
        .date-preset:hover { border-color:rgba(255,255,255,0.32); color:rgba(255,255,255,0.9); }
        .date-preset-active {
          border-color: rgba(255,255,255,0.6) !important;
          background: rgba(255,255,255,0.06) !important;
          color: rgba(255,255,255,0.95) !important;
        }
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

          {/* AI 버튼 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {!aiExpanded ? (
              <button
                onClick={() => setAiExpanded(true)}
                className="lamp-btn"
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 18px", borderRadius: "100px",
                  border: `1px solid ${moodColor}35`,
                  background: `${moodColor}0a`,
                  color: moodColor,
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "13px", letterSpacing: "0.06em",
                  cursor: "pointer", transition: "all 0.4s",
                }}
              >
                <span>🕯</span>
                AI 도움 받기
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px", marginRight: "2px" }}>🕯</span>
                {(["first", "next", "full"] as const).map((mode) => {
                  const labels = { first: "첫 문장", next: "다음 문장", full: "전체" };
                  const isLoading = loading && aiMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => handleGenerate(mode)}
                      disabled={loading}
                      style={{
                        padding: "7px 14px", borderRadius: "100px",
                        border: `1px solid ${moodColor}${isLoading ? "60" : "35"}`,
                        background: isLoading ? `${moodColor}18` : `${moodColor}0a`,
                        color: isLoading ? moodColor : `${moodColor}cc`,
                        fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                        fontSize: "12px", letterSpacing: "0.05em",
                        cursor: loading ? "default" : "pointer",
                        transition: "all 0.3s",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={e => {
                        if (!loading) {
                          e.currentTarget.style.background = `${moodColor}18`;
                          e.currentTarget.style.color = moodColor;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!loading) {
                          e.currentTarget.style.background = `${moodColor}0a`;
                          e.currentTarget.style.color = `${moodColor}cc`;
                        }
                      }}
                    >
                      {isLoading ? "생각 중..." : labels[mode]}
                    </button>
                  );
                })}
                <button
                  onClick={() => setAiExpanded(false)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.25)", fontSize: "16px",
                    lineHeight: 1, padding: "4px", transition: "color 0.3s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                >
                  ×
                </button>
              </div>
            )}
          </div>
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
            maxLength={charLimit}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%", minHeight: "380px",
              background: "transparent", border: "none",
              color: "rgba(255,255,255,0.8)", resize: "none",
            }}
          />
          <p style={{
            textAlign: "right", marginTop: "8px",
            fontFamily: "'Crimson Pro', serif", fontWeight: 200,
            fontSize: "12px", letterSpacing: "0.04em",
            color: content.length >= charLimit ? "rgba(255,120,120,0.7)" : "rgba(255,255,255,0.2)",
          }}>
            {content.length} / {charLimit}
          </p>
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
              : "우체국에 편지를 맡겼습니다."}
          </p>
        )}
      </div>

      {/* ── 제목 모달 ── */}
      {showTitleModal && (
        <div
          onClick={() => setShowTitleModal(false)}
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
              maxWidth: "420px", width: "100%",
            }}
          >
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "22px", color: "rgba(255,255,255,0.88)", marginBottom: "8px",
            }}>
              제목을 정할까요?
            </h2>
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "13px", color: "rgba(255,255,255,0.35)",
              marginBottom: "24px", lineHeight: 1.6,
            }}>
              제목 없이 저장하면 무제(無題)로 기록됩니다
            </p>

            <input
              type="text"
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  if (!title.trim()) setTitle("[無題]");
                  setShowTitleModal(false);
                  setTimeout(() => {
                    handleSave(pendingSaveMode!);
                    setPendingSaveMode(null);
                  }, 0);
                }
              }}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px", padding: "12px 16px",
                fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
                fontSize: "16px", color: "rgba(255,255,255,0.8)",
                outline: "none", marginBottom: "20px",
                boxSizing: "border-box",
              }}
              autoFocus
            />

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowTitleModal(false); setPendingSaveMode(null); }}
                style={{
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "12px", letterSpacing: "0.06em",
                  padding: "9px 18px", borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent", color: "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (!title.trim()) setTitle("[無題]");
                  setShowTitleModal(false);
                  setTimeout(() => {
                    handleSave(pendingSaveMode!);
                    setPendingSaveMode(null);
                  }, 0);
                }}
                style={{
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "13px", letterSpacing: "0.06em",
                  padding: "9px 24px", borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.88)",
                  cursor: "pointer",
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 날짜 선택 모달 ── */}
      {showDatePicker && (
        <div
          onClick={() => setShowDatePicker(false)}
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
              maxWidth: "460px", width: "100%",
            }}
          >
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "11px", letterSpacing: "0.38em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)", marginBottom: "12px",
            }}>
              미래의 나에게
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "22px", color: "rgba(255,255,255,0.88)", marginBottom: "8px",
            }}>
              언제 열어볼까요?
            </h2>
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "13px", color: "rgba(255,255,255,0.3)",
              marginBottom: "28px", lineHeight: 1.6,
            }}>
              그날이 되면 우체국에서 편지가 기다리고 있을 거예요
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  className={`date-preset ${selectedDate === addDays(preset.days) ? "date-preset-active" : ""}`}
                  onClick={() => setSelectedDate(addDays(preset.days))}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: "32px" }}>
              <p style={{
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "11px", letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.25)", marginBottom: "10px",
              }}>
                직접 날짜 선택
              </p>
              <input
                type="date"
                value={selectedDate}
                min={addDays(1)}
                onChange={e => setSelectedDate(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px", padding: "10px 16px",
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "14px", outline: "none",
                  colorScheme: "dark",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "13px", letterSpacing: "0.06em",
                  padding: "10px 20px", borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent", color: "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                disabled={!selectedDate || saving}
                onClick={() => {
                  setShowDatePicker(false);
                  handleSave("future", selectedDate);
                }}
                style={{
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "13px", letterSpacing: "0.06em",
                  padding: "10px 24px", borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: selectedDate ? "rgba(255,255,255,0.06)" : "transparent",
                  color: selectedDate ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.25)",
                  cursor: selectedDate ? "pointer" : "default",
                }}
              >
                우체국에 맡기기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 새 건물 짓기 모달 ── */}
      {showBuildModal && pendingSave && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(3,1,10,0.88)", backdropFilter: "blur(14px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="modal-in"
            style={{
              background: "rgba(15,8,30,0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px", padding: "40px 44px",
              maxWidth: "440px", width: "100%",
            }}
          >
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "11px", letterSpacing: "0.38em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)", marginBottom: "12px",
            }}>
              건축 권한 획득
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "22px", color: "rgba(255,255,255,0.88)", marginBottom: "12px",
            }}>
              새 건물을 지을 수 있어요
            </h2>
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "13px", color: "rgba(255,255,255,0.45)",
              lineHeight: 1.7, marginBottom: "10px",
            }}>
              {setup.genre}를 {genreCount}편 완성했습니다.
            </p>
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "12px", color: "rgba(255,255,255,0.28)",
              lineHeight: 1.7, marginBottom: "32px",
            }}>
              새 건물을 지으면 이곳에 입주하며,<br />
              건물 간 이사는 언제든 가능합니다.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => {
                  setShowBuildModal(false);
                  handleSave(pendingSave.mode, pendingSave.openAt, true);
                }}
                style={{
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "14px", letterSpacing: "0.08em",
                  padding: "13px 24px", borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.88)",
                  cursor: "pointer", transition: "all 0.3s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
              >
                새 건물 짓기
              </button>
              <button
                onClick={() => {
                  setShowBuildModal(false);
                  handleSave(pendingSave.mode, pendingSave.openAt, false);
                }}
                style={{
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "13px", letterSpacing: "0.08em",
                  padding: "11px 24px", borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.45)",
                  cursor: "pointer", transition: "all 0.3s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                }}
              >
                기존 건물에 입주
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}