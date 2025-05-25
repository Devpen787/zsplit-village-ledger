
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingCenter } from './LoadingCenter';

interface LoadingCardProps {
  text?: string;
  className?: string;
}

export const LoadingCard = ({ text, className }: LoadingCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <LoadingCenter text={text} />
      </CardContent>
    </Card>
  );
};
