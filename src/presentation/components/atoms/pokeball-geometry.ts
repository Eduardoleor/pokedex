/** Proportions shared by the growing ball and the full-screen reveal so they line up. */
export const BAND_RATIO = 0.035;
export const BUTTON_RATIO = 0.14;
export const BUTTON_INNER_RATIO = 0.085;

/** Diameter at which a ball centered on the screen covers it entirely. */
export function ballFillDiameter(width: number, height: number): number {
  return Math.hypot(width, height) * 1.05;
}
