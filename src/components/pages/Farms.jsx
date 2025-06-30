import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import FormField from '@/components/molecules/FormField';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';
import { toast } from 'react-toastify';

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    sizeUnit: 'acres'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [farmsData, cropsData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll()
      ]);
      
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError('Failed to load farms data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingFarm) {
        await farmService.update(editingFarm.Id, formData);
        toast.success('Farm updated successfully');
      } else {
        await farmService.create(formData);
        toast.success('Farm added successfully');
      }
      
      setFormData({ name: '', location: '', size: '', sizeUnit: 'acres' });
      setShowAddForm(false);
      setEditingFarm(null);
      loadData();
    } catch (err) {
      toast.error('Failed to save farm');
    }
  };

  const handleEdit = (farm) => {
    setFormData({
      name: farm.name,
      location: farm.location,
      size: farm.size.toString(),
      sizeUnit: farm.sizeUnit
    });
    setEditingFarm(farm);
    setShowAddForm(true);
  };

  const handleDelete = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm?')) return;
    
    try {
      await farmService.delete(farmId);
      toast.success('Farm deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete farm');
    }
  };

  const filteredFarms = farms.filter(farm => 
    farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFarmCropsCount = (farmId) => {
    return crops.filter(crop => crop.farmId === farmId).length;
  };

  if (loading) return <Loading type="list" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Farms</h1>
          <p className="text-gray-600 mt-1">
            Manage your farm locations and properties
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="primary" 
            icon="Plus"
            onClick={() => {
              setShowAddForm(true);
              setEditingFarm(null);
              setFormData({ name: '', location: '', size: '', sizeUnit: 'acres' });
            }}
          >
            Add Farm
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search farms..."
          className="flex-1"
        />
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingFarm ? 'Edit Farm' : 'Add New Farm'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Farm Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            
            <FormField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            
            <FormField
              label="Size"
              type="number"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              required
            />
            
            <FormField
              type="select"
              label="Size Unit"
              value={formData.sizeUnit}
              onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value })}
              options={[
                { value: 'acres', label: 'Acres' },
                { value: 'hectares', label: 'Hectares' },
                { value: 'sq_ft', label: 'Square Feet' }
              ]}
            />
            
            <div className="md:col-span-2 flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingFarm(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingFarm ? 'Update Farm' : 'Add Farm'}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Farms Grid */}
      {filteredFarms.length === 0 ? (
        <Empty
          title="No farms found"
          description="Add your first farm to start managing your agriculture operations"
          actionLabel="Add Farm"
          onAction={() => {
            setShowAddForm(true);
            setEditingFarm(null);
            setFormData({ name: '', location: '', size: '', sizeUnit: 'acres' });
          }}
          icon="MapPin"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((farm, index) => (
            <motion.div
              key={farm.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="card bg-gradient-to-br from-white to-gray-50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-r from-forest-600 to-forest-500 rounded-lg flex items-center justify-center">
                    <ApperIcon name="MapPin" className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{farm.name}</h3>
                    <p className="text-sm text-gray-600">{farm.location}</p>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(farm)}
                    className="p-2 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"
                  >
                    <ApperIcon name="Edit2" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(farm.Id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Size</span>
                  <Badge variant="primary">
                    {farm.size} {farm.sizeUnit}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Crops</span>
                  <Badge variant="success">
                    {getFarmCropsCount(farm.Id)} crops
                  </Badge>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <Button variant="ghost" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Farms;