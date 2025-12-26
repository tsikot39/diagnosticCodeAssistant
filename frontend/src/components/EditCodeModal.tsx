import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateDiagnosticCode } from '@/hooks/useDiagnosticCodes';
import { useAnalytics } from '@/hooks/useAnalytics';
import { diagnosticCodeCreateSchema } from '@/types/diagnosticCode';
import type { DiagnosticCode, DiagnosticCodeCreate } from '@/types/diagnosticCode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: DiagnosticCode | null;
  onSuccess?: () => void;
}

export function EditCodeModal({ isOpen, onClose, code, onSuccess }: EditCodeModalProps) {
  const { trackCodeUpdate } = useAnalytics();
  const updateMutation = useUpdateDiagnosticCode();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<DiagnosticCodeCreate>({
    code: '',
    description: '',
    category: '',
    subcategory: '',
    severity: undefined,
    is_active: true,
  });

  useEffect(() => {
    if (code) {
      setFormData({
        code: code.code,
        description: code.description,
        category: code.category || '',
        subcategory: code.subcategory || '',
        severity: (code.severity as 'low' | 'medium' | 'high' | 'critical') || undefined,
        is_active: code.is_active,
      });
    }
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!code) return;

    try {
      const validatedData = diagnosticCodeCreateSchema.parse(formData);
      await updateMutation.mutateAsync({ id: code.id, data: validatedData });
      trackCodeUpdate(code.id);
      toast.success('Diagnostic code updated successfully!');
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
        toast.error('Please fix the errors in the form');
      } else {
        toast.error('Failed to update diagnostic code');
      }
    }
  };

  if (!isOpen || !code) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Diagnostic Code</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              Code <span className="text-destructive">*</span>
            </label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., ICD-E11.9"
            />
            {errors.code && (
              <p className="text-sm text-destructive mt-1">{errors.code}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description..."
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., ENDOCRINE, ERROR"
            />
          </div>

          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium mb-1">
              Subcategory
            </label>
            <Input
              id="subcategory"
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              placeholder="e.g., Diabetes, Database"
            />
          </div>

          <div>
            <label htmlFor="severity" className="block text-sm font-medium mb-1">
              Severity
            </label>
            <select
              id="severity"
              value={formData.severity || ''}
              onChange={(e) => setFormData({ ...formData, severity: (e.target.value || undefined) as 'low' | 'medium' | 'high' | 'critical' | undefined })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Code'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
