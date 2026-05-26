"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../components/AuthGuard";

const poemSpeakers = ["나", "익명의 화자", "과거의 나"];
const poemImages = ["새벽", "여름", "바다", "비", "기억"];

const novelViews = ["1인칭", "3인칭", "전지적 작가 시점"];
const novelSettings = ["도시", "바다", "학교", "기억 속 장소"];
const novelEndings = ["열린 결말", "쓸쓸한 결말", "따뜻한 결말"];

const lengths = ["짧게", "적당히", "길게"];

export default function SetupPage() {
  const router = useRouter();
  const [genre, setGenre] = useState("");

  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedView, setSelectedView] = useState("");
  const [selectedSetting, setSelectedSetting] = useState("");
  const [selectedEnding, setSelectedEnding] = useState("");
  const [selectedLength, setSelectedLength] = useState("");

  useEffect(() => {
    const g = localStorage.getItem("selectedGenre");
    if (!g) { router.push("/start"); return; }
    setGenre(g);
  }, []);

  const handleNext = () => {
    localStorage.setItem("writingSetup", JSON.stringify({
      genre,
      speaker: selectedSpeaker,
      image: selectedImage,
      view: selectedView,
      setting: selectedSetting,
      ending: selectedEnding,
      length: selectedLength,
    }));
    router.push("/editor");
  };

  return (
    <AuthGuard>
      <main
        className="relative min-h-screen px-6 py-16"
        style={{
          background: "linear-gradient(180deg, #03010a 0%, #080318 55%, #100828 100%)",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Crimson+Pro:wght@200;300&display=swap');
          @keyframes fadeUp {
            from { opacity:0; transform:translateY(14px); }
            to   { opacity:1; transform:translateY(0); }
          }
          .fade-up { animation: fadeUp 0.7s ease-out both; }
          .chip {
            font-family: 'Crimson Pro', serif;
            font-weight: 200;
            font-size: 13px;
            letter-spacing: 0.06em;
            padding: 8px 20px;
            border-radius: 100px;
            border: 1px solid rgba(255,255,255,0.1);
            background: transparent;
            color: rgba(255,255,255,0.5);
            cursor: pointer;
            transition: all 0.35s ease;
            white-space: nowrap;
          }
          .chip:hover {
            border-color: rgba(255,255,255,0.3);
            color: rgba(255,255,255,0.85);
          }
          .chip-active {
            border-color: rgba(255,255,255,0.7) !important;
            background: rgba(255,255,255,0.06) !important;
            color: rgba(255,255,255,0.95) !important;
          }
        `}</style>

        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push("/start")}
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
            ← 장르 선택
          </button>

          <p
            className="fade-up"
            style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "11px", letterSpacing: "0.42em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)", marginBottom: "16px",
              animationDelay: "0.05s",
            }}
          >
            writing setup · {genre}
          </p>

          <h1
            className="fade-up"
            style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "clamp(24px, 3.5vw, 42px)", lineHeight: 1.35,
              color: "rgba(255,255,255,0.88)", marginBottom: "48px",
              animationDelay: "0.1s",
            }}
          >
            어떤 분위기로 쓸까요
          </h1>

          <div className="space-y-10">

            {/* 시 옵션 */}
            {genre === "시" && (
              <>
                <Section title="화자" items={poemSpeakers} selected={selectedSpeaker} onSelect={setSelectedSpeaker} delay="0.15s" />
                <Section title="이미지" items={poemImages} selected={selectedImage} onSelect={setSelectedImage} delay="0.25s" />
              </>
            )}

            {/* 소설 옵션 */}
            {genre === "소설" && (
              <>
                <Section title="시점" items={novelViews} selected={selectedView} onSelect={setSelectedView} delay="0.15s" />
                <Section title="배경" items={novelSettings} selected={selectedSetting} onSelect={setSelectedSetting} delay="0.2s" />
                <Section title="결말 분위기" items={novelEndings} selected={selectedEnding} onSelect={setSelectedEnding} delay="0.25s" />
              </>
            )}

            <Section title="길이" items={lengths} selected={selectedLength} onSelect={setSelectedLength} delay="0.3s" />
          </div>

          <div className="fade-up text-center" style={{ marginTop: "52px", animationDelay: "0.4s" }}>
            <button
              onClick={handleNext}
              style={{
                fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                fontSize: "15px", letterSpacing: "0.12em",
                padding: "13px 40px", borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.85)",
                cursor: "pointer", transition: "all 0.5s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            >
              글 쓰러 가기
            </button>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}

function Section({
  title, items, selected, onSelect, delay,
}: {
  title: string;
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  delay?: string;
}) {
  return (
    <div className="fade-up" style={{ animationDelay: delay }}>
      <p style={{
        fontFamily: "'Crimson Pro', serif", fontWeight: 200,
        fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.3)", marginBottom: "14px",
      }}>
        {title}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {items.map((item) => (
          <button
            key={item}
            className={`chip ${selected === item ? "chip-active" : ""}`}
            onClick={() => onSelect(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}