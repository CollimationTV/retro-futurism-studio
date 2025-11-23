/**
 * Calculate positions for artworks in a spherical pattern
 */

export interface SphericalPosition {
  x: number; // Percentage from left
  y: number; // Percentage from top
  scale: number; // Scale factor for depth
  zIndex: number;
}

/**
 * Generate positions for 15 artworks in a spherical layout
 * - 1 center artwork (the core)
 * - 6 middle ring artworks
 * - 8 outer ring artworks
 */
export const generateSphericalLayout = (): SphericalPosition[] => {
  const positions: SphericalPosition[] = [];
  
  // Center artwork (index 0)
  positions.push({
    x: 50,
    y: 50,
    scale: 1.2,
    zIndex: 10
  });
  
  // Middle ring (6 artworks, indices 1-6)
  const middleRadius = 25; // % from center
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * (Math.PI / 180); // 60 degrees apart
    positions.push({
      x: 50 + middleRadius * Math.cos(angle),
      y: 50 + middleRadius * Math.sin(angle),
      scale: 1.0,
      zIndex: 5
    });
  }
  
  // Outer ring (8 artworks, indices 7-14)
  const outerRadius = 40; // % from center
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45) * (Math.PI / 180); // 45 degrees apart
    positions.push({
      x: 50 + outerRadius * Math.cos(angle),
      y: 50 + outerRadius * Math.sin(angle),
      scale: 0.8,
      zIndex: 1
    });
  }
  
  return positions;
};
