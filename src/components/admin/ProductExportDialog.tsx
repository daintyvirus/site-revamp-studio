import { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useProductImportExport } from '@/hooks/useProductImportExport';

interface ProductExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductExportDialog({ open, onOpenChange }: ProductExportDialogProps) {
  const { downloadCSV, isExporting } = useProductImportExport();
  const [exportComplete, setExportComplete] = useState(false);
  const [options, setOptions] = useState({
    includeVariants: true,
    includePricing: true,
    includeStock: true,
    includeCategories: true,
    includeBrands: true,
    includeTags: true,
    includeImages: true,
  });

  const handleExport = async () => {
    await downloadCSV();
    setExportComplete(true);
  };

  const handleClose = () => {
    setExportComplete(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Products
          </DialogTitle>
          <DialogDescription>
            Export all products to a WooCommerce-compatible CSV file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!exportComplete ? (
            <>
              {/* Export Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Include in Export:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(options).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          setOptions(prev => ({ ...prev, [key]: checked === true }))
                        }
                      />
                      <Label htmlFor={key} className="text-sm">
                        {key.replace('include', '').replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Format Info */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">WooCommerce Compatible Format</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      The exported CSV can be imported directly into WooCommerce or used as a backup.
                      It includes both USD and BDT pricing columns.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleExport} 
                  disabled={isExporting}
                  className="glow-purple"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export to CSV
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Export Complete!</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Your products have been exported to a CSV file. The download should start automatically.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
