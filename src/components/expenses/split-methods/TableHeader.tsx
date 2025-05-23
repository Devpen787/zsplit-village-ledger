
import React from "react";
import { TableHead, TableHeader as UITableHeader, TableRow } from "@/components/ui/table";

interface TableHeaderProps {
  splitMethod: string;
}

const TableHeader: React.FC<TableHeaderProps> = ({ splitMethod }) => {
  return (
    <UITableHeader>
      <TableRow>
        <TableHead className="w-12">Include</TableHead>
        <TableHead>Person</TableHead>
        {splitMethod !== "equal" && (
          <TableHead>
            {splitMethod === "percentage" ? "%" : 
            splitMethod === "shares" ? "Shares" : "Amount"}
          </TableHead>
        )}
        <TableHead className="text-right">Final Amount</TableHead>
      </TableRow>
    </UITableHeader>
  );
};

export default TableHeader;
