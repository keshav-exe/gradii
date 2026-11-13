/** Seconds for one full loop at speed 1. */
export const PERIOD = 12

/**
 * The live animation phase, outside React so the render loop can move it
 * every frame without re-rendering anything. Exports read it, so a still
 * image is exactly the frame on screen.
 */
export const clock = { phase: 0 }
