import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BulkDeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  count: number
  isDeleting: boolean
}

export function BulkDeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  count,
  isDeleting,
}: BulkDeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirm Bulk Delete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong className="text-foreground">{count}</strong>{' '}
            {count === 1 ? 'diagnostic code' : 'diagnostic codes'}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
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
              {isDeleting ? 'Deleting...' : `Delete ${count} ${count === 1 ? 'Code' : 'Codes'}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
