import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WooCommerceProduct {
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

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function useProductImportExport() {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const parseCSV = (csvText: string): WooCommerceProduct[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    // Handle BOM and clean up header
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

  const getCategoryFromPath = async (categoryPath: string): Promise<string | null> => {
    if (!categoryPath) return null;
    
    // Extract the deepest category from path like "Gift Cards > Steam Gift Card"
    const parts = categoryPath.split('>').map(p => p.trim());
    const categoryName = parts[parts.length - 1] || parts[0];
    
    // Check if category exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .maybeSingle();
    
    if (existingCategory) return existingCategory.id;
    
    // Create new category
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

  const importProducts = async (file: File): Promise<ImportResult> => {
    setIsImporting(true);
    setImportProgress(0);
    
    const result: ImportResult = { success: 0, failed: 0, errors: [] };
    
    try {
      const text = await file.text();
      const wcProducts = parseCSV(text);
      
      if (wcProducts.length === 0) {
        throw new Error('No products found in CSV');
      }

      // Group variable products and their variations
      const parentProducts = wcProducts.filter(p => p.Type === 'variable');
      const simpleProducts = wcProducts.filter(p => p.Type === 'simple' || p.Type === '');
      const variations = wcProducts.filter(p => p.Type?.includes('variation'));
      
      const total = parentProducts.length + simpleProducts.length;
      let processed = 0;

      // Import simple products
      for (const wcProduct of simpleProducts) {
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
            price: priceBdt / 125, // Convert BDT to USD (approximate rate)
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
        } catch (error: any) {
          result.failed++;
          result.errors.push(`Failed to import "${wcProduct.Name}": ${error.message}`);
        }
        
        processed++;
        setImportProgress(Math.round((processed / total) * 100));
      }

      // Import variable products with variations
      for (const wcProduct of parentProducts) {
        try {
          const categoryId = await getCategoryFromPath(wcProduct.Categories);
          const brandId = await getBrandId(wcProduct.Brands);
          
          // Variable products don't have regular price themselves
          // Get price from first variation
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
            stock: 0, // Stock managed via variants
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

          // Import variations for this product
          for (const variation of productVariations) {
            const variantPriceBdt = parseFloat(variation['Regular price']) || 0;
            const variantSalePriceBdt = parseFloat(variation['Sale price']) || null;
            
            // Extract variant name from attribute
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
        } catch (error: any) {
          result.failed++;
          result.errors.push(`Failed to import "${wcProduct.Name}": ${error.message}`);
        }
        
        processed++;
        setImportProgress(Math.round((processed / total) * 100));
      }

    } catch (error: any) {
      result.errors.push(`Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
      setImportProgress(100);
    }
    
    return result;
  };

  const exportProducts = async (): Promise<string> => {
    setIsExporting(true);
    
    try {
      // Fetch all products with variants and category info
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

      // CSV Headers matching WooCommerce format
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

        // Main product row
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

        // Add variation rows
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

      // Convert to CSV
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

  return {
    importProducts,
    exportProducts,
    downloadCSV,
    isImporting,
    isExporting,
    importProgress,
  };
}
