import expenseData from '@/services/mockData/expenses.json';

class ExpenseService {
  constructor() {
    this.expenses = [...expenseData];
  }

  async getAll() {
    await this.delay();
    return [...this.expenses];
  }

  async getById(id) {
    await this.delay();
    const expense = this.expenses.find(e => e.Id === parseInt(id));
    if (!expense) throw new Error('Expense not found');
    return { ...expense };
  }

  async create(expenseData) {
    await this.delay();
    const newExpense = {
      Id: this.getNextId(),
      ...expenseData,
      createdAt: new Date().toISOString()
    };
    this.expenses.push(newExpense);
    return { ...newExpense };
  }

  async update(id, expenseData) {
    await this.delay();
    const index = this.expenses.findIndex(e => e.Id === parseInt(id));
    if (index === -1) throw new Error('Expense not found');
    
    this.expenses[index] = {
      ...this.expenses[index],
      ...expenseData,
      updatedAt: new Date().toISOString()
    };
    return { ...this.expenses[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.expenses.findIndex(e => e.Id === parseInt(id));
    if (index === -1) throw new Error('Expense not found');
    
    const deletedExpense = this.expenses.splice(index, 1)[0];
    return { ...deletedExpense };
  }

  getNextId() {
    return this.expenses.length > 0 ? Math.max(...this.expenses.map(e => e.Id)) + 1 : 1;
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new ExpenseService();