
import React from 'react';

interface ParticipantTableHeaderProps {
  splitMethod: string;
}

export const ParticipantTableHeader: React.FC<ParticipantTableHeaderProps> = ({
  splitMethod
}) => {
  return (
    <tr className="bg-muted text-left border-b">
      <th className="p-2">Select</th>
      <th className="p-2">Name</th>
      
      {splitMethod === 'equal' && (
        <th className="p-2 text-right">Share</th>
      )}
      
      {splitMethod === 'amount' && (
        <>
          <th className="p-2 text-right">Amount</th>
          <th className="p-2 text-right">Share</th>
        </>
      )}
      
      {splitMethod === 'percentage' && (
        <>
          <th className="p-2 text-right">Percentage</th>
          <th className="p-2 text-right">Amount</th>
        </>
      )}
    </tr>
  );
};
