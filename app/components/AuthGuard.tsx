"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setChecking(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") router.push("/login");
      if (event === "SIGNED_IN") setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) return (
    <main style={{
      background: "#03010a", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <p style={{
        fontFamily: "'Crimson Pro', serif", fontWeight: 200,
        fontSize: "13px", color: "rgba(255,255,255,0.25)",
        letterSpacing: "0.1em",
      }}>
        —
      </p>
    </main>
  );

  return <>{children}</>;
}