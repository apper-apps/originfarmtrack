import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
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
import { format, addYears, subYears } from 'date-fns';

const CropRotationPlanner = () => {
  const [farms, setFarms] = useState([]);
  const [rotationHistory, setRotationHistory] = useState([]);
  const [rotationPlans, setRotationPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFarm, setSelectedFarm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, soilHealth, yield

  // Form state for rotation plan
  const [formData, setFormData] = useState({
    farmId: '',
    cropSequence: ['', '', ''],
    startYear: new Date().getFullYear(),
    duration: 3,
    notes: ''
  });

  const cropTypes = [
    'Corn', 'Wheat', 'Soybeans', 'Rice', 'Barley', 'Oats', 'Tomatoes', 
    'Potatoes', 'Carrots', 'Lettuce', 'Spinach', 'Broccoli', 'Peppers', 'Onions'
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [farmsData, cropsData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll()
      ]);
      
      setFarms(farmsData);
      
      // Filter rotation plans and historical data
      const plans = cropsData.filter(crop => crop.type === 'rotation_plan');
      const history = cropsData.filter(crop => crop.status === 'harvested');
      
      setRotationPlans(plans);
      setRotationHistory(history);
      
    } catch (err) {
      setError('Failed to load rotation data');
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
      const planData = {
        ...formData,
        farmId: parseInt(formData.farmId),
        cropSequence: formData.cropSequence.filter(crop => crop.trim() !== '')
      };
      
      if (editingPlan) {
        await cropService.updateRotationPlan(editingPlan.Id, planData);
        toast.success('Rotation plan updated successfully');
      } else {
        await cropService.createRotationPlan(planData);
        toast.success('Rotation plan created successfully');
      }
      
      setFormData({
        farmId: '',
        cropSequence: ['', '', ''],
        startYear: new Date().getFullYear(),
        duration: 3,
        notes: ''
      });
      setShowPlanForm(false);
      setEditingPlan(null);
      loadData();
    } catch (err) {
      toast.error('Failed to save rotation plan');
    }
  };

  const handleEdit = (plan) => {
    setFormData({
      farmId: plan.farmId.toString(),
      cropSequence: [...plan.cropSequence, '', ''].slice(0, 3),
      startYear: plan.startYear,
      duration: plan.duration,
      notes: plan.notes || ''
    });
    setEditingPlan(plan);
    setShowPlanForm(true);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this rotation plan?')) return;
    
    try {
      await cropService.delete(planId);
      toast.success('Rotation plan deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete rotation plan');
    }
  };

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };

  const getTimelineChartData = () => {
    const filteredHistory = selectedFarm 
      ? rotationHistory.filter(crop => crop.farmId === parseInt(selectedFarm))
      : rotationHistory;

    const categories = filteredHistory.map(crop => format(new Date(crop.plantingDate), 'MMM yyyy'));
    const soilHealthData = filteredHistory.map(crop => crop.soilHealthScore || 70);
    const yieldData = filteredHistory.map(crop => crop.yieldData?.actual || crop.quantity);

    return {
      series: [
        {
          name: 'Soil Health Score',
          type: 'line',
          data: soilHealthData
        },
        {
          name: 'Yield',
          type: 'column',
          data: yieldData
        }
      ],
      options: {
        chart: {
          type: 'line',
          height: 350,
          toolbar: {
            show: true
          }
        },
        colors: ['#10B981', '#F59E0B'],
        stroke: {
          width: [3, 0]
        },
        plotOptions: {
          bar: {
            columnWidth: '50%'
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: categories,
          title: {
            text: 'Planting Period'
          }
        },
        yaxis: [
          {
            title: {
              text: 'Soil Health Score'
            },
            min: 0,
            max: 100
          },
          {
            opposite: true,
            title: {
              text: 'Yield'
            }
          }
        ],
        legend: {
          position: 'top'
        },
        title: {
          text: 'Crop Rotation Impact Analysis',
          align: 'left'
        }
      }
    };
  };

  const getSoilHealthChartData = () => {
    const cropTypeHealth = {};
    rotationHistory.forEach(crop => {
      if (!cropTypeHealth[crop.type]) {
        cropTypeHealth[crop.type] = [];
      }
      cropTypeHealth[crop.type].push(crop.soilHealthScore || 70);
    });

    const categories = Object.keys(cropTypeHealth);
    const avgHealthScores = categories.map(type => {
      const scores = cropTypeHealth[type];
      return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    });

    return {
      series: [{
        name: 'Average Soil Health Score',
        data: avgHealthScores
      }],
      options: {
        chart: {
          type: 'bar',
          height: 350
        },
        colors: ['#10B981'],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: categories,
          title: {
            text: 'Crop Types'
          }
        },
        yaxis: {
          title: {
            text: 'Soil Health Score'
          },
          min: 0,
          max: 100
        },
        title: {
          text: 'Soil Health Impact by Crop Type',
          align: 'left'
        }
      }
    };
  };

  const filteredPlans = rotationPlans.filter(plan => {
    const matchesSearch = plan.cropSequence?.some(crop => 
      crop.toLowerCase().includes(searchTerm.toLowerCase())
    ) || plan.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFarm = !selectedFarm || plan.farmId === parseInt(selectedFarm);
    return matchesSearch && matchesFarm;
  });

  if (loading) return <Loading type="list" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Crop Rotation Planner</h1>
          <p className="text-gray-600 mt-1">
            Plan crop rotations and analyze their impact on soil health
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="primary" 
            icon="Plus"
            onClick={() => {
              setShowPlanForm(true);
              setEditingPlan(null);
              setFormData({
                farmId: '',
                cropSequence: ['', '', ''],
                startYear: new Date().getFullYear(),
                duration: 3,
                notes: ''
              });
            }}
          >
            Create Rotation Plan
          </Button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={viewMode === 'timeline' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('timeline')}
          icon="Calendar"
        >
          Timeline Analysis
        </Button>
        <Button 
          variant={viewMode === 'soilHealth' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('soilHealth')}
          icon="BarChart3"
        >
          Soil Health Impact
        </Button>
        <Button 
          variant={viewMode === 'plans' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('plans')}
          icon="FileText"
        >
          Rotation Plans
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search rotation plans..."
          className="flex-1"
        />
        <select
          value={selectedFarm}
          onChange={(e) => setSelectedFarm(e.target.value)}
          className="input-field w-full sm:w-auto"
        >
          <option value="">All Farms</option>
          {farms.map(farm => (
            <option key={farm.Id} value={farm.Id}>
              {farm.name}
            </option>
          ))}
        </select>
      </div>

      {/* Charts Section */}
      {(viewMode === 'timeline' || viewMode === 'soilHealth') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          {viewMode === 'timeline' && rotationHistory.length > 0 && (
            <Chart
              options={getTimelineChartData().options}
              series={getTimelineChartData().series}
              type="line"
              height={350}
            />
          )}
          {viewMode === 'soilHealth' && rotationHistory.length > 0 && (
            <Chart
              options={getSoilHealthChartData().options}
              series={getSoilHealthChartData().series}
              type="bar"
              height={350}
            />
          )}
          {rotationHistory.length === 0 && (
            <div className="text-center py-12">
              <ApperIcon name="BarChart3" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No historical data available for visualization</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Add/Edit Form */}
      {showPlanForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPlan ? 'Edit Rotation Plan' : 'Create New Rotation Plan'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                type="select"
                label="Farm"
                value={formData.farmId}
                onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                options={farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))}
                required
              />
              
              <FormField
                label="Start Year"
                type="number"
                value={formData.startYear}
                onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value) })}
                min={new Date().getFullYear()}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crop Sequence (3-year rotation)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.cropSequence.map((crop, index) => (
                  <FormField
                    key={index}
                    type="select"
                    label={`Year ${index + 1}`}
                    value={crop}
                    onChange={(e) => {
                      const newSequence = [...formData.cropSequence];
                      newSequence[index] = e.target.value;
                      setFormData({ ...formData, cropSequence: newSequence });
                    }}
                    options={[
                      { value: '', label: 'Select crop...' },
                      ...cropTypes.map(type => ({ value: type, label: type }))
                    ]}
                    required={index < 2}
                  />
                ))}
              </div>
            </div>

            <FormField
              label="Notes"
              type="textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes about this rotation plan..."
              rows={3}
            />
            
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowPlanForm(false);
                  setEditingPlan(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Rotation Plans Grid */}
      {viewMode === 'plans' && (
        <div>
          {filteredPlans.length === 0 ? (
            <Empty
              title="No rotation plans found"
              description="Create your first crop rotation plan to optimize soil health and yields"
              actionLabel="Create Plan"
              onAction={() => {
                setShowPlanForm(true);
                setEditingPlan(null);
                setFormData({
                  farmId: '',
                  cropSequence: ['', '', ''],
                  startYear: new Date().getFullYear(),
                  duration: 3,
                  notes: ''
                });
              }}
              icon="RotateCw"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan, index) => (
                <motion.div
                  key={plan.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="card bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                        <ApperIcon name="RotateCw" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {plan.startYear} Plan
                        </h3>
                        <p className="text-sm text-gray-600">{getFarmName(plan.farmId)}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Edit2" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.Id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">Crop Sequence:</span>
                      <div className="flex flex-wrap gap-1">
                        {plan.cropSequence?.map((crop, idx) => (
                          <Badge key={idx} variant="info">
                            Year {idx + 1}: {crop}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="text-sm font-medium text-gray-900">
                        {plan.duration || 3} years
                      </span>
                    </div>
                    
                    {plan.notes && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Notes:</span>
                        <p className="text-sm text-gray-700 line-clamp-2">{plan.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropRotationPlanner;