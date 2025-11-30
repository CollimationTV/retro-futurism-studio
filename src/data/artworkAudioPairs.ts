import level3Vid1 from "@/assets/level3-vid1.mp4";
import level3Img1 from "@/assets/level3-img1.jpg";
import level3Vid2 from "@/assets/level3-vid2.mp4";

/**
 * Artwork and audio track pairings for Level 3
 * Each artwork has an associated song that plays during display
 */

export interface ArtworkAudioPair {
  id: number;
  artworkUrl: string;
  metadata: string; // Single metadata tag
  type?: 'image' | 'video';
  audioUrl?: string;
}

export const artworkAudioPairs: ArtworkAudioPair[] = [
  {
    id: 1,
    artworkUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop",
    metadata: "cosmic pulse",
    type: 'image'
  },
  {
    id: 2,
    artworkUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop",
    metadata: "cosmic genesis",
    type: 'image'
  },
  {
    id: 3,
    artworkUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&h=1080&fit=crop",
    metadata: "ocean breath",
    type: 'image'
  },
  {
    id: 4,
    artworkUrl: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1920&h=1080&fit=crop",
    metadata: "forest consciousness",
    type: 'image'
  },
  {
    id: 5,
    artworkUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1920&h=1080&fit=crop",
    metadata: "unity wave",
    type: 'image'
  },
  {
    id: 6,
    artworkUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&h=1080&fit=crop",
    metadata: "mountain energy",
    type: 'image'
  },
  {
    id: 7,
    artworkUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1920&h=1080&fit=crop",
    metadata: "emotional tide",
    type: 'image'
  },
  {
    id: 8,
    artworkUrl: "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1920&h=1080&fit=crop",
    metadata: "stellar dawn",
    type: 'image'
  },
  {
    id: 9,
    artworkUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop",
    metadata: "human connection",
    type: 'image'
  },
  {
    id: 10,
    artworkUrl: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1920&h=1080&fit=crop",
    metadata: "sky consciousness",
    type: 'image'
  },
  {
    id: 11,
    artworkUrl: level3Vid1,
    metadata: "bootsy funk",
    type: 'video'
  },
  {
    id: 12,
    artworkUrl: level3Img1,
    metadata: "love blind earth",
    type: 'image'
  },
  {
    id: 13,
    artworkUrl: level3Vid2,
    metadata: "visual journey",
    type: 'video'
  }
];
