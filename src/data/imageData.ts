import comfyVid1 from "@/assets/comfyui-vid1.mp4";
import comfyVid2 from "@/assets/comfyui-vid2.mp4";
import comfyVid3 from "@/assets/comfyui-vid3.mp4";
import comfyVid4 from "@/assets/comfyui-vid4.mp4";
import comfyVid5 from "@/assets/comfyui-vid5.mp4";
import comfyVid6 from "@/assets/comfyui-vid6.mp4";
import comfyVid7 from "@/assets/comfyui-vid7.mp4";
import comfyVid8 from "@/assets/comfyui-vid8.mp4";

export interface ImageData {
  id: number;
  url: string;
  metadata: string;
}

// Single level - artwork selection
export const level1Images: ImageData[] = [
  { id: 1, url: comfyVid1, metadata: "future vision" },
  { id: 2, url: comfyVid2, metadata: "hopeful humanity" },
  { id: 3, url: comfyVid3, metadata: "sustainable world" },
  { id: 4, url: comfyVid4, metadata: "collective harmony" },
  { id: 5, url: comfyVid5, metadata: "nature integration" },
  { id: 6, url: comfyVid6, metadata: "clean energy" },
  { id: 7, url: comfyVid7, metadata: "utopian design" },
  { id: 8, url: comfyVid8, metadata: "advanced technology" },
];
