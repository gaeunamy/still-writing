"use client";

import { useEffect, useState } from "react";

type SavedWriting = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

export default function LibraryPage() {
  const [posts, setPosts] = useState<SavedWriting[]>([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("savedWritings") || "[]"
    );

    setPosts(saved);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-5xl mx-auto">

        <p className="text-xs tracking-[0.4em] uppercase opacity-50 mb-6">
          my library
        </p>

        <h1 className="text-3xl md:text-5xl font-light mb-14">
          내가 남긴 문장들
        </h1>

        {posts.length === 0 ? (
          <p className="opacity-50">
            아직 저장된 글이 없습니다.
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-3xl border border-white/10 p-8 hover:border-white/30 transition"
              >
                <h2 className="text-xl font-light mb-4">
                    {post.title || "제목 없음"}
                </h2>

                <p className="opacity-70 leading-relaxed line-clamp-3">
                    {post.content}
                </p>

                <p className="text-sm opacity-40 mt-6 text-right">
                    {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}