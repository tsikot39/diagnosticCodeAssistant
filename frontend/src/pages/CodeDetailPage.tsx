import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { useDiagnosticCode, useDeleteDiagnosticCode } from '@/hooks/useDiagnosticCodes'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect } from 'react'

export default function CodeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { trackCodeView, trackCodeDelete } = useAnalytics()
  const { data: code, isLoading, error } = useDiagnosticCode(Number(id))
  const deleteMutation = useDeleteDiagnosticCode()

  // Track code view when code is loaded
  useEffect(() => {
    if (code) {
      trackCodeView(code.id, code.code)
    }
  }, [code, trackCodeView])

  const handleDelete = async () => {
    if (!code || !confirm('Are you sure you want to delete this code?')) return

    try {
      await deleteMutation.mutateAsync(code.id)
      trackCodeDelete(code.id)
      navigate('/')
    } catch (error) {
      console.error('Failed to delete code:', error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (error || !code) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load diagnostic code</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const getSeverityVariant = (severity: string | null) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'destructive'
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{code.code}</CardTitle>
              {code.severity && (
                <Badge variant={getSeverityVariant(code.severity)}>
                  {code.severity.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{code.description}</p>
          </div>

          {code.category && (
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <p className="text-muted-foreground">{code.category}</p>
            </div>
          )}

          {code.subcategory && (
            <div>
              <h3 className="font-semibold mb-2">Subcategory</h3>
              <p className="text-muted-foreground">{code.subcategory}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Status</h3>
            <Badge variant={code.is_active ? 'default' : 'outline'}>
              {code.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h3 className="font-semibold mb-2 text-sm">Created</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(code.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sm">Last Updated</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(code.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
