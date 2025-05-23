
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

export const GroupTabNav: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="expenses">Expenses</TabsTrigger>
      <TabsTrigger value="balances">Balances</TabsTrigger>
      {!isMobile && (
        <>
          <TabsTrigger value="group-pot">Group Pot</TabsTrigger>
          <TabsTrigger value="group-pulse">Group Pulse</TabsTrigger>
        </>
      )}
      {isMobile && (
        <TabsTrigger value="more">More</TabsTrigger>
      )}
    </TabsList>
  );
};
