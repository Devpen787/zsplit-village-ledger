
interface LocalStorageData {
  users: any[];
  groups: any[];
  groupMembers: any[];
  expenses: any[];
  potActivities: any[];
  invitations: any[];
  currentUser: any | null;
}

export class LocalStorageManager {
  private readonly STORAGE_KEY = 'expense-tracker-data';

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const initialData: LocalStorageData = {
        users: [],
        groups: [],
        groupMembers: [],
        expenses: [],
        potActivities: [],
        invitations: [],
        currentUser: null
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
    }
  }

  getData(): LocalStorageData {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : this.getDefaultData();
  }

  saveData(data: LocalStorageData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private getDefaultData(): LocalStorageData {
    return {
      users: [],
      groups: [],
      groupMembers: [],
      expenses: [],
      potActivities: [],
      invitations: [],
      currentUser: null
    };
  }

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  exportGroupData(groupId: string): string {
    const data = this.getData();
    
    const groupData = {
      group: data.groups.find(g => g.id === groupId),
      members: data.groupMembers.filter(gm => gm.group_id === groupId),
      expenses: data.expenses.filter(e => e.group_id === groupId),
      potActivities: data.potActivities.filter(pa => pa.group_id === groupId),
      invitations: data.invitations.filter(i => i.group_id === groupId),
      users: data.users.filter(u => 
        data.groupMembers.some(gm => gm.group_id === groupId && gm.user_id === u.id)
      ),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(groupData, null, 2);
  }

  importGroupData(jsonData: string): void {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.group || !importData.version) {
        throw new Error('Invalid export format');
      }
      
      const data = this.getData();
      const groupId = importData.group.id;
      
      // Remove existing group data
      data.groups = data.groups.filter(g => g.id !== groupId);
      data.groupMembers = data.groupMembers.filter(gm => gm.group_id !== groupId);
      data.expenses = data.expenses.filter(e => e.group_id !== groupId);
      data.potActivities = data.potActivities.filter(pa => pa.group_id !== groupId);
      data.invitations = data.invitations.filter(i => i.group_id !== groupId);
      
      // Import new data
      if (importData.group) data.groups.push(importData.group);
      if (importData.members) data.groupMembers.push(...importData.members);
      if (importData.expenses) data.expenses.push(...importData.expenses);
      if (importData.potActivities) data.potActivities.push(...importData.potActivities);
      if (importData.invitations) data.invitations.push(...importData.invitations);
      
      // Merge users (avoid duplicates)
      if (importData.users) {
        importData.users.forEach((importUser: any) => {
          const existingUserIndex = data.users.findIndex(u => u.id === importUser.id);
          if (existingUserIndex === -1) {
            data.users.push(importUser);
          } else {
            data.users[existingUserIndex] = importUser;
          }
        });
      }
      
      this.saveData(data);
    } catch (error) {
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
