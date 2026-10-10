import type { ProjectVisual as Kind } from "@/config/portfolio";
import EscalationDemo from "./EscalationDemo";
import styles from "./ProjectVisual.module.css";

/**
 * Line drawings that describe what each project does.
 * They are diagrams, not screenshots: swap in real captures when you have them.
 */

function Workspace() {
  const rooms = [
    [20, 20, 110, 70], [130, 20, 90, 70], [220, 20, 100, 110],
    [20, 90, 70, 110], [90, 90, 130, 60], [90, 150, 60, 50],
    [150, 150, 70, 50], [220, 130, 100, 70],
  ];
  const modules = [
    ["Map", 20, 232], ["Incidents", 100, 232], ["Finance", 200, 232], ["CRM", 290, 232],
  ] as const;
  return (
    <svg viewBox="0 0 340 250" className={styles.svg}>
      {rooms.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} className={i === 4 ? styles.hot : styles.stroke} />
      ))}
      {[40, 60, 150, 250, 280, 110, 180].map((x, i) => (
        <circle key={i} cx={x} cy={[50, 150, 45, 60, 165, 175, 178][i]} r="2.5" className={styles.dot} />
      ))}
      <path d="M155 120 L60 150 M155 120 L250 60 M155 120 L280 165" className={styles.dash} />
      {modules.map(([label, x, y]) => (
        <text key={label} x={x} y={y} className={styles.text}>
          {label}
        </text>
      ))}
    </svg>
  );
}

function Elevation() {
  const towers = [
    { x: 30, w: 70, h: 120, cols: 3, rows: 5 },
    { x: 115, w: 95, h: 170, cols: 4, rows: 7 },
    { x: 225, w: 85, h: 90, cols: 4, rows: 3 },
  ];
  return (
    <svg viewBox="0 0 340 250" className={styles.svg}>
      <line x1="10" y1="215" x2="330" y2="215" className={styles.stroke} />
      {towers.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={215 - t.h} width={t.w} height={t.h} className={i === 1 ? styles.hot : styles.stroke} />
          {Array.from({ length: t.cols * t.rows }, (_, k) => {
            const cw = t.w / t.cols;
            const rh = t.h / t.rows;
            return (
              <rect
                key={k}
                x={t.x + (k % t.cols) * cw + cw * 0.28}
                y={215 - t.h + Math.floor(k / t.cols) * rh + rh * 0.28}
                width={cw * 0.44}
                height={rh * 0.44}
                className={styles.faint}
              />
            );
          })}
        </g>
      ))}
      <path d="M222 45 V215 M217 45 H227 M217 215 H227" className={styles.dash} />
      <text x="20" y="238" className={styles.text}>Multi-family</text>
      <text x="125" y="238" className={styles.text}>Affordable</text>
      <text x="232" y="238" className={styles.text}>Commercial</text>
    </svg>
  );
}

function Tank() {
  const stages = [70, 105, 140, 175];
  return (
    <svg viewBox="0 0 340 250" className={styles.svg}>
      <rect x="80" y="40" width="110" height="170" className={styles.level} />
      <rect x="80" y="40" width="110" height="170" className={styles.stroke} />
      <ellipse cx="135" cy="40" rx="55" ry="9" className={styles.stroke} />
      {stages.map((y, i) => (
        <g key={y}>
          <line x1="80" y1={y} x2="230" y2={y} className={styles.dash} />
          <text x="238" y={y + 3} className={styles.text}>
            Stage {4 - i}
          </text>
        </g>
      ))}
      <path d="M135 210 V228 H300" className={styles.stroke} />
      <text x="238" y="222" className={styles.text}>MQTT</text>
    </svg>
  );
}

function Telemetry() {
  const sites = Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2;
    const r = 78 + (i % 3) * 14;
    // Rounded so server and client render identical markup.
    return [Math.round(170 + Math.cos(a) * r * 1.35), Math.round(122 + Math.sin(a) * r * 0.82)] as const;
  });
  return (
    <svg viewBox="0 0 340 250" className={styles.svg}>
      {sites.map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2="170" y2="122" className={styles.faint} />
          <circle cx={x} cy={y} r="2.5" className={styles.dot} />
        </g>
      ))}
      <circle cx="170" cy="122" r="16" className={styles.hot} />
      <circle cx="170" cy="122" r="3" className={styles.limeFill} />
      <text x="20" y="238" className={styles.text}>20+ sites, one broker</text>
    </svg>
  );
}

const VISUALS: Record<Kind, () => React.ReactElement> = {
  workspace: Workspace,
  elevation: Elevation,
  tank: Tank,
  telemetry: Telemetry,
  escalation: EscalationDemo,
};

export default function ProjectVisual({ kind, label }: { kind: Kind; label: string }) {
  const Visual = VISUALS[kind];
  return (
    <figure className={styles.figure} aria-label={`Diagram: ${label}`}>
      <Visual />
    </figure>
  );
}
