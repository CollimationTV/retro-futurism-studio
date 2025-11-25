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
 * Generate positions for 15 artworks in a single circular ring
 * All images evenly spaced around one large circle - no overlap
 */
export const generateSphericalLayout = (): SphericalPosition[] => {
  const positions: SphericalPosition[] = [];
  
  // Single ring with all 15 artworks evenly spaced
  const radius = 45; // % from center - larger to prevent overlap
  const angleStep = 360 / 15; // 24 degrees apart
  
  for (let i = 0; i < 15; i++) {
    const angle = (i * angleStep) * (Math.PI / 180);
    positions.push({
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
      scale: 1.0, // All images same size
      zIndex: 5 // Uniform z-index
    });
  }
  
  return positions;
};
