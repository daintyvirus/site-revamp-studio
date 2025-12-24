import { useState } from 'react';
import { Plus, Trash2, GripVertical, Star, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductImage {
  id?: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  isNew?: boolean;
}

interface ProductImageGalleryProps {
  productId?: string;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export default function ProductImageGallery({ productId, images, onChange }: ProductImageGalleryProps) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addImage = async () => {
    if (!newImageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    setIsAdding(true);
    try {
      const newImage: ProductImage = {
        image_url: newImageUrl.trim(),
        alt_text: '',
        sort_order: images.length,
        is_primary: images.length === 0,
        isNew: true,
      };

      // If product exists, save to database
      if (productId) {
        const { data, error } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: newImage.image_url,
            alt_text: newImage.alt_text,
            sort_order: newImage.sort_order,
            is_primary: newImage.is_primary,
          })
          .select()
          .single();

        if (error) throw error;
        newImage.id = data.id;
        newImage.isNew = false;
      }

      onChange([...images, newImage]);
      setNewImageUrl('');
      toast.success('Image added');
    } catch (error: any) {
      toast.error(`Failed to add image: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const removeImage = async (index: number) => {
    const image = images[index];
    
    if (image.id && productId) {
      try {
        const { error } = await supabase
          .from('product_images')
          .delete()
          .eq('id', image.id);

        if (error) throw error;
      } catch (error: any) {
        toast.error(`Failed to remove image: ${error.message}`);
        return;
      }
    }

    const newImages = images.filter((_, i) => i !== index);
    
    // If we removed the primary, make the first one primary
    if (image.is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    
    // Re-sort
    newImages.forEach((img, i) => {
      img.sort_order = i;
    });

    onChange(newImages);
    toast.success('Image removed');
  };

  const setPrimary = async (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));

    // Update in database if product exists
    if (productId) {
      try {
        for (const img of newImages) {
          if (img.id) {
            await supabase
              .from('product_images')
              .update({ is_primary: img.is_primary })
              .eq('id', img.id);
          }
        }
      } catch (error: any) {
        toast.error(`Failed to update primary image: ${error.message}`);
        return;
      }
    }

    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    
    // Update sort order
    newImages.forEach((img, i) => {
      img.sort_order = i;
    });

    onChange(newImages);
  };

  return (
    <Card className="border-accent/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-accent" />
          <CardTitle className="text-base">Product Images</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Add multiple images. Click the star to set as primary image.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Image Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter image URL..."
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addImage()}
          />
          <Button type="button" onClick={addImage} disabled={isAdding}>
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>

        {/* Image Grid */}
        {images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No images added yet</p>
            <p className="text-xs">Add images using URLs above</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {images.map((image, index) => (
              <div
                key={image.id || index}
                className={cn(
                  "relative group rounded-lg border overflow-hidden bg-muted aspect-square",
                  image.is_primary && "ring-2 ring-primary"
                )}
              >
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                
                {/* Primary Badge */}
                {image.is_primary && (
                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                    Primary
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!image.is_primary && (
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => setPrimary(index)}
                      title="Set as primary"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort Order */}
                <div className="absolute bottom-1 right-1 bg-background/80 text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {images.length} image{images.length !== 1 ? 's' : ''} • Primary image is used as main product image
          </p>
        )}
      </CardContent>
    </Card>
  );
}
