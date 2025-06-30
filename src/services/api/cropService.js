import cropData from '@/services/mockData/crops.json';

class CropService {
  constructor() {
    this.crops = [...cropData];
  }

  async getAll() {
    await this.delay();
    return [...this.crops];
  }

  async getById(id) {
    await this.delay();
    const crop = this.crops.find(c => c.Id === parseInt(id));
    if (!crop) throw new Error('Crop not found');
    return { ...crop };
  }

  async create(cropData) {
    await this.delay();
    const newCrop = {
      Id: this.getNextId(),
      ...cropData,
      createdAt: new Date().toISOString()
    };
    this.crops.push(newCrop);
    return { ...newCrop };
  }

  async update(id, cropData) {
    await this.delay();
    const index = this.crops.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('Crop not found');
    
    this.crops[index] = {
      ...this.crops[index],
      ...cropData,
      updatedAt: new Date().toISOString()
    };
    return { ...this.crops[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.crops.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('Crop not found');
    
    const deletedCrop = this.crops.splice(index, 1)[0];
    return { ...deletedCrop };
  }

  getNextId() {
    return this.crops.length > 0 ? Math.max(...this.crops.map(c => c.Id)) + 1 : 1;
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new CropService();