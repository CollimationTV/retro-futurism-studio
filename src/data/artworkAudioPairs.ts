/**
 * Artwork and audio track pairings for Level 3
 * Each artwork has an associated song that plays during display
 */

export interface ArtworkAudioPair {
  id: number;
  artworkUrl: string;
  artworkTitle: string;
  audioUrl: string;
  audioTitle: string;
}

export const artworkAudioPairs: ArtworkAudioPair[] = [
  {
    id: 1,
    artworkUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop",
    artworkTitle: "Earth's Heartbeat",
    audioUrl: "/audio/track-1.mp3",
    audioTitle: "Cosmic Pulse"
  },
  {
    id: 2,
    artworkUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop",
    artworkTitle: "Cosmic Genesis",
    audioUrl: "/audio/track-2.mp3",
    audioTitle: "Stellar Dawn"
  },
  {
    id: 3,
    artworkUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&h=1080&fit=crop",
    artworkTitle: "Ocean's Breath",
    audioUrl: "/audio/track-3.mp3",
    audioTitle: "Aquatic Dreams"
  },
  {
    id: 4,
    artworkUrl: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1920&h=1080&fit=crop",
    artworkTitle: "Forest Consciousness",
    audioUrl: "/audio/track-4.mp3",
    audioTitle: "Nature's Rhythm"
  },
  {
    id: 5,
    artworkUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1920&h=1080&fit=crop",
    artworkTitle: "Unity Wave",
    audioUrl: "/audio/track-5.mp3",
    audioTitle: "Collective Harmony"
  },
  {
    id: 6,
    artworkUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&h=1080&fit=crop",
    artworkTitle: "Mountain Energy",
    audioUrl: "/audio/track-6.mp3",
    audioTitle: "Peak Resonance"
  },
  {
    id: 7,
    artworkUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1920&h=1080&fit=crop",
    artworkTitle: "Emotional Tide",
    audioUrl: "/audio/track-7.mp3",
    audioTitle: "Wave of Emotion"
  },
  {
    id: 8,
    artworkUrl: "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1920&h=1080&fit=crop",
    artworkTitle: "Stellar Dawn",
    audioUrl: "/audio/track-8.mp3",
    audioTitle: "Sunrise Symphony"
  },
  {
    id: 9,
    artworkUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop",
    artworkTitle: "Human Connection",
    audioUrl: "/audio/track-9.mp3",
    audioTitle: "Unity Chorus"
  },
  {
    id: 10,
    artworkUrl: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1920&h=1080&fit=crop",
    artworkTitle: "Sky Consciousness",
    audioUrl: "/audio/track-10.mp3",
    audioTitle: "Ethereal Flight"
  }
];
