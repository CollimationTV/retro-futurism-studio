import level3Vid1 from "@/assets/level3-vid1.mp4";
import level3Img1 from "@/assets/level3-img1.jpg";
import level3Vid2 from "@/assets/level3-vid2.mp4";

/**
 * Artwork and audio track pairings for Level 3
 * Only unique artworks - no duplicates
 */

export interface ArtworkAudioPair {
  id: number;
  artworkUrl: string;
  metadata: string;
  type?: 'image' | 'video';
  audioUrl?: string;
}

// Only using uploaded Level 3 assets - 3 unique artworks available
export const artworkAudioPairs: ArtworkAudioPair[] = [
  {
    id: 1,
    artworkUrl: level3Vid1,
    metadata: "bootsy funk",
    type: 'video'
  },
  {
    id: 2,
    artworkUrl: level3Img1,
    metadata: "love blind earth",
    type: 'image'
  },
  {
    id: 3,
    artworkUrl: level3Vid2,
    metadata: "visual journey",
    type: 'video'
  }
];
