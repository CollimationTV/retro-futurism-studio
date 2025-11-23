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
