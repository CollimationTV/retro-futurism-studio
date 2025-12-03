import level1Vid1 from "@/assets/level1-vid1.mp4";
import level1Vid2 from "@/assets/level1-vid2.mp4";
import level1Vid3 from "@/assets/level1-vid3.mp4";
import level1Vid4 from "@/assets/level1-vid4.mp4";
import level1Vid5 from "@/assets/level1-vid5.mp4";
import level1Vid6 from "@/assets/level1-vid6.mp4";
import level1Vid7 from "@/assets/level1-vid7.mp4";
import level1Vid8 from "@/assets/level1-vid8.mp4";

import malcolmTravelHub from "@/assets/malcolm-travel-hub.png";
import malcolmPathways from "@/assets/malcolm-pathways.png";
import malcolmHarvest from "@/assets/malcolm-harvest.png";
import malcolmAiPartnership from "@/assets/malcolm-ai-partnership.png";
import malcolmSkyBar from "@/assets/malcolm-sky-bar.png";
import malcolmHologram from "@/assets/malcolm-hologram.png";
import malcolmCommunity from "@/assets/malcolm-community.png";
import malcolmEducation from "@/assets/malcolm-education.png";

export interface ImageData {
  id: number;
  url: string;
  metadata: string; // Single metadata tag
}

export const level1Images: ImageData[] = [
  { id: 1, url: level1Vid1, metadata: "sustainable agriculture" },
  { id: 2, url: level1Vid2, metadata: "hydroponic systems" },
  { id: 3, url: level1Vid3, metadata: "eco city" },
  { id: 4, url: level1Vid4, metadata: "biophilic design" },
  { id: 5, url: level1Vid5, metadata: "urban nature" },
  { id: 6, url: level1Vid6, metadata: "community garden" },
  { id: 7, url: level1Vid7, metadata: "interactive design" },
  { id: 8, url: level1Vid8, metadata: "collective farming" },
];

export const level2Images: ImageData[] = [
  { id: 10, url: malcolmTravelHub, metadata: "afrofuturistic travel hub" },
  { id: 11, url: malcolmPathways, metadata: "luminous pathways" },
  { id: 12, url: malcolmHarvest, metadata: "future harvest" },
  { id: 13, url: malcolmAiPartnership, metadata: "AI partnership" },
  { id: 14, url: malcolmSkyBar, metadata: "sky bar" },
  { id: 15, url: malcolmHologram, metadata: "hologram performance" },
  { id: 16, url: malcolmCommunity, metadata: "community circle" },
  { id: 17, url: malcolmEducation, metadata: "future education" },
];
