
import React from 'react';
import { DebtRelationship } from './useDebtRelationships';
import { DebtRelationshipCard } from './DebtRelationshipCard';

interface DebtSectionProps {
  title: string;
  subtitle: string;
  relationships: DebtRelationship[];
  variant: 'user-creditor' | 'user-debtor' | 'other';
  containerClassName: string;
  onSendReminder?: (relationship: DebtRelationship) => void;
  maxDisplay?: number;
}

export const DebtSection = ({ 
  title, 
  subtitle,
  relationships, 
  variant, 
  containerClassName,
  onSendReminder,
  maxDisplay
}: DebtSectionProps) => {
  if (relationships.length === 0) {
    return null;
  }

  const displayRelationships = maxDisplay 
    ? relationships.slice(0, maxDisplay) 
    : relationships;

  return (
    <div className={containerClassName}>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        {title} ({relationships.length})
      </h3>
      <div className="space-y-3">
        {displayRelationships.map((relationship, index) => (
          <DebtRelationshipCard
            key={`${variant}-${index}`}
            relationship={relationship}
            variant={variant}
            onSendReminder={onSendReminder}
          />
        ))}
        {maxDisplay && relationships.length > maxDisplay && (
          <p className="text-sm text-muted-foreground text-center">
            +{relationships.length - maxDisplay} more relationships
          </p>
        )}
      </div>
    </div>
  );
};
