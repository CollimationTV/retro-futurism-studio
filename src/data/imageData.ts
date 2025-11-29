import level1Img1 from "@/assets/level1-img1.png";
import level1Img2 from "@/assets/level1-img2.png";
import level1Img3 from "@/assets/level1-img3.jpg";
import level1Img4 from "@/assets/level1-img4.jpg";
import level1Img5 from "@/assets/level1-img5.jpg";
import level1Img6 from "@/assets/level1-img6.jpg";
import level1Img7 from "@/assets/level1-img7.png";
import level1Img8 from "@/assets/level1-img8.png";
import level1Img9 from "@/assets/level1-img9.png";

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
  { id: 10, url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=450&fit=crop", metadata: ["solar power", "renewable energy", "clean electricity"] },
  { id: 11, url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop", metadata: ["smart city", "IoT network", "connected infrastructure"] },
  { id: 12, url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&h=450&fit=crop", metadata: ["aerial perspective", "urban sprawl", "city planning"] },
  { id: 13, url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=450&fit=crop", metadata: ["mountain city", "alpine urban", "elevated development"] },
  { id: 14, url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=450&fit=crop", metadata: ["coastal city", "waterfront", "ocean proximity"] },
  { id: 15, url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=450&fit=crop", metadata: ["open space", "natural landscape", "wilderness"] },
  { id: 16, url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop", metadata: ["nature blend", "environmental harmony", "ecosystem integration"] },
  { id: 17, url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=450&fit=crop", metadata: ["valley settlement", "rural community", "countryside"] },
  { id: 18, url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=450&fit=crop", metadata: ["forest conservation", "woodland protection", "natural reserve"] },
];
