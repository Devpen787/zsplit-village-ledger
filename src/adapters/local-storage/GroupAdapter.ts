
import { Group, GroupMember } from '../types';
import { LocalStorageManager } from './LocalStorageManager';

export class LocalStorageGroupAdapter {
  private storageManager: LocalStorageManager;

  constructor(storageManager: LocalStorageManager) {
    this.storageManager = storageManager;
  }

  async getGroups(userId: string): Promise<Group[]> {
    const data = this.storageManager.getData();
    const userGroupIds = data.groupMembers
      .filter(gm => gm.user_id === userId)
      .map(gm => gm.group_id);
    
    return data.groups.filter(group => userGroupIds.includes(group.id));
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    const data = this.storageManager.getData();
    return data.groups.find(group => group.id === groupId) || null;
  }

  async createGroup(groupData: Omit<Group, 'id' | 'created_at'>): Promise<Group> {
    const data = this.storageManager.getData();
    const newGroup: Group = {
      ...groupData,
      id: this.storageManager.generateId(),
      created_at: new Date().toISOString()
    };
    
    data.groups.push(newGroup);
    
    // Add creator as admin
    const membership: GroupMember = {
      id: this.storageManager.generateId(),
      group_id: newGroup.id,
      user_id: groupData.created_by,
      role: 'admin',
      created_at: new Date().toISOString()
    };
    
    data.groupMembers.push(membership);
    this.storageManager.saveData(data);
    
    return newGroup;
  }

  async updateGroup(groupId: string, updateData: Partial<Group>): Promise<void> {
    const data = this.storageManager.getData();
    const groupIndex = data.groups.findIndex(group => group.id === groupId);
    
    if (groupIndex !== -1) {
      data.groups[groupIndex] = { ...data.groups[groupIndex], ...updateData };
      this.storageManager.saveData(data);
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    const data = this.storageManager.getData();
    
    data.groups = data.groups.filter(group => group.id !== groupId);
    data.groupMembers = data.groupMembers.filter(gm => gm.group_id !== groupId);
    data.expenses = data.expenses.filter(expense => expense.group_id !== groupId);
    data.potActivities = data.potActivities.filter(activity => activity.group_id !== groupId);
    data.invitations = data.invitations.filter(invitation => invitation.group_id !== groupId);
    
    this.storageManager.saveData(data);
  }

  // Group Members
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const data = this.storageManager.getData();
    const members = data.groupMembers.filter(gm => gm.group_id === groupId);
    
    return members.map(member => ({
      ...member,
      user: data.users.find(user => user.id === member.user_id)
    }));
  }

  async addGroupMember(groupId: string, userId: string, role: string = 'member'): Promise<GroupMember> {
    const data = this.storageManager.getData();
    const newMember: GroupMember = {
      id: this.storageManager.generateId(),
      group_id: groupId,
      user_id: userId,
      role,
      created_at: new Date().toISOString()
    };
    
    data.groupMembers.push(newMember);
    this.storageManager.saveData(data);
    
    return newMember;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<void> {
    const data = this.storageManager.getData();
    data.groupMembers = data.groupMembers.filter(
      gm => !(gm.group_id === groupId && gm.user_id === userId)
    );
    this.storageManager.saveData(data);
  }

  async updateMemberRole(groupId: string, userId: string, role: string): Promise<void> {
    const data = this.storageManager.getData();
    const memberIndex = data.groupMembers.findIndex(
      gm => gm.group_id === groupId && gm.user_id === userId
    );
    
    if (memberIndex !== -1) {
      data.groupMembers[memberIndex].role = role;
      this.storageManager.saveData(data);
    }
  }

  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const data = this.storageManager.getData();
    return data.groupMembers.some(gm => gm.group_id === groupId && gm.user_id === userId);
  }

  async isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
    const data = this.storageManager.getData();
    const member = data.groupMembers.find(gm => gm.group_id === groupId && gm.user_id === userId);
    return member?.role === 'admin';
  }
}
