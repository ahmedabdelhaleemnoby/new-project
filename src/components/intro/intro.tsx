"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// First-visit intro: a Three.js kiln scene (loaded on demand), then the logo, then the overlay lifts.
// Runs once per browser session. The root layout's inline script adds `intro-seen` before paint when
// it has already played or the visitor prefers reduced motion, so the overlay never flashes.
const STORAGE_KEY = "ajyad-intro";
const LOGO_AT = 2700;
const EXIT_AT = 4200;
const EXIT_MS = 800;

type Phase = "play" | "logo" | "exit" | "done";

export function Intro({ skipLabel, logoAlt }: { skipLabel: string; logoAlt: string }) {
  const [phase, setPhase] = useState<Phase>("play");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{ dispose(): void } | null>(null);
  const timers = useRef<number[]>([]);

  const finish = useCallback(() => {
    setPhase("done");
    document.documentElement.classList.remove("intro-lock");
    sceneRef.current?.dispose();
    sceneRef.current = null;
  }, []);

  const skip = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    setPhase(current => (current === "done" ? current : "exit"));
    timers.current = [window.setTimeout(finish, EXIT_MS)];
  }, [finish]);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("intro-seen")) { setPhase("done"); return; }
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch {}
    root.classList.add("intro-lock");

    let cancelled = false;
    import("./kiln-scene")
      .then(({ createKilnScene }) => {
        if (cancelled || !canvasRef.current) return;
        const scene = createKilnScene(canvasRef.current);
        sceneRef.current = scene;
        scene.start();
      })
      .catch(() => root.classList.add("intro-no-3d")); // No WebGL: the logo and backdrop still play.

    timers.current = [
      window.setTimeout(() => setPhase("logo"), LOGO_AT),
      window.setTimeout(() => setPhase("exit"), EXIT_AT),
      window.setTimeout(finish, EXIT_AT + EXIT_MS),
    ];
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" || event.key === "Enter" || event.key === " ") skip(); };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      timers.current.forEach(window.clearTimeout);
      window.removeEventListener("keydown", onKey);
      root.classList.remove("intro-lock");
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [finish, skip]);

  if (phase === "done") return null;
  return <div className={`intro is-${phase}`} onClick={skip}>
    <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />
    <div className="intro-logo" aria-hidden="true"><Image src="/images/ajyad-logo-light.png" alt={logoAlt} width={2400} height={737} priority sizes="(max-width: 600px) 80vw, 520px" /></div>
    <button type="button" className="intro-skip" onClick={event => { event.stopPropagation(); skip(); }}>{skipLabel}</button>
  </div>;
}
