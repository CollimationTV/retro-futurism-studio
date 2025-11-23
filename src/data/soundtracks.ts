/**
 * Soundtrack options for Brave New Earth video
 * Selected based on collective excitement scores
 */

export interface Soundtrack {
  id: number;
  name: string;
  previewUrl: string; // 20-second preview snippet
  description: string;
}

export const soundtracks: Soundtrack[] = [
  {
    id: 1,
    name: "Calm Horizons",
    previewUrl: "/soundtracks/calm-horizons-preview.mp3",
    description: "Gentle, ambient tones for a serene experience"
  },
  {
    id: 2,
    name: "Rising Dawn",
    previewUrl: "/soundtracks/rising-dawn-preview.mp3",
    description: "Uplifting melodies that build gradually"
  },
  {
    id: 3,
    name: "Electric Future",
    previewUrl: "/soundtracks/electric-future-preview.mp3",
    description: "Energetic electronic beats with retro-futuristic vibes"
  },
  {
    id: 4,
    name: "Cosmic Pulse",
    previewUrl: "/soundtracks/cosmic-pulse-preview.mp3",
    description: "High-energy, epic orchestral combined with synth"
  }
];

/**
 * Get soundtrack with highest excitement score
 */
export const getSoundtrackByExcitementScores = (
  excitementScores: Map<number, number>
): Soundtrack => {
  // Find soundtrack ID with highest average excitement
  let highestScore = 0;
  let selectedId = 1;
  
  excitementScores.forEach((score, soundtrackId) => {
    if (score > highestScore) {
      highestScore = score;
      selectedId = soundtrackId;
    }
  });
  
  return soundtracks.find(s => s.id === selectedId) || soundtracks[0];
};
