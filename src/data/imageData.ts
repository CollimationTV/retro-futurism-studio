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
  title?: string;
  metadata?: string[];
}

export const level1Images: ImageData[] = [
  { id: 1, url: level1Img1, title: "Sustainable Harvesting", metadata: ["sustainable", "agriculture", "vertical farming", "green technology", "future food"] },
  { id: 2, url: level1Img2, title: "Hydration Farm", metadata: ["hydroponic", "water systems", "clean agriculture", "indoor farming", "modern cultivation"] },
  { id: 3, url: level1Img3, title: "Futuristic Ecocity", metadata: ["eco city", "sustainable urban", "green skyline", "future architecture", "environmental design"] },
  { id: 4, url: level1Img4, title: "Green Architecture", metadata: ["biophilic design", "living buildings", "green walls", "sustainable structures", "nature integration"] },
  { id: 5, url: level1Img5, title: "Urban Ecosystem", metadata: ["urban nature", "city ecosystem", "green infrastructure", "biodiversity", "ecological balance"] },
  { id: 6, url: level1Img6, title: "Community Space", metadata: ["community garden", "shared spaces", "social design", "collaborative environment", "public gathering"] },
  { id: 7, url: level1Img7, title: "Interactive Pathways", metadata: ["interactive design", "smart pathways", "connected spaces", "digital integration", "experiential architecture"] },
  { id: 8, url: level1Img8, title: "Garden Collective", metadata: ["collective farming", "community cultivation", "shared growth", "cooperative agriculture", "group sustainability"] },
  { id: 9, url: level1Img9, title: "Urban Agriculture", metadata: ["city farming", "rooftop gardens", "urban food production", "localized agriculture", "metropolitan cultivation"] },
];

export const level2Images: ImageData[] = [
  { id: 10, url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=450&fit=crop", title: "Solar Energy Grid", metadata: ["solar power", "renewable energy", "clean electricity", "photovoltaic", "sustainable power grid"] },
  { id: 11, url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop", title: "Smart City Network", metadata: ["smart city", "IoT network", "connected infrastructure", "digital city", "intelligent systems"] },
  { id: 12, url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&h=450&fit=crop", title: "Aerial City View", metadata: ["aerial perspective", "urban sprawl", "city planning", "metropolitan", "bird's eye view"] },
  { id: 13, url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=450&fit=crop", title: "Mountain Cityscape", metadata: ["mountain city", "alpine urban", "elevated development", "scenic architecture", "natural setting"] },
  { id: 14, url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=450&fit=crop", title: "Coastal Development", metadata: ["coastal city", "waterfront", "ocean proximity", "maritime urban", "seaside architecture"] },
  { id: 15, url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=450&fit=crop", title: "Open Landscapes", metadata: ["open space", "natural landscape", "wilderness", "untouched nature", "expansive terrain"] },
  { id: 16, url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop", title: "Natural Integration", metadata: ["nature blend", "environmental harmony", "ecosystem integration", "balanced development", "natural coexistence"] },
  { id: 17, url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=450&fit=crop", title: "Valley Community", metadata: ["valley settlement", "rural community", "countryside", "pastoral living", "natural basin"] },
  { id: 18, url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=450&fit=crop", title: "Forest Preserve", metadata: ["forest conservation", "woodland protection", "natural reserve", "tree canopy", "environmental preservation"] },
];
