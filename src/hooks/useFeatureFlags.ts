
import { useState, useEffect } from 'react';

export interface FeatureFlags {
  'use-local-storage': boolean;
  'enable-new-roles': boolean;
  'offline-mode': boolean;
  'debug-mode': boolean;
  'demo-data': boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  'use-local-storage': false,
  'enable-new-roles': false,
  'offline-mode': false,
  'debug-mode': false,
  'demo-data': false,
};

const STORAGE_KEY = 'feature-flags';

export const useFeatureFlag = (flagName: keyof FeatureFlags): boolean => {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_FLAGS, ...JSON.parse(stored) } : DEFAULT_FLAGS;
    } catch {
      return DEFAULT_FLAGS;
    }
  });

  const flag = flags[flagName];

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const newFlags = stored ? { ...DEFAULT_FLAGS, ...JSON.parse(stored) } : DEFAULT_FLAGS;
        setFlags(newFlags);
      } catch {
        setFlags(DEFAULT_FLAGS);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return flag;
};

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_FLAGS, ...JSON.parse(stored) } : DEFAULT_FLAGS;
    } catch {
      return DEFAULT_FLAGS;
    }
  });

  const updateFlag = (flagName: keyof FeatureFlags, value: boolean) => {
    const newFlags = { ...flags, [flagName]: value };
    setFlags(newFlags);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags));
    
    // Trigger storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(newFlags),
      storageArea: localStorage
    }));
  };

  const resetFlags = () => {
    setFlags(DEFAULT_FLAGS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    flags,
    updateFlag,
    resetFlags
  };
};
