import { useEffect } from "react";
import { useRouter } from "next/router";
import { getRole } from "../utils/api";

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace(getRole() ? "/dashboard" : "/login"); }, [router]);
  return <main className="min-h-screen flex items-center justify-center" style={{ color: "var(--color-text-muted)" }}>Loading Aegis…</main>;
}
