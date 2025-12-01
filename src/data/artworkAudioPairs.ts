import level3Vid1 from "@/assets/level3-vid1.mp4";
import level3Img1 from "@/assets/level3-img1.jpg";
import level3Vid2 from "@/assets/level3-vid2.mp4";

/**
 * Artwork and audio track pairings for Level 3
 * 7 artworks, each displayed for 20 seconds
 */

export interface ArtworkAudioPair {
  id: number;
  artworkUrl: string;
  metadata: string; // Single metadata tag
  type?: 'image' | 'video';
  audioUrl?: string;
}

// Only using uploaded Level 3 assets - currently 3 available
// TODO: Add 4 more artworks when uploaded
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
  },
  // Placeholder entries - replace with uploaded artworks
  {
    id: 4,
    artworkUrl: level3Vid1,
    metadata: "cosmic pulse",
    type: 'video'
  },
  {
    id: 5,
    artworkUrl: level3Img1,
    metadata: "earth awakening",
    type: 'image'
  },
  {
    id: 6,
    artworkUrl: level3Vid2,
    metadata: "future harmony",
    type: 'video'
  },
  {
    id: 7,
    artworkUrl: level3Vid1,
    metadata: "collective dream",
    type: 'video'
  }
];
