
import React from 'react';
import { motion } from 'framer-motion';
import { PendingPayoutRequests } from './PendingPayoutRequests';
import { PotActivityFeed } from './PotActivityFeed';
import { PotActivity } from '@/types/group-pot';

interface PotActivitySectionProps {
  activities: PotActivity[];
  onApproveRequest: (activityId: string) => Promise<void>;
  onRejectRequest: (activityId: string) => Promise<void>;
  isAdmin: boolean;
}

export const PotActivitySection = ({
  activities,
  onApproveRequest,
  onRejectRequest,
  isAdmin
}: PotActivitySectionProps) => {
  // Animation variants for staggered card appearance
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <motion.div variants={item}>
        <PendingPayoutRequests 
          activities={activities}
          onApprove={onApproveRequest}
          onReject={onRejectRequest}
          isAdmin={isAdmin}
        />
      </motion.div>
      <motion.div variants={item}>
        <PotActivityFeed 
          activities={activities}
        />
      </motion.div>
    </div>
  );
};
