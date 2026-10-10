import { portfolio } from "@/config/portfolio";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`${styles.footer} mono`}>
      <p>
        © {new Date().getFullYear()} {portfolio.name}
      </p>
      <p>Designed and built by hand · Next.js, GSAP, Three.js</p>
      <a className="link" href="#top">
        Back to the interface <span aria-hidden="true">↑</span>
      </a>
    </footer>
  );
}
