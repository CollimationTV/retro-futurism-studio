import level3Vid1 from "@/assets/level3-vid1.mp4";
import level3Img1 from "@/assets/level3-img1.jpg";
import level3Vid2 from "@/assets/level3-vid2.mp4";
import level3Vid3 from "@/assets/level3-vid3.mp4";
import level3Img2 from "@/assets/level3-img2.png";
import level3Vid4 from "@/assets/level3-vid4.mp4";
import malcolmTravelHub from "@/assets/malcolm-travel-hub.png";
import malcolmPathways from "@/assets/malcolm-pathways.png";
import malcolmHarvest from "@/assets/malcolm-harvest.png";
import malcolmAiPartnership from "@/assets/malcolm-ai-partnership.png";
import malcolmSkyBar from "@/assets/malcolm-sky-bar.png";
import malcolmHologram from "@/assets/malcolm-hologram.png";
import malcolmCommunity from "@/assets/malcolm-community.png";
import malcolmEducation from "@/assets/malcolm-education.png";

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
    artworkUrl: level3Img2,
    metadata: "Malcolm Williams",
    type: 'image'
  },
  {
    id: 6,
    artworkUrl: level3Vid4,
    metadata: "Renata Whedbee - Reverence in Red",
    type: 'video'
  },
  {
    id: 7,
    artworkUrl: malcolmTravelHub,
    metadata: "Malcolm Williams - Travel Hub",
    type: 'image'
  },
  {
    id: 8,
    artworkUrl: malcolmPathways,
    metadata: "Malcolm Williams - Luminous Pathways",
    type: 'image'
  },
  {
    id: 9,
    artworkUrl: malcolmHarvest,
    metadata: "Malcolm Williams - Future Harvest",
    type: 'image'
  },
  {
    id: 10,
    artworkUrl: malcolmAiPartnership,
    metadata: "Malcolm Williams - AI Partnership",
    type: 'image'
  },
  {
    id: 11,
    artworkUrl: malcolmSkyBar,
    metadata: "Malcolm Williams - Sky Bar",
    type: 'image'
  },
  {
    id: 12,
    artworkUrl: malcolmHologram,
    metadata: "Malcolm Williams - Hologram Performance",
    type: 'image'
  },
  {
    id: 13,
    artworkUrl: malcolmCommunity,
    metadata: "Malcolm Williams - Community Circle",
    type: 'image'
  },
  {
    id: 14,
    artworkUrl: malcolmEducation,
    metadata: "Malcolm Williams - Future Education",
    type: 'image'
  }
];
