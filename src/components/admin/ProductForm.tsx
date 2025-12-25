import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories, useBrands, useCreateProduct, useUpdateProduct, useCreateVariant, useUpdateVariant, useDeleteVariant } from '@/hooks/useProducts';
import type { Product, ProductVariant, ProductImage } from '@/types/database';
import { toast } from 'sonner';
import { Clock, Zap, CalendarIcon, Plus, Trash2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductImageGallery from './ProductImageGallery';
import { supabase } from '@/integrations/supabase/client';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  price_bdt: z.coerce.number().min(0, 'BDT Price must be positive'),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  sale_price_bdt: z.coerce.number().min(0).optional().nullable(),
  image_url: z.string().url().optional().or(z.literal('')),
  category_id: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  flash_sale_enabled: z.boolean(),
  sale_start_date: z.string().optional().nullable(),
  sale_end_date: z.string().optional().nullable(),
  digiseller_id: z.coerce.number().int().optional().nullable(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface VariantFormData {
  id?: string;
  name: string;
  price: number;
  price_bdt: number;
  sale_price: number | null;
  sale_price_bdt: number | null;
  stock: number;
  digiseller_id: number | null;
  isNew?: boolean;
}

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize variants from product
  const [variants, setVariants] = useState<VariantFormData[]>(
    product?.variants?.map(v => ({
      id: v.id,
      name: v.name,
      price: v.price,
      price_bdt: v.price_bdt ?? 0,
      sale_price: v.sale_price,
      sale_price_bdt: v.sale_price_bdt,
      stock: v.stock,
      digiseller_id: (v as any).digiseller_id ?? null,
    })) ?? []
  );

  // Initialize images
  const [images, setImages] = useState<Array<{
    id?: string;
    image_url: string;
    alt_text: string;
    sort_order: number;
    is_primary: boolean;
    isNew?: boolean;
  }>>([]);

  // Load images when editing
  useEffect(() => {
    if (product?.id) {
      loadProductImages(product.id);
    }
  }, [product?.id]);

  const loadProductImages = async (productId: string) => {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order');
    
    if (!error && data) {
      setImages(data.map(img => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        sort_order: img.sort_order,
        is_primary: img.is_primary,
      })));
    }
  };

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      short_description: product?.short_description ?? '',
      price: product?.price ?? 0,
      price_bdt: product?.price_bdt ?? 0,
      sale_price: product?.sale_price ?? null,
      sale_price_bdt: product?.sale_price_bdt ?? null,
      image_url: product?.image_url ?? '',
      category_id: product?.category_id ?? null,
      brand_id: product?.brand_id ?? null,
      stock: product?.stock ?? 0,
      is_featured: product?.is_featured ?? false,
      is_active: product?.is_active ?? true,
      flash_sale_enabled: product?.flash_sale_enabled ?? false,
      sale_start_date: product?.sale_start_date ?? null,
      sale_end_date: product?.sale_end_date ?? null,
      digiseller_id: (product as any)?.digiseller_id ?? null,
    },
  });

  const flashSaleEnabled = watch('flash_sale_enabled');
  const saleStartDate = watch('sale_start_date');
  const saleEndDate = watch('sale_end_date');
  
  const [startTime, setStartTime] = useState(
    product?.sale_start_date ? format(new Date(product.sale_start_date), 'HH:mm') : '00:00'
  );
  const [endTime, setEndTime] = useState(
    product?.sale_end_date ? format(new Date(product.sale_end_date), 'HH:mm') : '23:59'
  );

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = startTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      setValue('sale_start_date', date.toISOString());
    } else {
      setValue('sale_start_date', null);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = endTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      setValue('sale_end_date', date.toISOString());
    } else {
      setValue('sale_end_date', null);
    }
  };

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    if (saleStartDate) {
      const date = new Date(saleStartDate);
      const [hours, minutes] = time.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      setValue('sale_start_date', date.toISOString());
    }
  };

  const handleEndTimeChange = (time: string) => {
    setEndTime(time);
    if (saleEndDate) {
      const date = new Date(saleEndDate);
      const [hours, minutes] = time.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      setValue('sale_end_date', date.toISOString());
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  // Variant management
  const addVariant = () => {
    setVariants([...variants, {
      name: '',
      price: 0,
      price_bdt: 0,
      sale_price: null,
      sale_price_bdt: null,
      stock: 0,
      digiseller_id: null,
      isNew: true,
    }]);
  };

  const updateVariantField = (index: number, field: keyof VariantFormData, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = async (index: number) => {
    const variant = variants[index];
    if (variant.id && !variant.isNew) {
      try {
        await deleteVariant.mutateAsync(variant.id);
        toast.success('Variant deleted');
      } catch (error) {
        toast.error('Failed to delete variant');
        return;
      }
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Get primary image from gallery, or use the image_url field
      const primaryImage = images.find(img => img.is_primary);
      const mainImageUrl = primaryImage?.image_url || data.image_url || null;

      const productData = {
        name: data.name,
        slug: data.slug,
        price: data.price,
        price_bdt: data.price_bdt,
        description: data.description,
        short_description: data.short_description,
        stock: data.stock,
        is_featured: data.is_featured,
        is_active: data.is_active,
        sale_price: data.sale_price || null,
        sale_price_bdt: data.sale_price_bdt || null,
        image_url: mainImageUrl,
        category_id: data.category_id || null,
        brand_id: data.brand_id || null,
        flash_sale_enabled: data.flash_sale_enabled,
        sale_start_date: data.sale_start_date ? new Date(data.sale_start_date).toISOString() : null,
        sale_end_date: data.sale_end_date ? new Date(data.sale_end_date).toISOString() : null,
        digiseller_id: data.digiseller_id || null,
      };

      let productId = product?.id;

      if (product) {
        await updateProduct.mutateAsync({ id: product.id, ...productData });
      } else {
        const newProduct = await createProduct.mutateAsync(productData);
        productId = newProduct.id;

        // Save new images for new product
        if (productId && images.length > 0) {
          for (const img of images) {
            if (img.isNew) {
              await supabase.from('product_images').insert({
                product_id: productId,
                image_url: img.image_url,
                alt_text: img.alt_text,
                sort_order: img.sort_order,
                is_primary: img.is_primary,
              });
            }
          }
        }
      }

      // Save variants
      if (productId) {
        for (const variant of variants) {
          if (!variant.name.trim()) continue;
          
          const variantData = {
            product_id: productId,
            name: variant.name,
            price: variant.price,
            price_bdt: variant.price_bdt,
            sale_price: variant.sale_price || null,
            sale_price_bdt: variant.sale_price_bdt || null,
            stock: variant.stock,
            digiseller_id: variant.digiseller_id || null,
          };

          if (variant.id && !variant.isNew) {
            await updateVariant.mutateAsync({ id: variant.id, ...variantData });
          } else if (variant.isNew || !variant.id) {
            await createVariant.mutateAsync(variantData);
          }
        }
      }

      toast.success(product ? 'Product updated' : 'Product created');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            {...register('name')}
            onChange={(e) => {
              register('name').onChange(e);
              if (!product) {
                setValue('slug', generateSlug(e.target.value));
              }
            }}
          />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" {...register('slug')} />
          {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="short_description">Short Description</Label>
        <Input id="short_description" {...register('short_description')} />
      </div>

      <div>
        <Label htmlFor="description">Full Description</Label>
        <Textarea id="description" rows={4} {...register('description')} />
      </div>

      {/* Pricing Section */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            💰 Pricing
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Set prices in both BDT and USD for each product
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_bdt" className="flex items-center gap-1">
                <span className="text-lg">৳</span> BDT Price *
              </Label>
              <Input id="price_bdt" type="number" step="1" {...register('price_bdt')} />
              {errors.price_bdt && <p className="text-sm text-destructive mt-1">{errors.price_bdt.message}</p>}
            </div>

            <div>
              <Label htmlFor="price" className="flex items-center gap-1">
                <span className="text-lg">$</span> USD Price *
              </Label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sale_price_bdt" className="flex items-center gap-1">
                <span className="text-lg">৳</span> Sale Price (BDT)
              </Label>
              <Input id="sale_price_bdt" type="number" step="1" {...register('sale_price_bdt')} />
            </div>

            <div>
              <Label htmlFor="sale_price" className="flex items-center gap-1">
                <span className="text-lg">$</span> Sale Price (USD)
              </Label>
              <Input id="sale_price" type="number" step="0.01" {...register('sale_price')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Images Gallery */}
      <ProductImageGallery
        productId={product?.id}
        images={images}
        onChange={setImages}
      />

      {/* Variants Section */}
      <Card className="border-accent/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              <CardTitle className="text-base">Product Variants</CardTitle>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-1" />
              Add Variant
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Add different options with individual BDT and USD pricing
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No variants added yet</p>
              <p className="text-xs">Click "Add Variant" to create product options</p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Variant {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label className="text-xs">Variant Name *</Label>
                      <Input
                        value={variant.name}
                        onChange={(e) => updateVariantField(index, 'name', e.target.value)}
                        placeholder="e.g., Small, Medium, Large"
                        className="h-9"
                      />
                    </div>

                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <span>৳</span> BDT Price *
                      </Label>
                      <Input
                        type="number"
                        step="1"
                        value={variant.price_bdt}
                        onChange={(e) => updateVariantField(index, 'price_bdt', Number(e.target.value))}
                        className="h-9"
                      />
                    </div>

                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <span>$</span> USD Price *
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => updateVariantField(index, 'price', Number(e.target.value))}
                        className="h-9"
                      />
                    </div>

                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <span>৳</span> Sale Price (BDT)
                      </Label>
                      <Input
                        type="number"
                        step="1"
                        value={variant.sale_price_bdt ?? ''}
                        onChange={(e) => updateVariantField(index, 'sale_price_bdt', e.target.value ? Number(e.target.value) : null)}
                        className="h-9"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <span>$</span> Sale Price (USD)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.sale_price ?? ''}
                        onChange={(e) => updateVariantField(index, 'sale_price', e.target.value ? Number(e.target.value) : null)}
                        className="h-9"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Stock *</Label>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariantField(index, 'stock', Number(e.target.value))}
                        className="h-9"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Digiseller ID</Label>
                      <Input
                        type="number"
                        value={variant.digiseller_id ?? ''}
                        onChange={(e) => updateVariantField(index, 'digiseller_id', e.target.value ? Number(e.target.value) : null)}
                        className="h-9"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flash Sale Section */}
      <Card className="border-dashed border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Flash Sale / Countdown Timer</CardTitle>
            </div>
            <Switch
              checked={watch('flash_sale_enabled')}
              onCheckedChange={(checked) => setValue('flash_sale_enabled', checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enable to show a countdown timer with the sale price on this product
          </p>
        </CardHeader>
        {flashSaleEnabled && (
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Sale Start Date
                </Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !saleStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {saleStartDate ? format(new Date(saleStartDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={saleStartDate ? new Date(saleStartDate) : undefined}
                        onSelect={handleStartDateSelect}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-28"
                  />
                </div>
              </div>
              
              {/* End Date */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Sale End Date *
                </Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !saleEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {saleEndDate ? format(new Date(saleEndDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={saleEndDate ? new Date(saleEndDate) : undefined}
                        onSelect={handleEndDateSelect}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="w-28"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The countdown timer will show time remaining until the sale ends. Make sure to set a sale price above.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Digiseller Integration */}
      <Card className="border-blue-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            🛒 Digiseller Integration
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Link this product to a Digiseller product for direct checkout
          </p>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="digiseller_id">Digiseller Product ID</Label>
            <Input 
              id="digiseller_id" 
              type="number" 
              placeholder="e.g., 1234567"
              {...register('digiseller_id')} 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the product ID from your Digiseller seller account
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" type="url" placeholder="https://..." {...register('image_url')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select
            value={watch('category_id') ?? ''}
            onValueChange={(val) => setValue('category_id', val || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Brand</Label>
          <Select
            value={watch('brand_id') ?? ''}
            onValueChange={(val) => setValue('brand_id', val || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands?.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="stock">Stock *</Label>
        <Input id="stock" type="number" {...register('stock')} />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="is_active"
            checked={watch('is_active')}
            onCheckedChange={(checked) => setValue('is_active', checked)}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="is_featured"
            checked={watch('is_featured')}
            onCheckedChange={(checked) => setValue('is_featured', checked)}
          />
          <Label htmlFor="is_featured">Featured</Label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 glow-purple" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
}
