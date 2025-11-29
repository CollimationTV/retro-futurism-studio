/**
 * Artwork and audio track pairings for Level 3
 * Each artwork has an associated song that plays during display
 */

export interface ArtworkAudioPair {
  id: number;
  artworkUrl: string;
  metadata: [string, string, string]; // Exactly 3 metadata tags
}

export const artworkAudioPairs: ArtworkAudioPair[] = [
  {
    id: 1,
    artworkUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop",
    metadata: ["cosmic pulse", "earth heartbeat", "stellar energy"]
  },
  {
    id: 2,
    artworkUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop",
    metadata: ["cosmic genesis", "stellar dawn", "universe birth"]
  },
  {
    id: 3,
    artworkUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&h=1080&fit=crop",
    metadata: ["ocean breath", "aquatic dreams", "water consciousness"]
  },
  {
    id: 4,
    artworkUrl: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1920&h=1080&fit=crop",
    metadata: ["forest consciousness", "nature rhythm", "woodland spirit"]
  },
  {
    id: 5,
    artworkUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1920&h=1080&fit=crop",
    metadata: ["unity wave", "collective harmony", "human connection"]
  },
  {
    id: 6,
    artworkUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&h=1080&fit=crop",
    metadata: ["mountain energy", "peak resonance", "alpine power"]
  },
  {
    id: 7,
    artworkUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1920&h=1080&fit=crop",
    metadata: ["emotional tide", "wave of emotion", "feeling flow"]
  },
  {
    id: 8,
    artworkUrl: "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1920&h=1080&fit=crop",
    metadata: ["stellar dawn", "sunrise symphony", "morning awakening"]
  },
  {
    id: 9,
    artworkUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop",
    metadata: ["human connection", "unity chorus", "social bond"]
  },
  {
    id: 10,
    artworkUrl: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1920&h=1080&fit=crop",
    metadata: ["sky consciousness", "ethereal flight", "celestial awareness"]
  }
];
