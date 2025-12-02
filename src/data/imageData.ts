import level1Vid1 from "@/assets/level1-vid1.mp4";
import level1Vid2 from "@/assets/level1-vid2.mp4";
import level1Vid3 from "@/assets/level1-vid3.mp4";
import level1Vid4 from "@/assets/level1-vid4.mp4";
import level1Vid5 from "@/assets/level1-vid5.mp4";
import level1Vid6 from "@/assets/level1-vid6.mp4";
import level1Vid7 from "@/assets/level1-vid7.mp4";
import level1Vid8 from "@/assets/level1-vid8.mp4";

import level2Img1 from "@/assets/level2-img1.png";
import level2Img2 from "@/assets/level2-img2.png";
import level2Img3 from "@/assets/level2-img3.png";
import level2Img4 from "@/assets/level2-img4.png";
import level2Img5 from "@/assets/level2-img5.png";
import level2Img6 from "@/assets/level2-img6.png";
import level2Img7 from "@/assets/level2-img7.png";
import level2Img8 from "@/assets/level2-img8.png";
import level2Img9 from "@/assets/level2-img9.png";

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
  { id: 10, url: level2Img1, metadata: "afrofuturistic hub" },
  { id: 11, url: level2Img2, metadata: "interactive pathways" },
  { id: 12, url: level2Img3, metadata: "vertical farming" },
  { id: 13, url: level2Img4, metadata: "AI partnership" },
  { id: 14, url: level2Img5, metadata: "holographic music" },
  { id: 15, url: level2Img6, metadata: "immersive experience" },
  { id: 16, url: level2Img7, metadata: "shared knowledge" },
  { id: 17, url: level2Img8, metadata: "future education" },
];
