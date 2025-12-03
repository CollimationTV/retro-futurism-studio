import artwork03_3 from "@/assets/artwork-03_3-2.mp4";
import reverenceInRed from "@/assets/reverence-in-red.mp4";
import loveIsBlind from "@/assets/love-is-blind.jpg";
import spongebob from "@/assets/spongebob.mp4";
import bootsy from "@/assets/bootsy.mp4";

export interface ImageData {
  id: number;
  url: string;
  metadata: string;
}

// Single level - artwork selection with unique artworks
export const level1Images: ImageData[] = [
  { id: 1, url: bootsy, metadata: "Bootsy Collins" },
  { id: 2, url: artwork03_3, metadata: "future vision" },
  { id: 3, url: reverenceInRed, metadata: "Reverence in Red" },
  { id: 4, url: loveIsBlind, metadata: "Love is Blind" },
  { id: 5, url: spongebob, metadata: "King Wilonius" },
  { id: 6, url: bootsy, metadata: "Bootsy Collins" },
  { id: 7, url: artwork03_3, metadata: "hopeful humanity" },
  { id: 8, url: reverenceInRed, metadata: "Renata Whedbee" },
];
