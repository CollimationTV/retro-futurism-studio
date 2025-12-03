import artworkVideo from "@/assets/artwork-03_3.mp4";

export interface ImageData {
  id: number;
  url: string;
  metadata: string;
}

// Single level - artwork selection (replaces old Level 1 and Level 2)
export const level1Images: ImageData[] = [
  { id: 1, url: artworkVideo, metadata: "future vision" },
  { id: 2, url: artworkVideo, metadata: "hopeful humanity" },
  { id: 3, url: artworkVideo, metadata: "sustainable world" },
  { id: 4, url: artworkVideo, metadata: "collective harmony" },
  { id: 5, url: artworkVideo, metadata: "nature integration" },
  { id: 6, url: artworkVideo, metadata: "clean energy" },
  { id: 7, url: artworkVideo, metadata: "utopian design" },
  { id: 8, url: artworkVideo, metadata: "advanced technology" },
];
