import taskData from '@/services/mockData/tasks.json';

class TaskService {
  constructor() {
    this.tasks = [...taskData];
  }

  async getAll() {
    await this.delay();
    return [...this.tasks];
  }

  async getById(id) {
    await this.delay();
    const task = this.tasks.find(t => t.Id === parseInt(id));
    if (!task) throw new Error('Task not found');
    return { ...task };
  }

  async create(taskData) {
    await this.delay();
    const newTask = {
      Id: this.getNextId(),
      ...taskData,
      createdAt: new Date().toISOString()
    };
    this.tasks.push(newTask);
    return { ...newTask };
  }

  async update(id, taskData) {
    await this.delay();
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Task not found');
    
    this.tasks[index] = {
      ...this.tasks[index],
      ...taskData,
      updatedAt: new Date().toISOString()
    };
    return { ...this.tasks[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) throw new Error('Task not found');
    
    const deletedTask = this.tasks.splice(index, 1)[0];
    return { ...deletedTask };
  }

  getNextId() {
    return this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.Id)) + 1 : 1;
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new TaskService();