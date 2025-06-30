import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const StatsCard = ({ title, value, subtitle, icon, trend, trendValue, color = 'forest' }) => {
  const colorClasses = {
    forest: 'from-forest-600 to-forest-500',
    amber: 'from-amber-600 to-amber-500',
    blue: 'from-blue-600 to-blue-500',
    green: 'from-green-600 to-green-500'
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="card bg-gradient-to-br from-white to-gray-50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <ApperIcon name={icon} className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            <ApperIcon 
              name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
              className="h-4 w-4 mr-1" 
            />
            {trendValue}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;