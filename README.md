# Beyond the Interface

Portfolio of Gokulkumar K. A single scrolling page built with Next.js, TypeScript, GSAP + ScrollTrigger and Three.js.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run typecheck
```

## Update the content

Everything the site says lives in one file: [`src/config/portfolio.ts`](src/config/portfolio.ts).
Name, availability, story, projects, skills, experience, links. Components only read from it.

Search that file for `PLACEHOLDER` to find what still needs real information:

| What | Where |
| --- | --- |
| Years of experience | `experience` |
| Résumé PDF | drop it in `public/` and set `contact.resumeUrl` to `/resume.pdf` |
| Production URL | `siteUrl` |
| Stack for I&R Orchestrator and SD Builders | `projects[].stack` |
| Visit Pondy | add to `experiments` once there is a description and link |

The first two entries in `projects` render as full case studies (one with a `signalPath` is told
horizontally). The rest appear in the index below them.

## How it is put together

```
src/
  config/portfolio.ts     all content and its types
  lib/
    gsap.ts               plugin registration and shared media queries
    sceneState.ts         numbers the 3D stack reads each frame
    sections.ts           page order, used by nav, rail and section markers
  components/
    Stack*.tsx            the WebGL layer stack (lazy-loaded) and its fallback
    Motion.tsx            the two entrance animations, declared once
    Hero, Story, Work, SystemsLab, Toolkit, BuildLog, Journey, Contact
```

- **The stack** is the one piece of WebGL. It loads after first paint, pauses when it is not
  visible, and falls back to a static drawing without WebGL. Sections steer it by tweening
  `sceneState`; each field has a single owner so scroll animations cannot fight.
- **Entrances** use two attributes handled in `Motion.tsx`: `data-rise` for masked headline
  lines and `data-reveal` for blocks. Hidden states are applied by JavaScript, so the page is
  fully readable without it.
- **Reduced motion** turns off scroll-linked animation, the pinned section and all looping motion.
- **The diagrams** in the work section are drawings of what each project does, not screenshots.
  Replace them with real captures in `ProjectVisual.tsx` when you have them.
