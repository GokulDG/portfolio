"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { FRAME_TARGET, LAYERS, sceneState } from "@/lib/sceneState";
import styles from "./Stack.module.css";

const W = 3.6;
const H = 2.3;
const GAP = 0.66;
const INK = 0xece9df;
const LIME = 0xc6ff3d;

/** XY positions where a request crosses every layer. */
const ANCHORS: [number, number][] = [
  [-1.25, 0.55],
  [-0.35, -0.5],
  [0.3, 0.42],
  [0.95, -0.15],
  [1.4, 0.7],
  [-1.0, -0.75],
];

type Seg = number[];

const line = (s: Seg, x1: number, y1: number, x2: number, y2: number) => s.push(x1, y1, 0, x2, y2, 0);
const rect = (s: Seg, x: number, y: number, w: number, h: number) => {
  line(s, x, y, x + w, y);
  line(s, x + w, y, x + w, y + h);
  line(s, x + w, y + h, x, y + h);
  line(s, x, y + h, x, y);
};

/** The page content of the interface layer. Fades out when the frame closes around the headline. */
function interfaceDetail(): Seg {
  const s: Seg = [];
  rect(s, -W / 2 + 0.14, -0.1, 1.9, 0.8);
  for (let i = 0; i < 4; i++) line(s, 0.5, 0.6 - i * 0.18, 1.6 - (i % 2) * 0.4, 0.6 - i * 0.18);
  for (let i = 0; i < 3; i++) rect(s, -W / 2 + 0.14 + i * 1.13, -H / 2 + 0.14, 1.0, 0.62);
  return s;
}

