"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/city`,
      },
    });

    if (error) {
      console.error(error);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <main
      className="relative min-h-screen flex items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg, #03010a 0%, #080318 55%, #100828 100%)" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Crimson+Pro:wght@200;300&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s ease-out both; }
      `}</style>

      <div className="w-full max-w-sm text-center">
        {!sent ? (
          <>
            <p className="fade-up" style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "11px", letterSpacing: "0.42em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)", marginBottom: "28px",
              animationDelay: "0.1s",
            }}>
              still — writing
            </p>

            <h1 className="fade-up" style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "clamp(26px, 4vw, 38px)", lineHeight: 1.35,
              color: "rgba(255,255,255,0.88)", marginBottom: "12px",
              animationDelay: "0.2s",
            }}>
              당신의 방으로
            </h1>

            <p className="fade-up" style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "14px", color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.04em", lineHeight: 1.7,
              marginBottom: "40px", animationDelay: "0.3s",
            }}>
              이메일을 입력하면<br />
              입장 링크를 보내드려요
            </p>

            <div className="fade-up" style={{ animationDelay: "0.4s" }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "15px", letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.8)",
                  outline: "none",
                  marginBottom: "14px",
                  transition: "border-color 0.3s",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />

              <button
                onClick={handleLogin}
                disabled={loading || !email.trim()}
                style={{
                  width: "100%",
                  fontFamily: "'Crimson Pro', serif", fontWeight: 200,
                  fontSize: "14px", letterSpacing: "0.1em",
                  padding: "14px", borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: email.trim() ? "rgba(255,255,255,0.06)" : "transparent",
                  color: email.trim() ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)",
                  cursor: email.trim() ? "pointer" : "default",
                  transition: "all 0.4s",
                }}
                onMouseEnter={e => {
                  if (email.trim()) {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.background = email.trim() ? "rgba(255,255,255,0.06)" : "transparent";
                }}
              >
                {loading ? "보내는 중..." : "입장 링크 받기"}
              </button>
            </div>
          </>
        ) : (
          <div className="fade-up" style={{ animationDelay: "0.1s" }}>
            <p style={{ fontSize: "32px", marginBottom: "24px" }}>✉️</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "26px", color: "rgba(255,255,255,0.88)",
              marginBottom: "12px",
            }}>
              편지를 보냈습니다
            </h2>
            <p style={{
              fontFamily: "'Crimson Pro', serif", fontWeight: 200,
              fontSize: "14px", color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.04em", lineHeight: 1.8,
            }}>
              {email}으로<br />
              입장 링크를 보내드렸어요.<br />
              메일함을 확인해주세요.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}