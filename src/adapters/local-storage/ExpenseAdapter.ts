
import { Expense, Balance } from '../types';
import { LocalStorageManager } from './LocalStorageManager';

export class LocalStorageExpenseAdapter {
  private storageManager: LocalStorageManager;

  constructor(storageManager: LocalStorageManager) {
    this.storageManager = storageManager;
  }

  async getExpenses(groupId?: string, limit?: number): Promise<Expense[]> {
    const data = this.storageManager.getData();
    let expenses = data.expenses;
    
    if (groupId) {
      expenses = expenses.filter(expense => expense.group_id === groupId);
    }
    
    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (limit) {
      expenses = expenses.slice(0, limit);
    }
    
    return expenses.map(expense => ({
      ...expense,
      paid_by_user: data.users.find(user => user.id === expense.paid_by)
    }));
  }

  async getExpenseById(expenseId: string): Promise<Expense | null> {
    const data = this.storageManager.getData();
    const expense = data.expenses.find(expense => expense.id === expenseId);
    
    if (!expense) return null;
    
    return {
      ...expense,
      paid_by_user: data.users.find(user => user.id === expense.paid_by)
    };
  }

  async createExpense(expenseData: Omit<Expense, 'id'>): Promise<Expense> {
    const data = this.storageManager.getData();
    const newExpense: Expense = {
      ...expenseData,
      id: this.storageManager.generateId()
    };
    
    data.expenses.push(newExpense);
    this.storageManager.saveData(data);
    
    return newExpense;
  }

  async updateExpense(expenseId: string, updateData: Partial<Expense>): Promise<void> {
    const data = this.storageManager.getData();
    const expenseIndex = data.expenses.findIndex(expense => expense.id === expenseId);
    
    if (expenseIndex !== -1) {
      data.expenses[expenseIndex] = { ...data.expenses[expenseIndex], ...updateData };
      this.storageManager.saveData(data);
    }
  }

  async deleteExpense(expenseId: string): Promise<void> {
    const data = this.storageManager.getData();
    data.expenses = data.expenses.filter(expense => expense.id !== expenseId);
    this.storageManager.saveData(data);
  }

  async calculateBalances(userId?: string): Promise<Balance[]> {
    const data = this.storageManager.getData();
    const userBalances = new Map<string, number>();
    
    data.expenses.forEach(expense => {
      const currentBalance = userBalances.get(expense.paid_by) || 0;
      userBalances.set(expense.paid_by, currentBalance + expense.amount);
    });
    
    const balances: Balance[] = [];
    userBalances.forEach((amount, userId) => {
      const user = data.users.find(u => u.id === userId);
      if (user) {
        balances.push({
          user_id: userId,
          user_name: user.name,
          user_email: user.email,
          amount
        });
      }
    });
    
    return balances;
  }
}
