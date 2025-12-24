import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories, useBrands, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import type { Product } from '@/types/database';
import { toast } from 'sonner';
import { Clock, Zap } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  image_url: z.string().url().optional().or(z.literal('')),
  category_id: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  flash_sale_enabled: z.boolean(),
  sale_start_date: z.string().optional().nullable(),
  sale_end_date: z.string().optional().nullable(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      short_description: product?.short_description ?? '',
      price: product?.price ?? 0,
      sale_price: product?.sale_price ?? null,
      image_url: product?.image_url ?? '',
      category_id: product?.category_id ?? null,
      brand_id: product?.brand_id ?? null,
      stock: product?.stock ?? 0,
      is_featured: product?.is_featured ?? false,
      is_active: product?.is_active ?? true,
      flash_sale_enabled: product?.flash_sale_enabled ?? false,
      sale_start_date: product?.sale_start_date ? product.sale_start_date.slice(0, 16) : '',
      sale_end_date: product?.sale_end_date ? product.sale_end_date.slice(0, 16) : '',
    },
  });

  const flashSaleEnabled = watch('flash_sale_enabled');

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const productData = {
        name: data.name,
        slug: data.slug,
        price: data.price,
        description: data.description,
        short_description: data.short_description,
        stock: data.stock,
        is_featured: data.is_featured,
        is_active: data.is_active,
        sale_price: data.sale_price || null,
        image_url: data.image_url || null,
        category_id: data.category_id || null,
        brand_id: data.brand_id || null,
        flash_sale_enabled: data.flash_sale_enabled,
        sale_start_date: data.sale_start_date ? new Date(data.sale_start_date).toISOString() : null,
        sale_end_date: data.sale_end_date ? new Date(data.sale_end_date).toISOString() : null,
      };

      if (product) {
        await updateProduct.mutateAsync({ id: product.id, ...productData });
        toast.success('Product updated');
      } else {
        await createProduct.mutateAsync(productData);
        toast.success('Product created');
      }
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Regular Price *</Label>
          <Input id="price" type="number" step="0.01" {...register('price')} />
          {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <Label htmlFor="sale_price">Sale Price</Label>
          <Input id="sale_price" type="number" step="0.01" {...register('sale_price')} />
        </div>
      </div>

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
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Sale Start Date
                </Label>
                <Input
                  type="datetime-local"
                  {...register('sale_start_date')}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Sale End Date *
                </Label>
                <Input
                  type="datetime-local"
                  {...register('sale_end_date')}
                  required={flashSaleEnabled}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The countdown timer will show time remaining until the sale ends. Make sure to set a sale price above.
            </p>
          </CardContent>
        )}
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
