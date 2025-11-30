import level1Img1 from "@/assets/level1-img1.png";
import level1Img2 from "@/assets/level1-img2.png";
import level1Img3 from "@/assets/level1-img3.jpg";
import level1Img4 from "@/assets/level1-img4.jpg";
import level1Img5 from "@/assets/level1-img5.jpg";
import level1Img6 from "@/assets/level1-img6.jpg";
import level1Img7 from "@/assets/level1-img7.png";
import level1Img8 from "@/assets/level1-img8.png";
import level1Img9 from "@/assets/level1-img9.png";

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
  metadata: [string, string, string]; // Exactly 3 metadata tags
}

export const level1Images: ImageData[] = [
  { id: 1, url: level1Img1, metadata: ["sustainable agriculture", "vertical farming", "green technology"] },
  { id: 2, url: level1Img2, metadata: ["hydroponic systems", "clean agriculture", "indoor farming"] },
  { id: 3, url: level1Img3, metadata: ["eco city", "sustainable urban", "green skyline"] },
  { id: 4, url: level1Img4, metadata: ["biophilic design", "living buildings", "green walls"] },
  { id: 5, url: level1Img5, metadata: ["urban nature", "city ecosystem", "green infrastructure"] },
  { id: 6, url: level1Img6, metadata: ["community garden", "shared spaces", "social design"] },
  { id: 7, url: level1Img7, metadata: ["interactive design", "smart pathways", "connected spaces"] },
  { id: 8, url: level1Img8, metadata: ["collective farming", "community cultivation", "shared growth"] },
  { id: 9, url: level1Img9, metadata: ["city farming", "rooftop gardens", "urban food production"] },
];

export const level2Images: ImageData[] = [
  { id: 10, url: level2Img1, metadata: ["afrofuturistic hub", "community gathering", "illuminated design"] },
  { id: 11, url: level2Img2, metadata: ["interactive pathways", "smart walkways", "connected spaces"] },
  { id: 12, url: level2Img3, metadata: ["vertical farming", "sustainable agriculture", "green technology"] },
  { id: 13, url: level2Img4, metadata: ["AI partnership", "human collaboration", "benevolent technology"] },
  { id: 14, url: level2Img5, metadata: ["holographic music", "digital performance", "cultural connection"] },
  { id: 15, url: level2Img6, metadata: ["immersive experience", "artistic hologram", "technological art"] },
  { id: 16, url: level2Img7, metadata: ["shared knowledge", "community learning", "floating technology"] },
  { id: 17, url: level2Img8, metadata: ["future education", "interactive learning", "immersive tech"] },
  { id: 18, url: level2Img9, metadata: ["gravity transport", "pod travel", "collaborative space"] },
];
