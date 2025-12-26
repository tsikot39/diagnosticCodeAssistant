import { useState } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { bulkService } from '@/services/bulk';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ created: number; updated: number; errors: string[] | null } | null>(null);
  const { trackImport } = useAnalytics();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv') {
        toast.error('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      setResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const result = await bulkService.importCSV(file);
      
      setResults({
        created: result.created,
        updated: result.updated,
        errors: result.errors
      });

      trackImport('csv' as any);

      if (result.errors && result.errors.length > 0) {
        toast.warning(`Import completed with ${result.errors.length} errors`);
      } else {
        toast.success(`Successfully imported ${result.total_processed} codes`);
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to import codes');
    } finally {
      setImporting(false);
    }
  };

  // Legacy import function - commented out as unused
  /*
  const handleFileImportLegacy = async () => {
    if (!file) return;

    setImporting(true);
    const text = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    let codes: DiagnosticCodeCreate[] = [];
    if (ext === 'csv') {
      codes = parseCSV(text);
    } else if (ext === 'json') {
      codes = parseJSON(text);
    }

    if (codes.length === 0) {
      toast.error('No valid codes found in file');
      setImporting(false);
      return;
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const code of codes) {
      try {
        await createMutation.mutateAsync(code);
        success++;
      } catch (error: any) {
        failed++;
        errors.push(`${code.code}: ${error.message || 'Unknown error'}`);
      }
    }

    setResults({ success, failed, errors: errors.slice(0, 5) });
    setImporting(false);
    
    if (success > 0) {
      toast.success(`Successfully imported ${success} codes!`);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    }
  };
  */

  const handleClose = () => {
    setFile(null);
    setResults(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-background rounded-lg p-6 max-w-lg w-full mx-4 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Import Diagnostic Codes</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!results ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV or JSON file to import multiple diagnostic codes at once. Existing codes will be updated.
            </p>
            <Card className="border-2 border-dashed p-6">
              <label className="flex flex-col items-center gap-3 cursor-pointer">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">CSV files only</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </Card>

            {file && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
              <p className="font-medium">CSV Format:</p>
              <code className="block">code,description,category,severity,is_active</code>
              <p className="text-muted-foreground mt-1">
                • is_active: true/false, yes/no, 1/0, or active/inactive
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!file || importing} className="flex-1">
                {importing ? 'Importing...' : 'Import'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{results.created} codes created</span>
              </div>
              {results.updated > 0 && (
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">{results.updated} codes updated</span>
                </div>
              )}
              {results.errors && results.errors.length > 0 && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{results.errors.length} errors</span>
                </div>
              )}
            </div>

            {results.errors && results.errors.length > 0 && (
              <div className="bg-destructive/10 p-3 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-sm font-medium text-destructive mb-2">Errors:</p>
                {results.errors.map((error, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{error}</p>
                ))}
              </div>
            )}

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