/** Each layer is drawn as what it is: a screen, routes, a graph, tables, hosts. */
function layerSegments(index: number): Seg {
  const s: Seg = [];
  rect(s, -W / 2, -H / 2, W, H);

  if (index === 0) {
    // Window chrome only; the content is a separate mesh.
    line(s, -W / 2, H / 2 - 0.2, W / 2, H / 2 - 0.2);
    rect(s, -W / 2 + 0.1, H / 2 - 0.14, 0.08, 0.08);
    for (let i = 0; i < 3; i++) line(s, 0.9 + i * 0.28, H / 2 - 0.1, 1.06 + i * 0.28, H / 2 - 0.1);
  } else if (index === 1) {
    for (let i = 0; i < 5; i++) {
      const y = 0.8 - i * 0.4;
      line(s, -1.45, 0, -0.3, y);
      line(s, -0.3, y, 1.45, y);
      rect(s, 0.5, y - 0.05, 0.1, 0.1);
    }
    rect(s, -1.55, -0.1, 0.2, 0.2);
  } else if (index === 2) {
    const n: [number, number][] = [
      [-1.3, 0.6], [-0.6, 0.1], [-1.1, -0.6], [0.1, 0.7], [0.3, -0.3], [1.0, 0.3], [1.35, -0.6], [0.6, -0.85],
    ];
    const e = [[0, 1], [1, 2], [1, 3], [1, 4], [3, 5], [4, 5], [4, 7], [5, 6], [7, 6]];
    e.forEach(([a, b]) => line(s, n[a][0], n[a][1], n[b][0], n[b][1]));
    n.forEach(([x, y]) => rect(s, x - 0.06, y - 0.06, 0.12, 0.12));
  } else if (index === 3) {
    for (let t = 0; t < 3; t++) {
      const x = -1.55 + t * 1.1;
      rect(s, x, -0.7, 0.9, 1.4);
      for (let r = 1; r < 6; r++) line(s, x, 0.7 - r * 0.233, x + 0.9, 0.7 - r * 0.233);
      line(s, x + 0.28, 0.7, x + 0.28, -0.7);
    }
  } else {
    for (let c = 0; c < 5; c++)
      for (let r = 0; r < 3; r++) rect(s, -1.55 + c * 0.66, -0.85 + r * 0.62, 0.46, 0.42);
  }
  return s;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function StackCanvas({ onFail }: { onFail: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = canvas.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      onFail();
      return;
    }

    const disposables: { dispose: () => void }[] = [];
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.z = 9;

    const rig = new THREE.Group();
    const stack = new THREE.Group();
    rig.add(stack);
    scene.add(rig);

    // Layers
    const layers = LAYERS.map((_, i) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(layerSegments(i), 3));
      const mat = new THREE.LineBasicMaterial({ color: INK, transparent: true, depthWrite: false });
      const mesh = new THREE.LineSegments(geo, mat);
      stack.add(mesh);
      disposables.push(geo, mat);
      return { mesh, mat, base: i === 0 ? 0.85 : 0.5 - i * 0.05 };
    });

    const detailGeo = new THREE.BufferGeometry();
    detailGeo.setAttribute("position", new THREE.Float32BufferAttribute(interfaceDetail(), 3));
    const detailMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, depthWrite: false });
    layers[0].mesh.add(new THREE.LineSegments(detailGeo, detailMat));
    disposables.push(detailGeo, detailMat);
    const ink = new THREE.Color(INK);
    const lime = new THREE.Color(LIME);
    const frameTarget = document.querySelector(`[${FRAME_TARGET}]`);

    // Vertical connectors between the first and last layer
    const linkPos = new Float32Array(ANCHORS.length * 6);
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute("position", new THREE.BufferAttribute(linkPos, 3));
    const linkMat = new THREE.LineBasicMaterial({ color: LIME, transparent: true, depthWrite: false });
    stack.add(new THREE.LineSegments(linkGeo, linkMat));

    // Where connectors pierce each layer
    const nodePos = new Float32Array(ANCHORS.length * LAYERS.length * 3);
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
    const glow = glowTexture();
    const nodeMat = new THREE.PointsMaterial({
      color: INK, size: 0.07, map: glow, transparent: true, depthWrite: false,
    });
    stack.add(new THREE.Points(nodeGeo, nodeMat));

    // Requests travelling down the stack
    const COUNT = window.innerWidth < 900 ? 9 : 16;
    const packets = Array.from({ length: COUNT }, (_, i) => ({
      anchor: i % ANCHORS.length,
      t: (i * 0.618) % 1,
      speed: 0.1 + ((i * 7) % 5) * 0.022,
    }));
    const packetPos = new Float32Array(COUNT * 3);
    const packetGeo = new THREE.BufferGeometry();
    packetGeo.setAttribute("position", new THREE.BufferAttribute(packetPos, 3));
    const packetMat = new THREE.PointsMaterial({
      color: LIME, size: 0.2, map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    stack.add(new THREE.Points(packetGeo, packetMat));
    disposables.push(linkGeo, linkMat, nodeGeo, nodeMat, packetGeo, packetMat, glow);

    // Opening: a flat interface unfolds into the stack. Kept separate from
    // sceneState so scroll-driven tweens never fight it.
    const intro = { t: reduced || window.scrollY > 80 ? 1 : 0, fade: reduced ? 1 : 0 };
    const introTween = gsap
      .timeline()
      .to(intro, { fade: 1, duration: 0.9, ease: "power2.out" })
      .to(intro, { t: 1, duration: 1.9, ease: "expo.inOut" }, 0.15);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (finePointer && !reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    let width = 0;
    let height = 0;
    let visW = 1;
    let visH = 1;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 900 ? 1.5 : 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      visW = visH * camera.aspect;
      lastSig = "";
    };

    const labelEls = Array.from(labels.current?.children ?? []) as HTMLElement[];
    const corner = new THREE.Vector3();
    const clock = new THREE.Clock();
    let raf = 0;
    let lastSig = "";
    let visible = true;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      const s = sceneState;
      const f = s.finale;
      const opacity = mix(s.opacity * s.veil, mix(0.35, 0.9, smooth(0.6, 1, f)), smooth(0, 0.4, f)) * intro.fade;

      if (wrap.current) wrap.current.style.opacity = String(opacity);
      if (opacity < 0.01 || !visible) return;

      // With reduced motion nothing moves on its own, so only draw on change.
      if (reduced) {
        const sig = `${s.tilt}|${s.explode}|${s.spin}|${s.x}|${s.y}|${s.scale}|${opacity}|${f}|${f ? window.scrollY : 0}`;
        if (sig === lastSig) return;
        lastSig = sig;
      }

      const t = clock.elapsedTime;
      const fold = smooth(0.1, 1, f);
      const tilt = s.tilt * intro.t * (1 - fold);
      const explode = s.explode * intro.t * (1 - fold);
      const gap = GAP * explode;
      const mid = (LAYERS.length - 1) / 2;
      const depth = smooth(0.02, 0.3, explode);

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      const fit = Math.min(1, visW / 6.4);
      let px = (s.x * visW) / 2;
      let py = (s.y * visH) / 2;
      let scale = s.scale * fit;

      // Closing scene: the single remaining frame locks onto the headline.
      if (f > 0.001 && frameTarget) {
        const r = frameTarget.getBoundingClientRect();
        const toWorld = visW / width;
        px = mix(px, (r.left + r.width / 2 - width / 2) * toWorld, fold);
        py = mix(py, -(r.top + r.height / 2 - height / 2) * toWorld, fold);
        scale = mix(scale, Math.max((r.width * 1.16 * toWorld) / W, (r.height * 1.42 * toWorld) / H), fold);
      }

      rig.position.set(px, py, 0);
      rig.scale.setScalar(scale);
      rig.rotation.set(pointer.y * 0.09 * tilt, pointer.x * 0.14 * tilt, 0);
      const drift = reduced ? 0 : Math.sin(t * 0.25) * 0.06;
      stack.rotation.set(-1.02 * tilt, 0, (0.62 + s.spin + drift) * tilt);
      detailMat.opacity = 0.7 * (1 - fold);
      layers[0].mat.color.lerpColors(ink, lime, smooth(0.85, 1, f));

      layers.forEach((l, i) => {
        l.mesh.position.z = (mid - i) * gap;
        l.mat.opacity = l.base * (i === 0 ? 1 : depth);
      });

      const zTop = mid * gap;
      const zBot = -mid * gap;
      ANCHORS.forEach(([x, y], a) => {
        linkPos.set([x, y, zTop, x, y, zBot], a * 6);
        for (let i = 0; i < LAYERS.length; i++) nodePos.set([x, y, (mid - i) * gap], (a * LAYERS.length + i) * 3);
      });
      linkGeo.attributes.position.needsUpdate = true;
      nodeGeo.attributes.position.needsUpdate = true;
      linkMat.opacity = 0.28 * depth;
      nodeMat.opacity = 0.9 * depth;

      packets.forEach((p, i) => {
        if (!reduced) p.t = (p.t + p.speed * dt) % 1;
        const [x, y] = ANCHORS[p.anchor];
        packetPos.set([x, y, zTop + (zBot - zTop) * p.t], i * 3);
      });
      packetGeo.attributes.position.needsUpdate = true;
      packetMat.opacity = depth;

      renderer.render(scene, camera);

      const labelOpacity = s.labels * depth * smooth(0.6, 1, intro.t);
      labelEls.forEach((node, i) => {
        if (labelOpacity < 0.01) {
          node.style.opacity = "0";
          return;
        }
        corner.set(W / 2, -H / 2, 0);
        layers[i].mesh.localToWorld(corner).project(camera);
        const px = (corner.x * 0.5 + 0.5) * width;
        const py = (-corner.y * 0.5 + 0.5) * height;
        node.style.opacity = String(labelOpacity);
        node.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      });
    };

    const onVisibility = () => {
      visible = !document.hidden;
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      introTween.kill();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [onFail]);

  return (
    <div ref={wrap} className={styles.wrap} aria-hidden="true" style={{ opacity: 0 }}>
      <canvas ref={canvas} className={styles.canvas} />
      <div ref={labels} className={styles.labels}>
        {LAYERS.map((name, i) => (
          <span key={name} className={styles.label}>
            <i>L{i}</i>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
