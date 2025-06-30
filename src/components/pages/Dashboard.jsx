import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatsCard from '@/components/molecules/StatsCard';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';
import taskService from '@/services/api/taskService';
import expenseService from '@/services/api/expenseService';
import { format, isToday, addDays } from 'date-fns';

const Dashboard = () => {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [farmsData, cropsData, tasksData, expensesData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll(),
        expenseService.getAll()
      ]);
      
      setFarms(farmsData);
      setCrops(cropsData);
      setTasks(tasksData);
      setExpenses(expensesData);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  // Calculate stats
  const totalFarms = farms.length;
  const activeCrops = crops.filter(crop => crop.status === 'growing').length;
  const todayTasks = tasks.filter(task => !task.completed && isToday(new Date(task.dueDate))).length;
  const monthlyExpenses = expenses
    .filter(expense => new Date(expense.date).getMonth() === new Date().getMonth())
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = tasks
    .filter(task => !task.completed && new Date(task.dueDate) <= addDays(new Date(), 7))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Get recent activities
  const recentActivities = [
    ...crops.slice(-3).map(crop => ({
      type: 'crop',
      message: `Planted ${crop.type}`,
      date: crop.plantingDate,
      icon: 'Sprout'
    })),
    ...tasks.filter(task => task.completed).slice(-2).map(task => ({
      type: 'task',
      message: `Completed: ${task.title}`,
      date: task.dueDate,
      icon: 'CheckCircle'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Good morning, Farm Manager!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening on your farms today
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="primary" icon="Plus">
            Quick Add
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Farms"
          value={totalFarms}
          subtitle={`${farms.reduce((sum, farm) => sum + farm.size, 0)} acres total`}
          icon="MapPin"
          color="forest"
        />
        <StatsCard
          title="Active Crops"
          value={activeCrops}
          subtitle={`${crops.length - activeCrops} planned`}
          icon="Sprout"
          color="green"
          trend="up"
          trendValue="+12%"
        />
        <StatsCard
          title="Today's Tasks"
          value={todayTasks}
          subtitle={`${tasks.filter(t => !t.completed).length} pending total`}
          icon="CheckSquare"
          color="blue"
        />
        <StatsCard
          title="Monthly Expenses"
          value={`$${monthlyExpenses.toLocaleString()}`}
          subtitle="This month"
          icon="DollarSign"
          color="amber"
          trend="down"
          trendValue="-5%"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            <Button variant="ghost" size="sm" icon="ArrowRight">
              View All
            </Button>
          </div>
          
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="CheckCircle" className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">All tasks completed!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const farm = farms.find(f => f.Id === task.farmId);
                const crop = crops.find(c => c.Id === task.cropId);
                const isOverdue = new Date(task.dueDate) < new Date();
                
                return (
                  <motion.div
                    key={task.Id}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-2 w-2 rounded-full ${
                        isOverdue ? 'bg-red-500' : 
                        isToday(new Date(task.dueDate)) ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600">
                          {farm?.name} • {crop?.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        isOverdue ? 'error' : 
                        isToday(new Date(task.dueDate)) ? 'warning' : 'default'
                      }>
                        {format(new Date(task.dueDate), 'MMM d')}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Weather Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Weather Forecast</h2>
            <Button variant="ghost" size="sm" icon="Cloud">
              Full Forecast
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Today's Weather */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Today</p>
                  <p className="text-2xl font-bold text-blue-900">72°F</p>
                  <p className="text-sm text-blue-700">Partly Cloudy</p>
                </div>
                <ApperIcon name="Sun" className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            
            {/* 3-Day Forecast */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { day: 'Tomorrow', temp: '75°F', icon: 'CloudRain', desc: 'Light Rain' },
                { day: 'Wednesday', temp: '68°F', icon: 'Cloud', desc: 'Cloudy' },
                { day: 'Thursday', temp: '71°F', icon: 'Sun', desc: 'Sunny' }
              ].map((forecast, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">{forecast.day}</p>
                  <ApperIcon name={forecast.icon} className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-gray-900">{forecast.temp}</p>
                  <p className="text-xs text-gray-600">{forecast.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <Button variant="ghost" size="sm" icon="Clock">
              View History
            </Button>
          </div>
          
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Activity" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent activities</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="h-8 w-8 bg-forest-100 rounded-full flex items-center justify-center">
                    <ApperIcon name={activity.icon} className="h-4 w-4 text-forest-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(activity.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;