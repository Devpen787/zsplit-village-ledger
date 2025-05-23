
import React from 'react';
import { Button } from '@/components/ui/button';

interface ParticipantFiltersProps {
  groupFilter: string;
  setGroupFilter: (filter: string) => void;
  groupOptions: string[];
  groupNames: Record<string, string>;
  handleSelectAllVisible: () => void;
  handleDeselectAll: () => void;
}

export const ParticipantFilters: React.FC<ParticipantFiltersProps> = ({
  groupFilter,
  setGroupFilter,
  groupOptions,
  groupNames,
  handleSelectAllVisible,
  handleDeselectAll
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span>Filter by group:</span>
        <select
          className="border px-3 py-2 rounded"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="All">All</option>
          {groupOptions.map((groupId) => (
            <option key={groupId} value={groupId}>
              {groupNames[groupId] || `Group ${groupId}`}
            </option>
          ))}
        </select>
      </div>

      <Button type="button" variant="outline" onClick={handleSelectAllVisible}>Select All Visible</Button>
      <Button type="button" variant="outline" onClick={handleDeselectAll}>Deselect All</Button>
    </div>
  );
};
