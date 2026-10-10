"use client";

import { useState } from "react";
import { portfolio, projectById } from "@/config/portfolio";
import Marker from "./Marker";
import styles from "./Toolkit.module.css";

/** Capabilities as layers of the same stack the page opened with. */
export default function Toolkit() {
  const [active, setActive] = useState(0);
  const { skills } = portfolio;

  return (
    <section id="toolkit" className={`section ${styles.toolkit}`}>
      <Marker id="toolkit" note={`${skills.length} layers`} />

      <div className={styles.intro}>
        <h2 className="display" data-rise>
          <span className="mask">
            <span>Engineering</span>
          </span>
          <span className="mask">
            <span>
              <em className="serif lime">toolkit</em>
            </span>
          </span>
        </h2>
        <p data-reveal>
          Grouped by where they sit in a system. Where a tool carries a project name, that is where you can ask me
          about it in detail.
        </p>
      </div>

      <ul className={styles.layers}>
        {skills.map((group, i) => {
          const open = active === i;
          return (
            <li key={group.id} className={styles.layer} data-open={open} data-reveal>
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`layer-${group.id}`}
                  onClick={() => setActive(i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                >
                  <span className="mono">L{i + 1}</span>
                  <span className={styles.name}>{group.title}</span>
                  <span className={styles.summary}>{group.summary}</span>
                  <span className="mono">{String(group.items.length).padStart(2, "0")}</span>
                </button>
              </h3>
              <div id={`layer-${group.id}`} className={styles.panel} inert={!open}>
                <ul className={styles.items}>
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <b>{item.name}</b>
                      {item.usedIn && (
                        <span className="mono">
                          {item.usedIn
                            .map((id) => projectById(id)?.name)
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
