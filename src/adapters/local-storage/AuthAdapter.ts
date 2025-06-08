
import { AuthUser, AuthSession, User } from '../types';
import { LocalStorageManager } from './LocalStorageManager';

export class LocalStorageAuthAdapter {
  private currentUser: AuthUser | null = null;
  private storageManager: LocalStorageManager;

  constructor(storageManager: LocalStorageManager) {
    this.storageManager = storageManager;
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const data = this.storageManager.getData();
    this.currentUser = data.currentUser;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentUser;
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    if (!this.currentUser) return null;
    
    return {
      user: this.currentUser,
      access_token: 'local-token',
      expires_at: Date.now() + 3600000
    };
  }

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    const data = this.storageManager.getData();
    const user = data.users.find(u => u.email === email);
    
    if (!user) {
      return { user: null, error: new Error('User not found') };
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    this.currentUser = authUser;
    data.currentUser = authUser;
    this.storageManager.saveData(data);

    return { user: authUser, error: null };
  }

  async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    const data = this.storageManager.getData();
    const existingUser = data.users.find(u => u.email === email);
    
    if (existingUser) {
      return { user: null, error: new Error('User already exists') };
    }

    const newUser: User = {
      id: this.storageManager.generateId(),
      email,
      name: email.split('@')[0],
      wallet_address: null
    };

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    };

    data.users.push(newUser);
    this.currentUser = authUser;
    data.currentUser = authUser;
    this.storageManager.saveData(data);

    return { user: authUser, error: null };
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    const data = this.storageManager.getData();
    data.currentUser = null;
    this.storageManager.saveData(data);
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    callback(this.currentUser);
    return () => {};
  }
}
