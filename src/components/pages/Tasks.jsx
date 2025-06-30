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
import taskService from '@/services/api/taskService';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';
import { toast } from 'react-toastify';
import { format, isToday, isPast, isFuture } from 'date-fns';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  
  // Form state
  const [formData, setFormData] = useState({
    farmId: '',
    cropId: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    completed: false
  });

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const commonTasks = [
    'Watering', 'Fertilizing', 'Weeding', 'Pest Control', 'Harvesting',
    'Soil Testing', 'Pruning', 'Planting', 'Equipment Maintenance'
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);
      
      setTasks(tasksData);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError('Failed to load tasks data');
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
      const taskData = {
        ...formData,
        farmId: parseInt(formData.farmId),
        cropId: formData.cropId ? parseInt(formData.cropId) : null
      };
      
      if (editingTask) {
        await taskService.update(editingTask.Id, taskData);
        toast.success('Task updated successfully');
      } else {
        await taskService.create(taskData);
        toast.success('Task added successfully');
      }
      
      setFormData({
        farmId: '',
        cropId: '',
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        completed: false
      });
      setShowAddForm(false);
      setEditingTask(null);
      loadData();
    } catch (err) {
      toast.error('Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setFormData({
      farmId: task.farmId.toString(),
      cropId: task.cropId ? task.cropId.toString() : '',
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      completed: task.completed
    });
    setEditingTask(task);
    setShowAddForm(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.delete(taskId);
      toast.success('Task deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await taskService.update(task.Id, { ...task, completed: !task.completed });
      toast.success(`Task ${!task.completed ? 'completed' : 'reopened'}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.completed) ||
                         (filterStatus === 'pending' && !task.completed);
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };

  const getCropName = (cropId) => {
    if (!cropId) return null;
    const crop = crops.find(c => c.Id === cropId);
    return crop ? crop.type : 'Unknown Crop';
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'low': return 'default';
      case 'medium': return 'info';
      case 'high': return 'warning';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const getTaskUrgency = (dueDate, completed) => {
    if (completed) return 'completed';
    const taskDate = new Date(dueDate);
    if (isPast(taskDate) && !isToday(taskDate)) return 'overdue';
    if (isToday(taskDate)) return 'today';
    return 'upcoming';
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'today': return 'text-amber-600 bg-amber-50';
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) return <Loading type="list" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage your farming tasks and schedules
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-forest-700 shadow-sm' 
                  : 'text-gray-600 hover:text-forest-700'
              }`}
            >
              <ApperIcon name="List" className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white text-forest-700 shadow-sm' 
                  : 'text-gray-600 hover:text-forest-700'
              }`}
            >
              <ApperIcon name="Calendar" className="h-4 w-4" />
            </button>
          </div>
          <Button 
            variant="primary" 
            icon="Plus"
            onClick={() => {
              setShowAddForm(true);
              setEditingTask(null);
              setFormData({
                farmId: '',
                cropId: '',
                title: '',
                description: '',
                dueDate: '',
                priority: 'medium',
                completed: false
              });
            }}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tasks..."
          className="flex-1"
        />
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="all">All Priority</option>
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
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
            {editingTask ? 'Edit Task' : 'Add New Task'}
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
              label="Crop (Optional)"
              value={formData.cropId}
              onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
              options={crops
                .filter(crop => !formData.farmId || crop.farmId.toString() === formData.farmId)
                .map(crop => ({ value: crop.Id.toString(), label: crop.type }))}
            />
            
            <FormField
              type="select"
              label="Task Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              options={commonTasks.map(task => ({ value: task, label: task }))}
              required
            />
            
            <FormField
              type="select"
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={priorityOptions}
            />
            
            <FormField
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
            
            <div className="md:col-span-2">
              <FormField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about the task..."
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTask(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Empty
          title="No tasks found"
          description="Add your first farming task to start organizing your work"
          actionLabel="Add Task"
          onAction={() => {
            setShowAddForm(true);
            setEditingTask(null);
            setFormData({
              farmId: '',
              cropId: '',
              title: '',
              description: '',
              dueDate: '',
              priority: 'medium',
              completed: false
            });
          }}
          icon="CheckSquare"
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => {
            const urgency = getTaskUrgency(task.dueDate, task.completed);
            const cropName = getCropName(task.cropId);
            
            return (
              <motion.div
                key={task.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card ${task.completed ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-forest-500'
                      }`}
                    >
                      {task.completed && <ApperIcon name="Check" className="h-3 w-3" />}
                    </button>
                    
                    {/* Task Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-semibold ${
                          task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h3>
                        <Badge variant={getPriorityVariant(task.priority)}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(urgency)}`}>
                          {urgency === 'overdue' && 'Overdue'}
                          {urgency === 'today' && 'Due Today'}
                          {urgency === 'upcoming' && 'Upcoming'}
                          {urgency === 'completed' && 'Completed'}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="MapPin" className="h-4 w-4" />
                          <span>{getFarmName(task.farmId)}</span>
                        </div>
                        {cropName && (
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Sprout" className="h-4 w-4" />
                            <span>{cropName}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Calendar" className="h-4 w-4" />
                          <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm ${
                          task.completed ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-1 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Edit2" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.Id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </button>
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

export default Tasks;