/**
 * Soundtrack options for Brave New Earth video
 * Selected based on collective excitement scores
 */

export interface Soundtrack {
  id: number;
  name: string;
  url: string; // URL to audio file or reference
  minScore: number; // Minimum collective excitement score (0-100)
  maxScore: number; // Maximum collective excitement score (0-100)
  description: string;
}

export const soundtracks: Soundtrack[] = [
  {
    id: 1,
    name: "Calm Horizons",
    url: "/soundtracks/calm-horizons.mp3",
    minScore: 0,
    maxScore: 25,
    description: "Gentle, ambient tones for a serene experience"
  },
  {
    id: 2,
    name: "Rising Dawn",
    url: "/soundtracks/rising-dawn.mp3",
    minScore: 26,
    maxScore: 50,
    description: "Uplifting melodies that build gradually"
  },
  {
    id: 3,
    name: "Electric Future",
    url: "/soundtracks/electric-future.mp3",
    minScore: 51,
    maxScore: 75,
    description: "Energetic electronic beats with retro-futuristic vibes"
  },
  {
    id: 4,
    name: "Cosmic Pulse",
    url: "/soundtracks/cosmic-pulse.mp3",
    minScore: 76,
    maxScore: 100,
    description: "High-energy, epic orchestral combined with synth"
  }
];

/**
 * Get soundtrack based on collective excitement score
 */
export const getSoundtrackByScore = (score: number): Soundtrack => {
  const soundtrack = soundtracks.find(
    s => score >= s.minScore && score <= s.maxScore
  );
  return soundtrack || soundtracks[0];
};
