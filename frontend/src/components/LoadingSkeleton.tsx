import { Card, CardContent, CardHeader } from './ui/card';

export function CodeCardSkeleton() {
  return (
    <Card className="animate-pulse" data-testid="code-card-skeleton">
      <CardHeader>
        <div className="h-6 bg-muted rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/3"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="flex gap-2 mt-4">
            <div className="h-6 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-16"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CodeListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CodeCardSkeleton key={i} />
      ))}
    </div>
  );
}
