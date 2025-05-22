
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const GroupTabNav: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="expenses">Expenses</TabsTrigger>
      <TabsTrigger value="balances">Balances</TabsTrigger>
      <TabsTrigger value="group-pot">Group Pot</TabsTrigger>
      <TabsTrigger value="group-pulse">Group Pulse</TabsTrigger>
    </TabsList>
  );
};
