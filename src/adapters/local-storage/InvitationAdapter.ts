
import { Invitation } from '../types';
import { LocalStorageManager } from './LocalStorageManager';

export class LocalStorageInvitationAdapter {
  private storageManager: LocalStorageManager;

  constructor(storageManager: LocalStorageManager) {
    this.storageManager = storageManager;
  }

  async getInvitations(userId?: string): Promise<Invitation[]> {
    const data = this.storageManager.getData();
    let invitations = data.invitations.filter(inv => inv.status === 'pending');
    
    if (userId) {
      const userEmail = data.users.find(u => u.id === userId)?.email;
      if (userEmail) {
        invitations = invitations.filter(inv => inv.email === userEmail);
      }
    }
    
    return invitations.map(invitation => ({
      ...invitation,
      groups: data.groups.find(group => group.id === invitation.group_id)
    }));
  }

  async createInvitation(groupId: string, email: string, invitedBy: string): Promise<Invitation> {
    const data = this.storageManager.getData();
    const newInvitation: Invitation = {
      id: this.storageManager.generateId(),
      group_id: groupId,
      email: email.toLowerCase(),
      invited_by: invitedBy,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    data.invitations.push(newInvitation);
    this.storageManager.saveData(data);
    
    return newInvitation;
  }

  async updateInvitation(invitationId: string, status: 'accepted' | 'declined'): Promise<void> {
    const data = this.storageManager.getData();
    const invitationIndex = data.invitations.findIndex(inv => inv.id === invitationId);
    
    if (invitationIndex !== -1) {
      data.invitations[invitationIndex].status = status;
      this.storageManager.saveData(data);
    }
  }
}
