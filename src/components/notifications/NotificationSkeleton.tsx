import React from 'react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export const NotificationSkeleton: React.FC = () => {
  return (
    <Card className="p-4 border-l-4 border-l-gray-200">
      <div className="flex items-start gap-3">
        <Skeleton className="h-4 w-4 rounded-full mt-1" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    </Card>
  );
};
