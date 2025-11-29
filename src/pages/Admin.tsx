import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, ImageIcon, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageRecord {
  id: string;
  level: number;
  position: number;
  url: string;
  metadata_tag_1: string;
  metadata_tag_2: string;
  metadata_tag_3: string;
}

interface VideoRecord {
  id: string;
  title: string;
  url: string;
  metadata_tag_1: string;
  metadata_tag_2: string;
  metadata_tag_3: string;
  is_active: boolean;
}

const Admin = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [imagesResult, videosResult] = await Promise.all([
        supabase.from('images').select('*').order('level').order('position'),
        supabase.from('videos').select('*').order('created_at', { ascending: false })
      ]);

      if (imagesResult.error) throw imagesResult.error;
      if (videosResult.error) throw videosResult.error;

      setImages(imagesResult.data || []);
      setVideos(videosResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = async (image: ImageRecord) => {
    try {
      const { error } = await supabase
        .from('images')
        .upsert({
          id: image.id,
          level: image.level,
          position: image.position,
          url: image.url,
          metadata_tag_1: image.metadata_tag_1,
          metadata_tag_2: image.metadata_tag_2,
          metadata_tag_3: image.metadata_tag_3
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image updated successfully"
      });
      loadData();
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive"
      });
    }
  };

  const handleImageDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('images').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Image deleted successfully"
      });
      loadData();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      });
    }
  };

  const handleVideoUpdate = async (video: VideoRecord) => {
    try {
      const { error } = await supabase
        .from('videos')
        .upsert({
          id: video.id,
          title: video.title,
          url: video.url,
          metadata_tag_1: video.metadata_tag_1,
          metadata_tag_2: video.metadata_tag_2,
          metadata_tag_3: video.metadata_tag_3,
          is_active: video.is_active
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video updated successfully"
      });
      loadData();
    } catch (error) {
      console.error('Error updating video:', error);
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive"
      });
    }
  };

  const handleVideoDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Video deleted successfully"
      });
      loadData();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive"
      });
    }
  };

  const addNewImage = () => {
    const newImage: ImageRecord = {
      id: crypto.randomUUID(),
      level: selectedLevel,
      position: images.filter(img => img.level === selectedLevel).length + 1,
      url: '',
      metadata_tag_1: '',
      metadata_tag_2: '',
      metadata_tag_3: ''
    };
    setImages([...images, newImage]);
  };

  const addNewVideo = () => {
    const newVideo: VideoRecord = {
      id: crypto.randomUUID(),
      title: '',
      url: '',
      metadata_tag_1: '',
      metadata_tag_2: '',
      metadata_tag_3: '',
      is_active: true
    };
    setVideos([...videos, newVideo]);
  };

  const levelImages = images.filter(img => img.level === selectedLevel);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Admin Panel
          </h1>
          <p className="text-muted-foreground">Manage images, artwork, and videos</p>
        </div>

        <Tabs defaultValue="images" className="space-y-6">
          <TabsList>
            <TabsTrigger value="images" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Images & Artwork
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-6">
            <div className="flex gap-2 mb-4">
              <Button
                variant={selectedLevel === 1 ? "default" : "outline"}
                onClick={() => setSelectedLevel(1)}
              >
                Level 1: Landscapes
              </Button>
              <Button
                variant={selectedLevel === 2 ? "default" : "outline"}
                onClick={() => setSelectedLevel(2)}
              >
                Level 2: Elements
              </Button>
              <Button
                variant={selectedLevel === 3 ? "default" : "outline"}
                onClick={() => setSelectedLevel(3)}
              >
                Level 3: Artworks
              </Button>
            </div>

            <Button onClick={addNewImage} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Image
            </Button>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <div className="space-y-4">
                {levelImages.map((image) => (
                  <Card key={image.id} className="p-6">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Position</Label>
                          <Input
                            type="number"
                            value={image.position}
                            onChange={(e) => {
                              const updated = images.map(img =>
                                img.id === image.id
                                  ? { ...img, position: parseInt(e.target.value) }
                                  : img
                              );
                              setImages(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Image URL</Label>
                          <Input
                            value={image.url}
                            onChange={(e) => {
                              const updated = images.map(img =>
                                img.id === image.id ? { ...img, url: e.target.value } : img
                              );
                              setImages(updated);
                            }}
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Metadata Tag 1</Label>
                          <Input
                            value={image.metadata_tag_1}
                            onChange={(e) => {
                              const updated = images.map(img =>
                                img.id === image.id
                                  ? { ...img, metadata_tag_1: e.target.value }
                                  : img
                              );
                              setImages(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Metadata Tag 2</Label>
                          <Input
                            value={image.metadata_tag_2}
                            onChange={(e) => {
                              const updated = images.map(img =>
                                img.id === image.id
                                  ? { ...img, metadata_tag_2: e.target.value }
                                  : img
                              );
                              setImages(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Metadata Tag 3</Label>
                          <Input
                            value={image.metadata_tag_3}
                            onChange={(e) => {
                              const updated = images.map(img =>
                                img.id === image.id
                                  ? { ...img, metadata_tag_3: e.target.value }
                                  : img
                              );
                              setImages(updated);
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleImageUpdate(image)}
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          onClick={() => handleImageDelete(image.id)}
                          variant="destructive"
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <Button onClick={addNewVideo} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Video
            </Button>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <Card key={video.id} className="p-6">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={video.title}
                            onChange={(e) => {
                              const updated = videos.map(v =>
                                v.id === video.id ? { ...v, title: e.target.value } : v
                              );
                              setVideos(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Video URL</Label>
                          <Input
                            value={video.url}
                            onChange={(e) => {
                              const updated = videos.map(v =>
                                v.id === video.id ? { ...v, url: e.target.value } : v
                              );
                              setVideos(updated);
                            }}
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Metadata Tag 1</Label>
                          <Input
                            value={video.metadata_tag_1}
                            onChange={(e) => {
                              const updated = videos.map(v =>
                                v.id === video.id
                                  ? { ...v, metadata_tag_1: e.target.value }
                                  : v
                              );
                              setVideos(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Metadata Tag 2</Label>
                          <Input
                            value={video.metadata_tag_2}
                            onChange={(e) => {
                              const updated = videos.map(v =>
                                v.id === video.id
                                  ? { ...v, metadata_tag_2: e.target.value }
                                  : v
                              );
                              setVideos(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Metadata Tag 3</Label>
                          <Input
                            value={video.metadata_tag_3}
                            onChange={(e) => {
                              const updated = videos.map(v =>
                                v.id === video.id
                                  ? { ...v, metadata_tag_3: e.target.value }
                                  : v
                              );
                              setVideos(updated);
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVideoUpdate(video)}
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          onClick={() => handleVideoDelete(video.id)}
                          variant="destructive"
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
