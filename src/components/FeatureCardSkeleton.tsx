import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function FeatureCardSkeleton() {
  return (
    <Card className="group border-0 shadow-lg bg-gradient-to-br from-card to-muted/10 border-l-4 border-l-muted animate-pulse">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-muted w-8 h-8" />
              <div className="h-6 bg-muted rounded w-32" />
            </div>
            <div className="h-4 bg-muted rounded w-48 mb-1" />
            <div className="h-4 bg-muted rounded w-36" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 bg-muted rounded-full w-12" />
            <div className="h-8 w-8 bg-muted rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
              <div className="h-4 bg-muted rounded w-20" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
              <div className="h-4 bg-muted rounded w-24" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-muted rounded" />
            <div className="h-3 bg-muted rounded w-28" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="h-6 w-11 bg-muted rounded-full" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}