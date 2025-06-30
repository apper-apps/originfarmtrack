import farmData from '@/services/mockData/farms.json';

class FarmService {
  constructor() {
    this.farms = [...farmData];
  }

  async getAll() {
    await this.delay();
    return [...this.farms];
  }

  async getById(id) {
    await this.delay();
    const farm = this.farms.find(f => f.Id === parseInt(id));
    if (!farm) throw new Error('Farm not found');
    return { ...farm };
  }

  async create(farmData) {
    await this.delay();
    const newFarm = {
      Id: this.getNextId(),
      ...farmData,
      size: parseFloat(farmData.size),
      createdAt: new Date().toISOString()
    };
    this.farms.push(newFarm);
    return { ...newFarm };
  }

  async update(id, farmData) {
    await this.delay();
    const index = this.farms.findIndex(f => f.Id === parseInt(id));
    if (index === -1) throw new Error('Farm not found');
    
    this.farms[index] = {
      ...this.farms[index],
      ...farmData,
      size: parseFloat(farmData.size),
      updatedAt: new Date().toISOString()
    };
    return { ...this.farms[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.farms.findIndex(f => f.Id === parseInt(id));
    if (index === -1) throw new Error('Farm not found');
    
    const deletedFarm = this.farms.splice(index, 1)[0];
    return { ...deletedFarm };
  }

  getNextId() {
    return this.farms.length > 0 ? Math.max(...this.farms.map(f => f.Id)) + 1 : 1;
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new FarmService();