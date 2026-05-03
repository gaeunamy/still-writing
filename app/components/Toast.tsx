"use client";

import { useEffect, useState } from "react";

type ToastType = "error" | "info" | "success";

type ToastProps = {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
};

export function Toast({ message, type = "info", duration = 2500, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 마운트 후 페이드인
    const showTimer = setTimeout(() => setVisible(true), 10);
    // duration 후 페이드아웃 → onClose
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const colors: Record<ToastType, string> = {
    error: "rgba(220,80,80,0.25)",
    info: "rgba(100,70,180,0.25)",
    success: "rgba(80,180,120,0.2)",
  };

  const borderColors: Record<ToastType, string> = {
    error: "rgba(220,80,80,0.35)",
    info: "rgba(120,90,200,0.35)",
    success: "rgba(80,180,120,0.35)",
  };

  const icons: Record<ToastType, string> = {
    error: "✦",
    info: "✦",
    success: "✦",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "32px",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "-16px"})`,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease, transform 0.4s ease",
        zIndex: 100,
        background: `rgba(12,6,28,0.92)`,
        border: `1px solid ${borderColors[type]}`,
        borderRadius: "100px",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backdropFilter: "blur(12px)",
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 0 0 1px ${colors[type]}`,
        pointerEvents: "none",
      }}
    >
      <span style={{
        fontSize: "8px",
        color: borderColors[type],
      }}>
        {icons[type]}
      </span>
      <p style={{
        fontFamily: "'Crimson Pro', serif",
        fontWeight: 200,
        fontSize: "13px",
        letterSpacing: "0.06em",
        color: "rgba(255,255,255,0.75)",
        whiteSpace: "nowrap",
      }}>
        {message}
      </p>
    </div>
  );
}

// 토스트 상태 관리 훅
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
}