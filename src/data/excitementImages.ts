/**
 * Images for excitement-based selection levels
 * These will be used while Sora video generation runs in the background
 */

export interface ExcitementImage {
  id: number;
  url: string;
  title: string;
  excitementThreshold: number; // Required excitement level to select (0-1)
}

// Excitement Level 1 Images - Abstract energetic visuals
export const excitementLevel1Images: ExcitementImage[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=600&fit=crop",
    title: "Neon Energy",
    excitementThreshold: 0.3
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop",
    title: "Electric Pulse",
    excitementThreshold: 0.4
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=600&fit=crop",
    title: "Digital Flow",
    excitementThreshold: 0.3
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&h=600&fit=crop",
    title: "Cosmic Wave",
    excitementThreshold: 0.5
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&h=600&fit=crop",
    title: "Aurora Spectrum",
    excitementThreshold: 0.4
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=600&fit=crop",
    title: "Gradient Dreams",
    excitementThreshold: 0.3
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1557672199-6e610650e9ca?w=800&h=600&fit=crop",
    title: "Light Burst",
    excitementThreshold: 0.5
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&h=600&fit=crop",
    title: "Vibrant Glow",
    excitementThreshold: 0.4
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    title: "Mountain Energy",
    excitementThreshold: 0.3
  }
];

// Excitement Level 2 Images - Music and rhythm themed
export const excitementLevel2Images: ExcitementImage[] = [
  {
    id: 10,
    url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
    title: "Studio Vibes",
    excitementThreshold: 0.4
  },
  {
    id: 11,
    url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    title: "Sonic Wave",
    excitementThreshold: 0.5
  },
  {
    id: 12,
    url: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop",
    title: "Concert Energy",
    excitementThreshold: 0.6
  },
  {
    id: 13,
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop",
    title: "Rhythm Flow",
    excitementThreshold: 0.4
  },
  {
    id: 14,
    url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
    title: "Melody Maker",
    excitementThreshold: 0.3
  },
  {
    id: 15,
    url: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&h=600&fit=crop",
    title: "Sound Spectrum",
    excitementThreshold: 0.5
  },
  {
    id: 16,
    url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=600&fit=crop",
    title: "Beat Machine",
    excitementThreshold: 0.4
  },
  {
    id: 17,
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop",
    title: "Frequency Wave",
    excitementThreshold: 0.6
  },
  {
    id: 18,
    url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
    title: "Harmony Hub",
    excitementThreshold: 0.3
  }
];

// Excitement Level 3 Images - Artistic artworks forming the earth
// HIGHER thresholds for lower sensitivity (0.55-0.75 range)
export const excitementLevel3Images: ExcitementImage[] = [
  {
    id: 19,
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=800&fit=crop",
    title: "Earth's Heartbeat",
    excitementThreshold: 0.65
  },
  {
    id: 20,
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=800&fit=crop",
    title: "Cosmic Genesis",
    excitementThreshold: 0.60
  },
  {
    id: 21,
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop",
    title: "Ocean's Breath",
    excitementThreshold: 0.55
  },
  {
    id: 22,
    url: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&h=800&fit=crop",
    title: "Forest Consciousness",
    excitementThreshold: 0.70
  },
  {
    id: 23,
    url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&h=800&fit=crop",
    title: "Unity Wave",
    excitementThreshold: 0.65
  },
  {
    id: 24,
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=800&fit=crop",
    title: "Mountain Energy",
    excitementThreshold: 0.75
  },
  {
    id: 25,
    url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=800&fit=crop",
    title: "Emotional Tide",
    excitementThreshold: 0.60
  },
  {
    id: 26,
    url: "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&h=800&fit=crop",
    title: "Stellar Dawn",
    excitementThreshold: 0.70
  },
  {
    id: 27,
    url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=800&fit=crop",
    title: "Human Connection",
    excitementThreshold: 0.65
  },
  {
    id: 28,
    url: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800&h=800&fit=crop",
    title: "Sky Consciousness",
    excitementThreshold: 0.55
  },
  {
    id: 29,
    url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&h=800&fit=crop",
    title: "Desert Spirit",
    excitementThreshold: 0.75
  },
  {
    id: 30,
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=800&fit=crop",
    title: "Nature's Flow",
    excitementThreshold: 0.60
  },
  {
    id: 31,
    url: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=800&h=800&fit=crop",
    title: "Aurora Dreams",
    excitementThreshold: 0.70
  },
  {
    id: 32,
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=800&fit=crop",
    title: "Wild Heart",
    excitementThreshold: 0.65
  },
  {
    id: 33,
    url: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=800&h=800&fit=crop",
    title: "Earth Rising",
    excitementThreshold: 0.75
  }
];
