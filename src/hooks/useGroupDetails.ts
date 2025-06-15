
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GroupDetails {
  id: string;
  name: string;
  icon?: string;
  emoji?: string;
  created_at: string;
  created_by?: string;
}

export const useGroupDetails = (groupId: string, user?: any) => {
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (error) {
          console.error('Error fetching group:', error);
          setGroup(null);
        } else {
          setGroup(data);
        }
      } catch (error) {
        console.error('Error fetching group:', error);
        setGroup(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  return { group, loading };
};
