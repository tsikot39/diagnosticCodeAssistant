import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';
import { DiagnosticCode } from '@/types/diagnosticCode';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  code: DiagnosticCode | null;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  code,
  isDeleting = false 
}: DeleteConfirmModalProps) {
  if (!isOpen || !code) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Delete Diagnostic Code</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete this diagnostic code? This action cannot be undone.
          </p>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="font-mono text-sm font-semibold">{code.code}</div>
            <div className="text-sm text-muted-foreground">{code.description}</div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Code'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
