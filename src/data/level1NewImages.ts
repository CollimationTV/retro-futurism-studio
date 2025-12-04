import skyBar from "@/assets/level1-sky-bar.png";
import hologram from "@/assets/level1-hologram.png";
import education from "@/assets/level1-education.png";
import transport from "@/assets/level1-transport.png";
import travelHub from "@/assets/level1-travel-hub.png";
import pathways from "@/assets/level1-pathways.png";
import harvest from "@/assets/level1-harvest.png";
import aiPartnership from "@/assets/level1-ai-partnership.png";

export interface Level1ImageData {
  id: number;
  url: string;
  metadata: string;
}

export const level1NewImages: Level1ImageData[] = [
  { id: 1, url: skyBar, metadata: "floating sky bar, clouds, serene dining" },
  { id: 2, url: hologram, metadata: "hologram performance, music, connection" },
  { id: 3, url: education, metadata: "futuristic education, learning, youth" },
  { id: 4, url: transport, metadata: "gravity-glide transport, travel, reading" },
  { id: 5, url: travelHub, metadata: "afro-futuristic travel hub, bioluminescent" },
  { id: 6, url: pathways, metadata: "illuminated pathways, walking, night" },
  { id: 7, url: harvest, metadata: "vertical farming, harvest, sustainable" },
  { id: 8, url: aiPartnership, metadata: "AI partnership, co-creation, art" },
];
