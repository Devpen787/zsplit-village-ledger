
import { PotActivity } from '../types';
import { LocalStorageManager } from './LocalStorageManager';

export class LocalStoragePotAdapter {
  private storageManager: LocalStorageManager;

  constructor(storageManager: LocalStorageManager) {
    this.storageManager = storageManager;
  }

  async getPotActivities(groupId: string): Promise<PotActivity[]> {
    const data = this.storageManager.getData();
    const activities = data.potActivities
      .filter(activity => activity.group_id === groupId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return activities.map(activity => ({
      ...activity,
      user: data.users.find(user => user.id === activity.user_id)
    }));
  }

  async createPotActivity(activityData: Omit<PotActivity, 'id' | 'created_at'>): Promise<PotActivity> {
    const data = this.storageManager.getData();
    const newActivity: PotActivity = {
      ...activityData,
      id: this.storageManager.generateId(),
      created_at: new Date().toISOString()
    };
    
    data.potActivities.push(newActivity);
    this.storageManager.saveData(data);
    
    return newActivity;
  }

  async updatePotActivity(activityId: string, updateData: Partial<PotActivity>): Promise<void> {
    const data = this.storageManager.getData();
    const activityIndex = data.potActivities.findIndex(activity => activity.id === activityId);
    
    if (activityIndex !== -1) {
      data.potActivities[activityIndex] = { ...data.potActivities[activityIndex], ...updateData };
      this.storageManager.saveData(data);
    }
  }
}
