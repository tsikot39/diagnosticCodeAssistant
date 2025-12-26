import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateDiagnosticCode } from '@/hooks/useDiagnosticCodes'
import { useAutoSave, useLoadDraft, useClearDraft } from '@/hooks/useAutoSave'
import { useAnalytics } from '@/hooks/useAnalytics'
import { diagnosticCodeCreateSchema } from '@/types/diagnosticCode'
import type { DiagnosticCodeCreate } from '@/types/diagnosticCode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CodeFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function CodeFormModal({ isOpen, onClose, onSuccess }: CodeFormModalProps) {
  const { trackCodeCreate } = useAnalytics()
  const createMutation = useCreateDiagnosticCode()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const DRAFT_KEY = 'diagnostic-code-draft'
  
  const initialFormData: DiagnosticCodeCreate = {
    code: '',
    description: '',
    category: '',
    subcategory: '',
    severity: undefined,
    is_active: true,
  }

  const loadedDraft = useLoadDraft<DiagnosticCodeCreate>(DRAFT_KEY, initialFormData)
  const [formData, setFormData] = useState<DiagnosticCodeCreate>(initialFormData)
  const [hasDraft, setHasDraft] = useState(false)
  const clearDraft = useClearDraft(DRAFT_KEY)

  // Load draft on mount
  useEffect(() => {
    if (isOpen && loadedDraft && (loadedDraft.code || loadedDraft.description)) {
      setHasDraft(true)
    }
  }, [isOpen, loadedDraft])

  // Auto-save draft
  useAutoSave({
    key: DRAFT_KEY,
    data: formData,
    enabled: isOpen && (!!formData.code || !!formData.description),
  })

  const handleLoadDraft = () => {
    setFormData(loadedDraft)
    setHasDraft(false)
    toast.success('Draft loaded')
  }

  const handleClearDraft = () => {
    clearDraft()
    setHasDraft(false)
    toast.success('Draft cleared')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const validatedData = diagnosticCodeCreateSchema.parse(formData)
      const result = await createMutation.mutateAsync(validatedData)
      trackCodeCreate(result.id)
      toast.success('Diagnostic code created successfully!')
      clearDraft()
      setFormData(initialFormData)
      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message
        })
        setErrors(newErrors)
        toast.error('Please fix the errors in the form')
      } else {
        toast.error('Failed to create diagnostic code')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add New Diagnostic Code</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {hasDraft && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-600 dark:text-blue-400">Draft found</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadDraft}>
                  Load
                </Button>
                <Button size="sm" variant="ghost" onClick={handleClearDraft}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Code *</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., E001"
            />
            {errors.code && <p className="text-sm text-destructive mt-1">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Medical, System"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subcategory</label>
            <Input
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              placeholder="e.g., Diagnostic"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Severity</label>
            <select
              value={formData.severity || ''}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Select severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
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
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Code'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
