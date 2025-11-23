/**
 * Utility for assigning and managing consistent colors for headsets
 */

const HEADSET_COLORS = [
  'hsl(var(--primary))',      // Primary theme color
  'hsl(142, 76%, 36%)',       // Green
  'hsl(217, 91%, 60%)',       // Blue
  'hsl(280, 67%, 55%)',       // Purple
  'hsl(25, 95%, 53%)',        // Orange
  'hsl(340, 82%, 52%)',       // Pink
  'hsl(191, 97%, 42%)',       // Cyan
  'hsl(48, 96%, 53%)',        // Yellow
];

const headsetColorMap = new Map<string, string>();

/**
 * Get or assign a color for a headset ID
 */
export const getHeadsetColor = (headsetId: string): string => {
  if (!headsetColorMap.has(headsetId)) {
    const colorIndex = headsetColorMap.size % HEADSET_COLORS.length;
    headsetColorMap.set(headsetId, HEADSET_COLORS[colorIndex]);
  }
  return headsetColorMap.get(headsetId)!;
};

/**
 * Reset color assignments (useful for new sessions)
 */
export const resetHeadsetColors = () => {
  headsetColorMap.clear();
};

/**
 * Get all assigned colors
 */
export const getAllHeadsetColors = (): Map<string, string> => {
  return new Map(headsetColorMap);
};
