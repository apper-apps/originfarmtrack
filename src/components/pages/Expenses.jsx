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
import expenseService from '@/services/api/expenseService';
import farmService from '@/services/api/farmService';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import Chart from 'react-apexcharts';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    farmId: '',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const expenseCategories = [
    'Seeds', 'Fertilizer', 'Pesticides', 'Equipment', 'Labor', 'Fuel', 
    'Maintenance', 'Utilities', 'Insurance', 'Feed', 'Veterinary', 'Other'
  ];

  const periodOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [expensesData, farmsData] = await Promise.all([
        expenseService.getAll(),
        farmService.getAll()
      ]);
      
      setExpenses(expensesData);
      setFarms(farmsData);
    } catch (err) {
      setError('Failed to load expenses data');
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
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        farmId: parseInt(formData.farmId)
      };
      
      if (editingExpense) {
        await expenseService.update(editingExpense.Id, expenseData);
        toast.success('Expense updated successfully');
      } else {
        await expenseService.create(expenseData);
        toast.success('Expense added successfully');
      }
      
      setFormData({
        farmId: '',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      setEditingExpense(null);
      loadData();
    } catch (err) {
      toast.error('Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      farmId: expense.farmId.toString(),
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      date: expense.date
    });
    setEditingExpense(expense);
    setShowAddForm(true);
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expenseService.delete(expenseId);
      toast.success('Expense deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const getFilteredExpenses = () => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      
      let matchesPeriod = true;
      const expenseDate = new Date(expense.date);
      const now = new Date();
      
      if (filterPeriod === 'month') {
        matchesPeriod = expenseDate >= startOfMonth(now) && expenseDate <= endOfMonth(now);
      } else if (filterPeriod === 'year') {
        matchesPeriod = expenseDate >= startOfYear(now) && expenseDate <= endOfYear(now);
      }
      
      return matchesSearch && matchesCategory && matchesPeriod;
    });
    
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredExpenses = getFilteredExpenses();

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Seeds': 'bg-green-100 text-green-800',
      'Fertilizer': 'bg-blue-100 text-blue-800',
      'Pesticides': 'bg-red-100 text-red-800',
      'Equipment': 'bg-purple-100 text-purple-800',
      'Labor': 'bg-yellow-100 text-yellow-800',
      'Fuel': 'bg-orange-100 text-orange-800',
      'Maintenance': 'bg-gray-100 text-gray-800',
      'Utilities': 'bg-indigo-100 text-indigo-800',
      'Insurance': 'bg-pink-100 text-pink-800',
      'Feed': 'bg-amber-100 text-amber-800',
      'Veterinary': 'bg-cyan-100 text-cyan-800',
      'Other': 'bg-slate-100 text-slate-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Calculate summary statistics
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensesByCategory = expenseCategories.map(category => {
    const categoryExpenses = filteredExpenses.filter(e => e.category === category);
    return {
      category,
      amount: categoryExpenses.reduce((sum, e) => sum + e.amount, 0),
      count: categoryExpenses.length
    };
  }).filter(cat => cat.amount > 0);

  // Chart data
  const chartOptions = {
    chart: {
      type: 'donut',
      height: 300
    },
    labels: expensesByCategory.map(cat => cat.category),
    plotOptions: {
      pie: {
        donut: {
          size: '70%'
        }
      }
    },
    colors: ['#2D5016', '#7CB342', '#FF6F00', '#43A047', '#FB8C00', '#1976D2', '#E53935', '#9C27B0'],
    legend: {
      position: 'bottom'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 250
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const chartSeries = expensesByCategory.map(cat => cat.amount);

  if (loading) return <Loading type="list" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your farm-related expenses
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="primary" 
            icon="Plus"
            onClick={() => {
              setShowAddForm(true);
              setEditingExpense(null);
              setFormData({
                farmId: '',
                amount: '',
                category: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
              });
            }}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
        >
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="DollarSign" className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-600">Total Expenses</p>
              <p className="text-2xl font-bold text-amber-900">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-forest-50 to-forest-100 border-forest-200"
        >
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gradient-to-r from-forest-600 to-forest-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="Receipt" className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-forest-600">Total Records</p>
              <p className="text-2xl font-bold text-forest-900">
                {filteredExpenses.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        >
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Average per Record</p>
              <p className="text-2xl font-bold text-blue-900">
                ${filteredExpenses.length ? Math.round(totalExpenses / filteredExpenses.length) : 0}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search expenses..."
          className="flex-1"
        />
        <div className="flex gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            {expenseCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            {periodOptions.map(option => (
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
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
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
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={expenseCategories.map(cat => ({ value: cat, label: cat }))}
              required
            />
            
            <FormField
              label="Amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
            
            <FormField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            
            <div className="md:col-span-2">
              <FormField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description of the expense..."
                required
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingExpense(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses List */}
        <div className="lg:col-span-2">
          {filteredExpenses.length === 0 ? (
            <Empty
              title="No expenses found"
              description="Start tracking your farm expenses by adding your first record"
              actionLabel="Add Expense"
              onAction={() => {
                setShowAddForm(true);
                setEditingExpense(null);
                setFormData({
                  farmId: '',
                  amount: '',
                  category: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0]
                });
              }}
              icon="DollarSign"
            />
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card hover:shadow-card-hover"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Receipt" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            ${expense.amount.toLocaleString()}
                          </h3>
                          <span className={`status-pill ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{expense.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="MapPin" className="h-4 w-4" />
                            <span>{getFarmName(expense.farmId)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Calendar" className="h-4 w-4" />
                            <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Edit2" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.Id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Chart and Summary */}
        <div className="space-y-6">
          {/* Category Breakdown Chart */}
          {expensesByCategory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Expenses by Category
              </h3>
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="donut"
                height={300}
              />
            </motion.div>
          )}

          {/* Category Summary */}
          {expensesByCategory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Category Summary
              </h3>
              <div className="space-y-3">
                {expensesByCategory
                  .sort((a, b) => b.amount - a.amount)
                  .map((cat, index) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(cat.category).replace('text-', 'bg-').replace('-800', '-500')}`} />
                        <span className="text-sm font-medium text-gray-900">
                          {cat.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ${cat.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cat.count} record{cat.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;