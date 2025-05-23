
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
      {splitMethod === 'equal' && <th className="p-2 text-right">Share</th>}
      {splitMethod === 'percentage' && <th className="p-2 text-right">Percentage</th>}
      {splitMethod === 'shares' && <th className="p-2 text-right">Shares</th>}
      {splitMethod !== 'equal' && <th className="p-2 text-right">Amount</th>}
    </tr>
  );
};
