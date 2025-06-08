
// Storage adapter exports
export * from './types';
export * from './StorageAdapter';
export * from './SupabaseAdapter';

// Create and export the default adapter instance
import { SupabaseAdapter } from './SupabaseAdapter';

export const storageAdapter = new SupabaseAdapter();
