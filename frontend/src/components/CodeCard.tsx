import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Edit, Trash2, History } from 'lucide-react'
import { toast } from 'sonner'
import type { DiagnosticCode } from '@/types/diagnosticCode'
import { useDeleteDiagnosticCode } from '@/hooks/useDiagnosticCodes'
import { useIsFavorite } from '@/hooks/useFavorites'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditCodeModal } from './EditCodeModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { FavoriteButton } from './FavoriteButton'

interface CodeCardProps {
  code: DiagnosticCode
  isSelected?: boolean
  onToggleSelect?: (id: number) => void
}

export default function CodeCard({ code, isSelected = false, onToggleSelect }: CodeCardProps) {
  const navigate = useNavigate()
  const deleteMutation = useDeleteDiagnosticCode()
  const { data: isFavorite = false } = useIsFavorite(code.id)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const getSeverityColor = (severity: string | null) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'text-red-500'
      case 'high':
        return 'text-orange-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const getSeverityVariant = (severity: string | null) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditModalOpen(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(code.id)
      toast.success('Diagnostic code deleted successfully')
      setIsDeleteModalOpen(false)
    } catch (error) {
      toast.error('Failed to delete diagnostic code')
    }
  }

  const handleCardClick = () => {
    navigate(`/code/${code.id}`)
  }

  const handleViewHistory = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/code/${code.id}/history`)
  }

  return (
    <>
      <Card
        data-testid="code-card"
        className={`cursor-pointer hover:shadow-lg transition-all-smooth animate-fade-in ${
          isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
        }`}
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {onToggleSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => { e.stopPropagation(); onToggleSelect(code.id); }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              )}
              <CardTitle className="text-xl">{code.code}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <FavoriteButton codeId={code.id} isFavorite={isFavorite} size="sm" />
              {code.severity && (
                <AlertCircle className={`h-5 w-5 ${getSeverityColor(code.severity)}`} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {code.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {code.category && (
              <Badge variant="outline">{code.category}</Badge>
            )}
            {code.severity && (
              <Badge variant={getSeverityVariant(code.severity)}>
                {code.severity}
              </Badge>
            )}
            {!code.is_active && (
              <Badge variant="outline">Inactive</Badge>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewHistory}
              className="flex-1 gap-1"
            >
              <History className="h-3 w-3" />
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex-1 gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex-1 gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditCodeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        code={code}
        onSuccess={() => {
          setIsEditModalOpen(false)
          toast.success('Code updated successfully')
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        code={code}
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
