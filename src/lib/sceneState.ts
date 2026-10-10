/**
 * Shared, mutable state for the WebGL stack.
 *
 * Sections tween these numbers with GSAP and the render loop reads them every
 * frame. Keeping it outside React means scrolling never triggers a re-render.
 *
 * Each field has exactly one writer (Hero owns the pose, Story owns `veil`,
 * Contact owns `finale`), so scrubbed tweens can never overwrite each other.
 */
export interface SceneState {
  /** 0 = flat, facing the viewer (a single interface). 1 = isometric stack. */
  tilt: number;
  /** Distance between layers. 0 collapses the stack into one plane. */
  explode: number;
  /** Extra rotation around the stack's own axis, in radians. */
  spin: number;
  /** Horizontal / vertical offset as a fraction of half the viewport (-1..1). */
  x: number;
  y: number;
  scale: number;
  opacity: number;
  /** Opacity of the HTML layer annotations. */
  labels: number;
  /** 1 → 0 as the story takes over. Multiplies opacity. */
  veil: number;
  /** 0 → 1 at the contact scene: the stack folds into one frame around the headline. */
  finale: number;
}

export const sceneState: SceneState = {
  tilt: 1,
  explode: 0.6,
  spin: 0,
  x: 0.34,
  y: -0.04,
  scale: 1,
  opacity: 1,
  labels: 1,
  veil: 1,
  finale: 0,
};

/** The element the closing frame locks onto. */
export const FRAME_TARGET = "data-scene-frame";

export const LAYERS = ["Interface", "API", "Logic", "Data", "Infrastructure"] as const;
