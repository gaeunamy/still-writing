"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const poemSpeakers = ["나", "익명의 화자", "과거의 나"];
const poemMoods = ["고요한", "쓸쓸한", "몽환적인", "따뜻한"];
const poemImages = ["새벽", "여름", "바다", "비", "기억"];
const lengths = ["짧게", "적당히", "길게"];

const novelViews = ["1인칭", "3인칭", "전지적 작가 시점"];
const novelSettings = ["도시", "바다", "학교", "기억 속 장소"];
const novelEndings = ["열린 결말", "쓸쓸한 결말", "따뜻한 결말"];

export default function SetupPage() {
  const router = useRouter();

  const [genre, setGenre] = useState("");

  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  const [selectedView, setSelectedView] = useState("");
  const [selectedSetting, setSelectedSetting] = useState("");
  const [selectedEnding, setSelectedEnding] = useState("");

  const [selectedLength, setSelectedLength] = useState("");

  useEffect(() => {
    const savedGenre = localStorage.getItem("selectedGenre");

    if (savedGenre) {
      setGenre(savedGenre);
    }
  }, []);

  const handleNext = () => {
    localStorage.setItem(
      "writingSetup",
      JSON.stringify({
        genre,
        speaker: selectedSpeaker,
        mood: selectedMood,
        image: selectedImage,
        view: selectedView,
        setting: selectedSetting,
        ending: selectedEnding,
        length: selectedLength,
      })
    );

    router.push("/editor");
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-5xl mx-auto">

        <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-6">
          writing setup
        </p>

        <h1 className="text-3xl md:text-5xl font-light leading-relaxed mb-6">
          어떤 문장을 만나고 싶나요
        </h1>

        <p className="opacity-50 mb-14">
          선택한 장르: {genre || "불러오는 중..."}
        </p>

        <div className="space-y-12">

          {genre === "시" && (
            <>
              <Section
                title="화자"
                items={poemSpeakers}
                selected={selectedSpeaker}
                setSelected={setSelectedSpeaker}
              />

              <Section
                title="정서"
                items={poemMoods}
                selected={selectedMood}
                setSelected={setSelectedMood}
              />

              <Section
                title="이미지"
                items={poemImages}
                selected={selectedImage}
                setSelected={setSelectedImage}
              />
            </>
          )}

          {genre === "소설" && (
            <>
              <Section
                title="시점"
                items={novelViews}
                selected={selectedView}
                setSelected={setSelectedView}
              />

              <Section
                title="배경"
                items={novelSettings}
                selected={selectedSetting}
                setSelected={setSelectedSetting}
              />

              <Section
                title="결말 분위기"
                items={novelEndings}
                selected={selectedEnding}
                setSelected={setSelectedEnding}
              />
            </>
          )}

          <Section
            title="길이"
            items={lengths}
            selected={selectedLength}
            setSelected={setSelectedLength}
          />
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={handleNext}
            className="px-8 py-4 rounded-full border border-white/20 hover:bg-white hover:text-black transition duration-500"
          >
            문장 쓰러 가기
          </button>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  items,
  selected,
  setSelected,
}: {
  title: string;
  items: string[];
  selected: string;
  setSelected: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg mb-4 opacity-80">
        {title}
      </h2>

      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => setSelected(item)}
            className={`px-5 py-2 rounded-full border transition
              ${
                selected === item
                  ? "border-white bg-white text-black"
                  : "border-white/15 hover:border-white/40 hover:bg-white/5"
              }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}