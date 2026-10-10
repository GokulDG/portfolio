import { portfolio } from "@/config/portfolio";
import Marker from "./Marker";
import styles from "./Journey.module.css";

export default function Journey() {
  return (
    <section id="journey" className={`section ${styles.journey}`}>
      <Marker id="journey" note={`${portfolio.experience} of professional work`} />

      <h2 className="display" data-rise>
        <span className="mask">
          <span>Experience</span>
        </span>
        <span className="mask">
          <span>
            &amp; <em className="serif lime">journey</em>
          </span>
        </span>
      </h2>

      <ol className={styles.timeline}>
        {portfolio.journey.map((entry) => (
          <li key={`${entry.org}-${entry.title}`} data-reveal>
            <p className={`${styles.period} mono`}>{entry.period}</p>
            <div>
              <h3>{entry.title}</h3>
              <p className={styles.org}>
                {entry.org}
                {entry.place && <span> · {entry.place}</span>}
              </p>
              {entry.note && <p className="tag">{entry.note}</p>}
            </div>
            <ul>
              {entry.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {portfolio.recognition.length > 0 && (
        <div className={styles.recognition}>
          <p className="mono" data-reveal>
            Recognition
          </p>
          <ul>
            {portfolio.recognition.map((r) => (
              <li key={r.title} data-reveal>
                <b>{r.title}</b>
                <span>{r.where}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
