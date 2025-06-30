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
import cropService from '@/services/api/cropService';
import farmService from '@/services/api/farmService';
import { toast } from 'react-toastify';
import { format, differenceInDays } from 'date-fns';

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    farmId: '',
    type: '',
    plantingDate: '',
    expectedHarvest: '',
    location: '',
    quantity: '',
    status: 'planted'
  });

  const cropTypes = [
    'Corn', 'Wheat', 'Soybeans', 'Rice', 'Barley', 'Oats', 'Tomatoes', 
    'Potatoes', 'Carrots', 'Lettuce', 'Spinach', 'Broccoli', 'Peppers', 'Onions'
  ];

  const statusOptions = [
    { value: 'planted', label: 'Planted' },
    { value: 'growing', label: 'Growing' },
    { value: 'ready', label: 'Ready to Harvest' },
    { value: 'harvested', label: 'Harvested' }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);
      
      setCrops(cropsData);
      setFarms(farmsData);
    } catch (err) {
      setError('Failed to load crops data');
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
      const cropData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        farmId: parseInt(formData.farmId)
      };
      
      if (editingCrop) {
        await cropService.update(editingCrop.Id, cropData);
        toast.success('Crop updated successfully');
      } else {
        await cropService.create(cropData);
        toast.success('Crop added successfully');
      }
      
      setFormData({
        farmId: '',
        type: '',
        plantingDate: '',
        expectedHarvest: '',
        location: '',
        quantity: '',
        status: 'planted'
      });
      setShowAddForm(false);
      setEditingCrop(null);
      loadData();
    } catch (err) {
      toast.error('Failed to save crop');
    }
  };

  const handleEdit = (crop) => {
    setFormData({
      farmId: crop.farmId.toString(),
      type: crop.type,
      plantingDate: crop.plantingDate,
      expectedHarvest: crop.expectedHarvest,
      location: crop.location,
      quantity: crop.quantity.toString(),
      status: crop.status
    });
    setEditingCrop(crop);
    setShowAddForm(true);
  };

  const handleDelete = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return;
    
    try {
      await cropService.delete(cropId);
      toast.success('Crop deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete crop');
    }
  };

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || crop.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'planted': return 'info';
      case 'growing': return 'success';
      case 'ready': return 'warning';
      case 'harvested': return 'default';
      default: return 'default';
    }
  };

  const getDaysToHarvest = (expectedHarvest) => {
    const days = differenceInDays(new Date(expectedHarvest), new Date());
    return days;
  };

  if (loading) return <Loading type="list" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Crops</h1>
          <p className="text-gray-600 mt-1">
            Track your planted crops and harvest schedules
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="primary" 
            icon="Plus"
            onClick={() => {
              setShowAddForm(true);
              setEditingCrop(null);
              setFormData({
                farmId: '',
                type: '',
                plantingDate: '',
                expectedHarvest: '',
                location: '',
                quantity: '',
                status: 'planted'
              });
            }}
          >
            Add Crop
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search crops..."
          className="flex-1"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
            {editingCrop ? 'Edit Crop' : 'Add New Crop'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              type="select"
              label="Farm"
              value={formData.farmId}
              onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
              options={farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))}
              required
            />
            
            <FormField
              type="select"
              label="Crop Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={cropTypes.map(type => ({ value: type, label: type }))}
              required
            />
            
            <FormField
              label="Planting Date"
              type="date"
              value={formData.plantingDate}
              onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
              required
            />
            
            <FormField
              label="Expected Harvest"
              type="date"
              value={formData.expectedHarvest}
              onChange={(e) => setFormData({ ...formData, expectedHarvest: e.target.value })}
              required
            />
            
            <FormField
              label="Location in Farm"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., North Field, Section A"
              required
            />
            
            <FormField
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Amount planted"
              required
            />
            
            <FormField
              type="select"
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={statusOptions}
            />
            
            <div className="md:col-span-2 flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCrop(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingCrop ? 'Update Crop' : 'Add Crop'}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <Empty
          title="No crops found"
          description="Start tracking your crops by adding your first planting record"
          actionLabel="Add Crop"
          onAction={() => {
            setShowAddForm(true);
            setEditingCrop(null);
            setFormData({
              farmId: '',
              type: '',
              plantingDate: '',
              expectedHarvest: '',
              location: '',
              quantity: '',
              status: 'planted'
            });
          }}
          icon="Sprout"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop, index) => {
            const daysToHarvest = getDaysToHarvest(crop.expectedHarvest);
            
            return (
              <motion.div
                key={crop.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="card bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Sprout" className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{crop.type}</h3>
                      <p className="text-sm text-gray-600">{getFarmName(crop.farmId)}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(crop)}
                      className="p-2 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Edit2" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(crop.Id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant={getStatusVariant(crop.status)}>
                      {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Location</span>
                    <span className="text-sm font-medium text-gray-900">{crop.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Quantity</span>
                    <span className="text-sm font-medium text-gray-900">{crop.quantity}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Planted</span>
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(crop.plantingDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Harvest</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(crop.expectedHarvest), 'MMM d, yyyy')}
                      </span>
                      {daysToHarvest > 0 && (
                        <p className="text-xs text-gray-500">
                          {daysToHarvest} days remaining
                        </p>
                      )}
                      {daysToHarvest <= 0 && crop.status !== 'harvested' && (
                        <p className="text-xs text-amber-600 font-medium">
                          Ready for harvest!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Crops;