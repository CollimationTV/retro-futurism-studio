/**
 * One Euro Filter for smooth motion tracking
 * 
 * This filter adapts dynamically to motion speed:
 * - Heavy smoothing during slow precise movements (reduces jitter)
 * - Reduced lag during fast head turns (maintains responsiveness)
 * 
 * Reference: http://cristal.univ-lille.fr/~casiez/1euro/
 */
export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xPrev: number | null = null;
  private dxPrev: number = 0;
  private tPrev: number | null = null;

  /**
   * @param minCutoff - Jitter reduction (lower = smoother, default: 1.0)
   * @param beta - Lag reduction (higher = more responsive to fast movements, default: 0.007)
   * @param dCutoff - Cutoff for derivative (default: 1.0)
   */
  constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  /**
   * Filter a new value
   * @param x - New raw value
   * @param timestamp - Current timestamp in milliseconds
   * @returns Filtered value
   */
  filter(x: number, timestamp: number): number {
    // Initialize on first call
    if (this.tPrev === null || this.xPrev === null) {
      this.tPrev = timestamp;
      this.xPrev = x;
      return x;
    }
    
    // Calculate time delta
    const te = timestamp - this.tPrev;
    this.tPrev = timestamp;
    
    // Calculate filtered derivative for adaptive cutoff
    const aD = this._alpha(te, this.dCutoff);
    const dx = (x - this.xPrev) / te;
    const dxHat = aD * dx + (1 - aD) * this.dxPrev;
    
    // Adapt cutoff based on movement speed
    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const a = this._alpha(te, cutoff);
    const xHat = a * x + (1 - a) * this.xPrev;
    
    this.xPrev = xHat;
    this.dxPrev = dxHat;
    return xHat;
  }

  private _alpha(te: number, cutoff: number): number {
    const r = 2 * Math.PI * cutoff * te;
    return r / (r + 1);
  }

  /**
   * Reset the filter state
   */
  reset(): void {
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }
}

/**
 * Apply a non-linear sensitivity curve for natural mouse feel
 * 
 * @param input - Raw input value
 * @param lowSens - Sensitivity for small movements (precision zone)
 * @param highSens - Sensitivity for large movements (fast navigation)
 * @param threshold - Angle threshold where acceleration begins (degrees)
 * @param rampRange - Range over which acceleration ramps up (degrees)
 * @returns Scaled value
 */
export function applySensitivityCurve(
  input: number,
  lowSens = 1.0,
  highSens = 3.0,
  threshold = 20,
  rampRange = 15
): number {
  const absInput = Math.abs(input);
  let multiplier: number;
  
  if (absInput < threshold) {
    // Precision zone
    multiplier = lowSens;
  } else if (absInput < threshold + rampRange) {
    // Smooth transition using smoothstep
    const t = (absInput - threshold) / rampRange;
    const smooth = t * t * (3 - 2 * t);
    multiplier = lowSens + (highSens - lowSens) * smooth;
  } else {
    // Fast movement zone
    multiplier = highSens;
  }
  
  return input * multiplier;
}
