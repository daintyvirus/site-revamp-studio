import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
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
import { useProductImportExport } from '@/hooks/useProductImportExport';
import { cn } from '@/lib/utils';

interface ProductImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function ProductImportDialog({ open, onOpenChange, onComplete }: ProductImportDialogProps) {
  const { importProducts, isImporting, importProgress } = useProductImportExport();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
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
    
    const importResult = await importProducts(file);
    setResult(importResult);
    
    if (importResult.success > 0) {
      onComplete();
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import Products from WooCommerce
          </DialogTitle>
          <DialogDescription>
            Upload a WooCommerce product export CSV file to import products with variants and pricing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Drop Zone */}
          {!result && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                isDragOver ? "border-primary bg-primary/5" : "border-border",
                file && "border-green-500 bg-green-500/5"
              )}
            >
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="h-12 w-12 text-green-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-12 w-12 text-muted-foreground" />
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
          )}

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Importing products...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
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
                  <ScrollArea className="h-40 rounded-lg border bg-muted/30 p-3">
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
          {!result && !isImporting && (
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
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              {result ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button 
                onClick={handleImport} 
                disabled={!file || isImporting}
                className="glow-purple"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Start Import'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
