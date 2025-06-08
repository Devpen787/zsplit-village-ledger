
import { User } from '../types';
import { LocalStorageManager } from './LocalStorageManager';

export class LocalStorageUserAdapter {
  private storageManager: LocalStorageManager;

  constructor(storageManager: LocalStorageManager) {
    this.storageManager = storageManager;
  }

  async getUsers(groupId?: string): Promise<User[]> {
    const data = this.storageManager.getData();
    
    if (!groupId) return data.users;
    
    const groupMemberIds = data.groupMembers
      .filter(gm => gm.group_id === groupId)
      .map(gm => gm.user_id);
    
    return data.users.filter(user => groupMemberIds.includes(user.id));
  }

  async getUserById(userId: string): Promise<User | null> {
    const data = this.storageManager.getData();
    return data.users.find(user => user.id === userId) || null;
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<void> {
    const data = this.storageManager.getData();
    const userIndex = data.users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
      data.users[userIndex] = { ...data.users[userIndex], ...updateData };
      this.storageManager.saveData(data);
    }
  }
}
