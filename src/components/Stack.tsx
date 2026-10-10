"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { LAYERS } from "@/lib/sceneState";
import styles from "./Stack.module.css";

// Three.js is the heaviest thing on the page, so it loads after first paint.
const StackCanvas = dynamic(() => import("./StackCanvas"), { ssr: false });

/** Static stand-in for browsers without WebGL. Same idea, no motion. */
function StackFallback() {
  return (
    <svg className={styles.fallback} viewBox="0 0 400 420" aria-hidden="true">
      {LAYERS.map((name, i) => (
        <g key={name} transform={`translate(0 ${i * 62})`} opacity={1 - i * 0.14}>
          <path d="M200 20 L370 90 L200 160 L30 90 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <text x="376" y="94" className={styles.fallbackText}>
            L{i} {name}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Stack() {
  const [failed, setFailed] = useState(false);
  const onFail = useCallback(() => setFailed(true), []);
  return failed ? <StackFallback /> : <StackCanvas onFail={onFail} />;
}
