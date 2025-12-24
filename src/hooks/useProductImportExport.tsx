import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WooCommerceProduct {
  ID: string;
  Type: string;
  SKU: string;
  Name: string;
  Published: string;
  'Is featured?': string;
  'Short description': string;
  Description: string;
  'Regular price': string;
  'Sale price': string;
  Categories: string;
  Tags: string;
  Images: string;
  Stock: string;
  'In stock?': string;
  Parent: string;
  'Attribute 1 name': string;
  'Attribute 1 value(s)': string;
  Brands: string;
}

export interface ParsedProduct {
  name: string;
  type: 'simple' | 'variable' | 'variation';
  sku: string;
  priceBdt: number;
  salePriceBdt: number | null;
  category: string;
  image: string;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  variantCount?: number;
  parentId?: string;
}

export interface ImportProgress {
  current: number;
  total: number;
  currentProduct: string;
  status: 'pending' | 'importing' | 'success' | 'error';
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function useProductImportExport() {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentImportItem, setCurrentImportItem] = useState<ImportProgress | null>(null);

  const parseCSV = (csvText: string): WooCommerceProduct[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headerLine = lines[0].replace(/^\uFEFF/, '');
    const headers = parseCSVLine(headerLine);
    
    const products: WooCommerceProduct[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = parseCSVLine(line);
      const product: any = {};
      
      headers.forEach((header, index) => {
        product[header.trim()] = values[index]?.trim() || '';
      });
      
      products.push(product as WooCommerceProduct);
    }
    
    return products;
  };

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    return values;
  };

  const generateSlug = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
  };

  // Preview parsed products without importing
  const previewCSV = useCallback(async (file: File): Promise<ParsedProduct[]> => {
    const text = await file.text();
    const wcProducts = parseCSV(text);
    
    const parentProducts = wcProducts.filter(p => p.Type === 'variable');
    const simpleProducts = wcProducts.filter(p => p.Type === 'simple' || p.Type === '');
    const variations = wcProducts.filter(p => p.Type?.includes('variation'));
    
    const parsed: ParsedProduct[] = [];
    
    // Parse simple products
    for (const p of simpleProducts) {
      parsed.push({
        name: p.Name,
        type: 'simple',
        sku: p.SKU || '',
        priceBdt: parseFloat(p['Regular price']) || 0,
        salePriceBdt: parseFloat(p['Sale price']) || null,
        category: p.Categories?.split('>').pop()?.trim() || '',
        image: p.Images?.split(',')[0]?.trim() || '',
        stock: parseInt(p.Stock) || 0,
        isFeatured: p['Is featured?'] === '1',
        isActive: p.Published === '1',
      });
    }
    
    // Parse variable products with variant count
    for (const p of parentProducts) {
      const productVariations = variations.filter(v => v.Parent === `id:${p.ID}`);
      parsed.push({
        name: p.Name,
        type: 'variable',
        sku: p.SKU || '',
        priceBdt: productVariations[0] ? parseFloat(productVariations[0]['Regular price']) || 0 : 0,
        salePriceBdt: null,
        category: p.Categories?.split('>').pop()?.trim() || '',
        image: p.Images?.split(',')[0]?.trim() || '',
        stock: 0,
        isFeatured: p['Is featured?'] === '1',
        isActive: p.Published === '1',
        variantCount: productVariations.length,
      });
    }
    
    return parsed;
  }, []);

  const getCategoryFromPath = async (categoryPath: string): Promise<string | null> => {
    if (!categoryPath) return null;
    
    const parts = categoryPath.split('>').map(p => p.trim());
    const categoryName = parts[parts.length - 1] || parts[0];
    
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .maybeSingle();
    
    if (existingCategory) return existingCategory.id;
    
    const { data: newCategory } = await supabase
      .from('categories')
      .insert({
        name: categoryName,
        slug: generateSlug(categoryName),
      })
      .select('id')
      .single();
    
    return newCategory?.id || null;
  };

  const getBrandId = async (brandName: string): Promise<string | null> => {
    if (!brandName) return null;
    
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('name', brandName)
      .maybeSingle();
    
    if (existingBrand) return existingBrand.id;
    
    const { data: newBrand } = await supabase
      .from('brands')
      .insert({
        name: brandName,
        slug: generateSlug(brandName),
      })
      .select('id')
      .single();
    
    return newBrand?.id || null;
  };

  const importProducts = async (
    file: File,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResult> => {
    setIsImporting(true);
    setImportProgress(0);
    
    const result: ImportResult = { success: 0, failed: 0, errors: [] };
    
    try {
      const text = await file.text();
      const wcProducts = parseCSV(text);
      
      if (wcProducts.length === 0) {
        throw new Error('No products found in CSV');
      }

      const parentProducts = wcProducts.filter(p => p.Type === 'variable');
      const simpleProducts = wcProducts.filter(p => p.Type === 'simple' || p.Type === '');
      const variations = wcProducts.filter(p => p.Type?.includes('variation'));
      
      const total = parentProducts.length + simpleProducts.length;
      let processed = 0;

      // Import simple products
      for (const wcProduct of simpleProducts) {
        const progress: ImportProgress = {
          current: processed + 1,
          total,
          currentProduct: wcProduct.Name,
          status: 'importing'
        };
        setCurrentImportItem(progress);
        onProgress?.(progress);

        try {
          const categoryId = await getCategoryFromPath(wcProduct.Categories);
          const brandId = await getBrandId(wcProduct.Brands);
          
          const priceBdt = parseFloat(wcProduct['Regular price']) || 0;
          const salePriceBdt = parseFloat(wcProduct['Sale price']) || null;
          
          const productData = {
            name: wcProduct.Name,
            slug: generateSlug(wcProduct.Name),
            sku: wcProduct.SKU || null,
            description: stripHtml(wcProduct.Description || ''),
            short_description: stripHtml(wcProduct['Short description'] || ''),
            price_bdt: priceBdt,
            price: priceBdt / 125,
            sale_price_bdt: salePriceBdt,
            sale_price: salePriceBdt ? salePriceBdt / 125 : null,
            image_url: wcProduct.Images?.split(',')[0]?.trim() || null,
            category_id: categoryId,
            brand_id: brandId,
            stock: parseInt(wcProduct.Stock) || 0,
            is_featured: wcProduct['Is featured?'] === '1',
            is_active: wcProduct.Published === '1',
            product_type: 'simple',
            wc_id: parseInt(wcProduct.ID) || null,
            tags: wcProduct.Tags ? wcProduct.Tags.split(',').map(t => t.trim()) : [],
          };

          await supabase.from('products').insert(productData);
          result.success++;
          
          onProgress?.({ ...progress, status: 'success' });
        } catch (error: any) {
          result.failed++;
          result.errors.push(`Failed to import "${wcProduct.Name}": ${error.message}`);
          onProgress?.({ ...progress, status: 'error' });
        }
        
        processed++;
        setImportProgress(Math.round((processed / total) * 100));
      }

      // Import variable products with variations
      for (const wcProduct of parentProducts) {
        const progress: ImportProgress = {
          current: processed + 1,
          total,
          currentProduct: wcProduct.Name,
          status: 'importing'
        };
        setCurrentImportItem(progress);
        onProgress?.(progress);

        try {
          const categoryId = await getCategoryFromPath(wcProduct.Categories);
          const brandId = await getBrandId(wcProduct.Brands);
          
          const productVariations = variations.filter(v => v.Parent === `id:${wcProduct.ID}`);
          const firstVariation = productVariations[0];
          const basePriceBdt = firstVariation ? parseFloat(firstVariation['Regular price']) || 0 : 0;
          
          const productData = {
            name: wcProduct.Name,
            slug: generateSlug(wcProduct.Name),
            sku: wcProduct.SKU || null,
            description: stripHtml(wcProduct.Description || ''),
            short_description: stripHtml(wcProduct['Short description'] || ''),
            price_bdt: basePriceBdt,
            price: basePriceBdt / 125,
            sale_price_bdt: null,
            sale_price: null,
            image_url: wcProduct.Images?.split(',')[0]?.trim() || null,
            category_id: categoryId,
            brand_id: brandId,
            stock: 0,
            is_featured: wcProduct['Is featured?'] === '1',
            is_active: wcProduct.Published === '1',
            product_type: 'variable',
            wc_id: parseInt(wcProduct.ID) || null,
            tags: wcProduct.Tags ? wcProduct.Tags.split(',').map(t => t.trim()) : [],
          };

          const { data: newProduct, error: productError } = await supabase
            .from('products')
            .insert(productData)
            .select('id')
            .single();

          if (productError) throw productError;

          for (const variation of productVariations) {
            const variantPriceBdt = parseFloat(variation['Regular price']) || 0;
            const variantSalePriceBdt = parseFloat(variation['Sale price']) || null;
            const attrValue = variation['Attribute 1 value(s)'] || variation.Name.split(' - ').pop() || 'Default';
            
            const variantData = {
              product_id: newProduct.id,
              name: attrValue,
              sku: variation.SKU || null,
              price_bdt: variantPriceBdt,
              price: variantPriceBdt / 125,
              sale_price_bdt: variantSalePriceBdt,
              sale_price: variantSalePriceBdt ? variantSalePriceBdt / 125 : null,
              stock: parseInt(variation.Stock) || 0,
              wc_id: parseInt(variation.ID) || null,
            };

            await supabase.from('product_variants').insert(variantData);
          }

          result.success++;
          onProgress?.({ ...progress, status: 'success' });
        } catch (error: any) {
          result.failed++;
          result.errors.push(`Failed to import "${wcProduct.Name}": ${error.message}`);
          onProgress?.({ ...progress, status: 'error' });
        }
        
        processed++;
        setImportProgress(Math.round((processed / total) * 100));
      }

    } catch (error: any) {
      result.errors.push(`Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
      setImportProgress(100);
      setCurrentImportItem(null);
    }
    
    return result;
  };

  const exportProducts = async (): Promise<string> => {
    setIsExporting(true);
    
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          brand:brands(name),
          variants:product_variants(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'ID', 'Type', 'SKU', 'Name', 'Published', 'Is featured?',
        'Short description', 'Description', 'Regular price', 'Sale price',
        'Categories', 'Tags', 'Images', 'Stock', 'In stock?', 'Parent',
        'Attribute 1 name', 'Attribute 1 value(s)', 'Brands',
        'Price BDT', 'Sale Price BDT'
      ];

      const rows: string[][] = [headers];

      for (const product of products || []) {
        const hasVariants = product.variants && product.variants.length > 0;
        const productType = hasVariants ? 'variable' : 'simple';

        rows.push([
          product.wc_id?.toString() || product.id,
          productType,
          product.sku || '',
          product.name,
          product.is_active ? '1' : '0',
          product.is_featured ? '1' : '0',
          product.short_description || '',
          product.description || '',
          product.price?.toString() || '0',
          product.sale_price?.toString() || '',
          product.category?.name || '',
          (product.tags || []).join(', '),
          product.image_url || '',
          product.stock?.toString() || '0',
          product.stock > 0 ? '1' : '0',
          '',
          hasVariants ? 'Select Amount' : '',
          hasVariants ? product.variants.map((v: any) => v.name).join(', ') : '',
          product.brand?.name || '',
          product.price_bdt?.toString() || '0',
          product.sale_price_bdt?.toString() || '',
        ]);

        if (hasVariants) {
          for (const variant of product.variants) {
            rows.push([
              variant.wc_id?.toString() || variant.id,
              'variation',
              variant.sku || '',
              `${product.name} - ${variant.name}`,
              product.is_active ? '1' : '0',
              '0',
              '',
              '',
              variant.price?.toString() || '0',
              variant.sale_price?.toString() || '',
              '',
              '',
              '',
              variant.stock?.toString() || '0',
              variant.stock > 0 ? '1' : '0',
              `id:${product.wc_id || product.id}`,
              'Select Amount',
              variant.name,
              '',
              variant.price_bdt?.toString() || '0',
              variant.sale_price_bdt?.toString() || '',
            ]);
          }
        }
      }

      const csv = rows.map(row => 
        row.map(cell => {
          const str = String(cell || '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      ).join('\n');

      return csv;
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const csv = await exportProducts();
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `products-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Products exported successfully');
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'ID', 'Type', 'SKU', 'Name', 'Published', 'Is featured?',
      'Short description', 'Description', 'Regular price', 'Sale price',
      'Categories', 'Tags', 'Images', 'Stock', 'In stock?', 'Parent',
      'Attribute 1 name', 'Attribute 1 value(s)', 'Brands'
    ];

    // Sample data rows
    const sampleRows = [
      ['1', 'simple', 'PROD-001', 'Sample Simple Product', '1', '0', 
       'Short description here', 'Full product description', '500', '450',
       'Electronics', 'tag1, tag2', 'https://example.com/image.jpg', '100', '1', '',
       '', '', 'Brand Name'],
      ['2', 'variable', 'PROD-002', 'Sample Variable Product', '1', '1',
       'Variable product description', 'Full description', '', '',
       'Gift Cards', 'digital, gift', 'https://example.com/image2.jpg', '', '1', '',
       'Select Amount', '100 BDT, 200 BDT, 500 BDT', ''],
      ['3', 'variation', '', 'Sample Variable Product - 100 BDT', '1', '0',
       '', '', '100', '', '', '', '', '50', '1', 'id:2',
       'Select Amount', '100 BDT', ''],
      ['4', 'variation', '', 'Sample Variable Product - 200 BDT', '1', '0',
       '', '', '200', '', '', '', '', '30', '1', 'id:2',
       'Select Amount', '200 BDT', ''],
      ['5', 'variation', '', 'Sample Variable Product - 500 BDT', '1', '0',
       '', '', '500', '', '', '', '', '20', '1', 'id:2',
       'Select Amount', '500 BDT', ''],
    ];

    const rows = [headers, ...sampleRows];
    const csv = rows.map(row => 
      row.map(cell => {
        const str = String(cell || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'woocommerce-import-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  return {
    importProducts,
    exportProducts,
    downloadCSV,
    downloadTemplate,
    previewCSV,
    isImporting,
    isExporting,
    importProgress,
    currentImportItem,
  };
}
