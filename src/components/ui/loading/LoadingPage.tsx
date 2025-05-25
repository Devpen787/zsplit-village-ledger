
import React from 'react';
import { LoadingCenter } from './LoadingCenter';

interface LoadingPageProps {
  text?: string;
}

export const LoadingPage = ({ text }: LoadingPageProps) => {
  return (
    <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
      <LoadingCenter size="lg" text={text} />
    </div>
  );
};
