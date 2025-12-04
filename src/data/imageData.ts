import level1Vid1 from "@/assets/level1-vid1.mp4";
import level1Vid2 from "@/assets/level1-vid2.mp4";
import level1Vid3 from "@/assets/level1-vid3.mp4";
import level1Vid4 from "@/assets/level1-vid4.mp4";
import level1Vid5 from "@/assets/level1-vid5.mp4";
import level1Vid6 from "@/assets/level1-vid6.mp4";
import level1Vid7 from "@/assets/level1-vid7.mp4";
import level1Vid8 from "@/assets/level1-vid8.mp4";

export interface ImageData {
  id: number;
  url: string;
  metadata: string;
}

// Single level - artwork selection
export const level1Images: ImageData[] = [
  { id: 1, url: level1Vid1, metadata: "future vision" },
  { id: 2, url: level1Vid2, metadata: "hopeful humanity" },
  { id: 3, url: level1Vid3, metadata: "sustainable world" },
  { id: 4, url: level1Vid4, metadata: "collective harmony" },
  { id: 5, url: level1Vid5, metadata: "nature integration" },
  { id: 6, url: level1Vid6, metadata: "clean energy" },
  { id: 7, url: level1Vid7, metadata: "utopian design" },
  { id: 8, url: level1Vid8, metadata: "advanced technology" },
];
