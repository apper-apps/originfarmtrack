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

async getRotationHistory(farmId) {
    await this.delay();
    const rotations = this.crops.filter(crop => 
      crop.farmId === parseInt(farmId) && crop.status === 'harvested'
    );
    return rotations.map(crop => ({
      ...crop,
      soilHealthScore: this.calculateSoilHealthScore(crop),
      yieldData: this.generateYieldData(crop)
    }));
  }

  async createRotationPlan(planData) {
    await this.delay();
    const newPlan = {
      Id: this.getNextId(),
      ...planData,
      type: 'rotation_plan',
      status: 'planned',
      createdAt: new Date().toISOString()
    };
    this.crops.push(newPlan);
    return { ...newPlan };
  }

  async updateRotationPlan(id, planData) {
    await this.delay();
    const index = this.crops.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error('Rotation plan not found');
    
    this.crops[index] = {
      ...this.crops[index],
      ...planData,
      updatedAt: new Date().toISOString()
    };
    return { ...this.crops[index] };
  }

  async getRotationPlanById(id) {
    await this.delay();
    const plan = this.crops.find(c => c.Id === parseInt(id) && c.type === 'rotation_plan');
    if (!plan) throw new Error('Rotation plan not found');
    return { ...plan };
  }

  calculateSoilHealthScore(crop) {
    // Simulate soil health calculation based on crop type and rotation
    const healthScores = {
      'Corn': 65,
      'Soybeans': 85,
      'Wheat': 75,
      'Tomatoes': 60,
      'Potatoes': 55,
      'Carrots': 70,
      'Lettuce': 80,
      'Peppers': 65,
      'Barley': 78,
      'Oats': 82
    };
    return healthScores[crop.type] || 70;
  }

  generateYieldData(crop) {
    // Simulate yield data for visualization
    const baseYield = crop.quantity;
    return {
      actual: baseYield,
      expected: baseYield * 0.95,
      previous: baseYield * 0.88
    };
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new CropService();