import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Download, Package, Loader2, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProductImportExport, ParsedProduct, ImportProgress } from '@/hooks/useProductImportExport';
import { cn } from '@/lib/utils';

interface ProductImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function ProductImportDialog({ open, onOpenChange, onComplete }: ProductImportDialogProps) {
  const { importProducts, previewCSV, downloadTemplate, isImporting, importProgress } = useProductImportExport();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<ParsedProduct[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<ImportProgress | null>(null);
  const [importLog, setImportLog] = useState<Array<{ name: string; status: 'success' | 'error' | 'importing' | 'pending' }>>([]);

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
      setPreview([]);
      setImportLog([]);
      
      // Load preview
      setIsLoadingPreview(true);
      try {
        const parsed = await previewCSV(selectedFile);
        setPreview(parsed);
      } catch (error) {
        console.error('Preview failed:', error);
      } finally {
        setIsLoadingPreview(false);
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleImport = async () => {
    if (!file) return;
    
    setImportLog([]);
    
    const importResult = await importProducts(file, (progress) => {
      setCurrentProgress(progress);
      setImportLog(prev => {
        const existing = prev.findIndex(p => p.name === progress.currentProduct);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { name: progress.currentProduct, status: progress.status };
          return updated;
        }
        return [...prev, { name: progress.currentProduct, status: progress.status }];
      });
    });
    
    setResult(importResult);
    setCurrentProgress(null);
    
    if (importResult.success > 0) {
      onComplete();
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setPreview([]);
    setImportLog([]);
    setCurrentProgress(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import Products from WooCommerce
          </DialogTitle>
          <DialogDescription>
            Upload a WooCommerce product export CSV file to import products with variants and pricing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Template Download & File Upload */}
          {!result && !isImporting && (
            <>
              {/* Template Download */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Need a template?</p>
                    <p className="text-xs text-muted-foreground">Download a sample CSV with the correct format</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {/* File Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-6 text-center transition-all",
                  isDragOver ? "border-primary bg-primary/5" : "border-border",
                  file && "border-green-500 bg-green-500/5"
                )}
              >
                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-10 w-10 text-green-500" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB • {preview.length} products found
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setFile(null); setPreview([]); }}>
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Drop your CSV file here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileSelect(f);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Preview Section */}
          {file && preview.length > 0 && !isImporting && !result && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Preview ({preview.length} products)</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">{preview.filter(p => p.type === 'simple').length} Simple</Badge>
                  <Badge variant="outline">{preview.filter(p => p.type === 'variable').length} Variable</Badge>
                </div>
              </div>
              <ScrollArea className="flex-1 rounded-lg border">
                <div className="p-2 space-y-1">
                  {preview.slice(0, 50).map((product, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img src={product.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs h-5">
                            {product.type}
                          </Badge>
                          {product.category && <span>{product.category}</span>}
                          {product.variantCount && (
                            <span className="text-primary">{product.variantCount} variants</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium">৳{product.priceBdt.toLocaleString()}</p>
                        {product.salePriceBdt && (
                          <p className="text-xs text-green-600">Sale: ৳{product.salePriceBdt.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {preview.length > 50 && (
                    <p className="text-center text-xs text-muted-foreground py-2">
                      And {preview.length - 50} more products...
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Loading Preview */}
          {isLoadingPreview && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading preview...</span>
            </div>
          )}

          {/* Import Progress with Real-time Updates */}
          {isImporting && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Importing products...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>

              {currentProgress && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm">
                      Importing: <strong>{currentProgress.currentProduct}</strong>
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {currentProgress.current} of {currentProgress.total}
                    </span>
                  </div>
                </div>
              )}

              {/* Real-time Import Log */}
              <ScrollArea className="h-40 rounded-lg border">
                <div className="p-2 space-y-1">
                  {importLog.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs py-1">
                      {item.status === 'success' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                      {item.status === 'error' && <XCircle className="h-3 w-3 text-red-500" />}
                      {item.status === 'importing' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                      <span className={cn(
                        item.status === 'error' && 'text-red-500',
                        item.status === 'success' && 'text-muted-foreground'
                      )}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Result Summary */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Imported Successfully</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {result.success}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Failed</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                    {result.failed}
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Import Errors</span>
                  </div>
                  <ScrollArea className="h-32 rounded-lg border bg-muted/30 p-3">
                    <div className="space-y-1">
                      {result.errors.map((error, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          {error}
                        </p>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Supported Fields Info */}
          {!file && !result && !isImporting && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-medium text-sm mb-2">Supported WooCommerce Fields:</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>• Product Name & Description</span>
                <span>• Regular & Sale Prices (BDT)</span>
                <span>• SKU & Stock</span>
                <span>• Categories & Tags</span>
                <span>• Product Images</span>
                <span>• Featured & Published Status</span>
                <span>• Variable Products</span>
                <span>• Product Variations</span>
                <span>• Brands</span>
                <span>• Attributes</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={handleClose}>
              {result ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button 
                onClick={handleImport} 
                disabled={!file || isImporting || preview.length === 0}
                className="glow-purple"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : `Import ${preview.length} Products`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
