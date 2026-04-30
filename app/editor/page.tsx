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

export default function EditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<SaveMode>(null);
  const [saved, setSaved] = useState(false);

  const [setup, setSetup] = useState<WritingSetup>({
    genre: "",
    mood: "",
    speaker: "",
    image: "",
    view: "",
    setting: "",
    ending: "",
    length: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("writingSetup");
    if (saved) setSetup(JSON.parse(saved));
  }, []);

  const moodColor = MOOD_COLORS[setup.mood] ?? "#a0a8b8";

  const handleGenerate = async () => {
    setLoading(true);

    let prompt = "";

    if (setup.genre === "시") {
      prompt = `${setup.mood} 정서, ${setup.speaker} 화자, ${setup.image} 이미지, ${setup.length} 분량으로 감성적인 시의 첫 문장을 제안해주세요. 직접 이어 쓸 수 있도록 여운을 남겨주세요.`;
    } else if (setup.genre === "소설") {
      prompt = `${setup.view} 시점, ${setup.setting} 배경, ${setup.ending} 결말 분위기, ${setup.length} 분량으로 독자가 몰입할 수 있는 소설의 첫 장면을 제안해주세요.`;
    } else {
      prompt = `${setup.mood} 감정으로 오늘의 일기 첫 문장을 제안해주세요. 솔직하고 여운 있게.`;
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.result) {
        setContent((prev) => (prev ? prev + "\n\n" + data.result : data.result));
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const handleSave = async (mode: SaveMode) => {
    if (!content.trim()) return;
    setSaving(true);
    setSaveMode(mode);

    const isPublic = mode === "public";
    const isFuture = mode === "future";

    try {
      const { error } = await supabase.from("writings").insert({
        title: title || null,
        content,
        genre: setup.genre || null,
        mood: setup.mood || null,
        room_type: null,
        is_public: isPublic,
        emotion_color: moodColor,
      });

      if (error) throw error;

      // 로컬에도 백업
      const savedLocally = JSON.parse(localStorage.getItem("savedWritings") || "[]");
      localStorage.setItem(
        "savedWritings",
        JSON.stringify([
          { id: Date.now(), title, content, createdAt: new Date().toISOString(), mode },
          ...savedLocally,
        ])
      );

      setSaved(true);

      // 저장 모드별 연출 후 이동
      if (isPublic) {
        setTimeout(() => router.push("/"), 2200);
      } else if (isFuture) {
        setTimeout(() => router.push("/library"), 2200);
      } else {
        setTimeout(() => router.push("/library"), 2200);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("저장 중 오류가 발생했습니다.");
      setSaving(false);
      setSaveMode(null);
    }
  };

  return (
    <main
      className="min-h-screen text-white px-6 py-16 transition-all duration-1000"
      style={{
        background: `radial-gradient(ellipse at 60% 0%, ${moodColor}18 0%, transparent 60%), linear-gradient(180deg, #03010a 0%, #0a0520 100%)`,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Crimson+Pro:ital,wght@0,200;0,300;1,200&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes paperIn {
          from { opacity: 0; transform: scaleY(0.96) translateY(8px); }
          to { opacity: 1; transform: scaleY(1) translateY(0); }
        }
        @keyframes savePublic {
          0% { opacity: 1; transform: scale(1); }
          60% { opacity: 0.8; transform: scale(1.02); }
          100% { opacity: 0; transform: scale(0.98) translateY(-20px); }
        }
        @keyframes savePrivate {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(30px); }
        }
        @keyframes saveFuture {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(-60px) rotate(-8deg); }
        }
        @keyframes lampPulse {
          0%, 100% { box-shadow: 0 0 12px 2px rgba(255, 220, 120, 0.2); }
          50% { box-shadow: 0 0 24px 6px rgba(255, 220, 120, 0.4); }
        }

        .editor-page { animation: fadeIn 0.8s ease-out both; }
        .paper { animation: paperIn 0.9s 0.3s ease-out both; }
        .lamp { animation: lampPulse 3s ease-in-out infinite; }
        .save-public { animation: savePublic 2s ease-in-out forwards; }
        .save-private { animation: savePrivate 2s ease-in-out forwards; }
        .save-future { animation: saveFuture 2s ease-in-out forwards; }

        textarea {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 300;
          line-height: 1.9;
          caret-color: ${moodColor};
        }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        textarea:focus { outline: none; }

        .save-btn {
          font-family: 'Crimson Pro', serif;
          font-weight: 200;
          font-size: 14px;
          letter-spacing: 0.08em;
          padding: 10px 24px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: rgba(255,255,255,0.65);
          cursor: pointer;
          transition: all 0.4s ease;
          white-space: nowrap;
        }
        .save-btn:hover {
          border-color: rgba(255,255,255,0.35);
          color: rgba(255,255,255,0.95);
          background: rgba(255,255,255,0.04);
        }
      `}</style>

      <div className="editor-page max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <p style={{
            fontFamily: "'Crimson Pro', serif",
            fontWeight: 200,
            fontSize: "11px",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
          }}>
            writing room
          </p>

          {/* Lamp — AI 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="lamp flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              border: `1px solid ${moodColor}40`,
              background: `${moodColor}08`,
              color: moodColor,
              fontFamily: "'Crimson Pro', serif",
              fontWeight: 200,
              fontSize: "13px",
              letterSpacing: "0.06em",
              cursor: loading ? "default" : "pointer",
              transition: "all 0.4s",
            }}
          >
            <span style={{ fontSize: "16px" }}>🕯</span>
            {loading ? "생각 중..." : "AI 도움 받기"}
          </button>
        </div>

        {/* Paper */}
        <div
          className={`paper ${saved ? `save-${saveMode}` : ""}`}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "24px",
            padding: "40px 44px",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Title */}
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              paddingBottom: "16px",
              marginBottom: "28px",
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "26px",
              color: "rgba(255,255,255,0.85)",
              outline: "none",
            }}
          />

          {/* Content */}
          <textarea
            placeholder="오늘은 어떤 문장을 쓰고 싶나요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              minHeight: "360px",
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.82)",
              resize: "none",
            }}
          />
        </div>

        {/* Mood indicator */}
        <div className="flex items-center gap-2 mt-5 mb-8">
          <div style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: moodColor,
            boxShadow: `0 0 8px ${moodColor}`,
          }} />
          <p style={{
            fontFamily: "'Crimson Pro', serif",
            fontWeight: 200,
            fontSize: "13px",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.04em",
          }}>
            {setup.mood ? `${setup.mood} 감정으로 쓰는 중` : "감정 설정 없음"}
          </p>
        </div>

        {/* Save buttons */}
        {!saved && (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
          }}>
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
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "17px",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.04em",
          }}>
            {saveMode === "public" && "당신의 창문에 불이 켜졌습니다."}
            {saveMode === "private" && "서랍 속에 조용히 간직되었습니다."}
            {saveMode === "future" && "밤하늘 어딘가로 날아갔습니다."}
          </p>
        )}
      </div>
    </main>
  );
}