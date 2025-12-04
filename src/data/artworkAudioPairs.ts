import level3Vid1 from "@/assets/level3-vid1.mp4";
import level3Img1 from "@/assets/level3-img1.jpg";
import level3Vid2 from "@/assets/level3-vid2.mp4";
import level3Vid3 from "@/assets/level3-vid3.mp4";
import artwork03_3 from "@/assets/artwork-03_3-2.mp4";
import level3Vid4 from "@/assets/level3-vid4.mp4";

/**
 * Artwork and audio track pairings for Level 3
 * Only unique artworks - no duplicates
 * Metadata shows artist names
 */

export interface ArtworkAudioPair {
  id: number;
  artworkUrl: string;
  metadata: string;
  type?: 'image' | 'video';
  audioUrl?: string;
}

export const artworkAudioPairs: ArtworkAudioPair[] = [
  {
    id: 1,
    artworkUrl: level3Vid1,
    metadata: "Dan Lish, Bootsy Collins, Collimation",
    type: 'video'
  },
  {
    id: 2,
    artworkUrl: level3Img1,
    metadata: "TYMED",
    type: 'image'
  },
  {
    id: 3,
    artworkUrl: level3Vid2,
    metadata: "visual journey",
    type: 'video'
  },
  {
    id: 4,
    artworkUrl: level3Vid3,
    metadata: "King Wilonius",
    type: 'video'
  },
  {
    id: 5,
    artworkUrl: artwork03_3,
    metadata: "Malcolm Williams",
    type: 'video'
  },
  {
    id: 6,
    artworkUrl: level3Vid4,
    metadata: "Renata Whedbee - Reverence in Red",
    type: 'video'
  }
];
