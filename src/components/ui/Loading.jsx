import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ type = 'default' }) => {
  if (type === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48 rounded-lg"></div>
          <div className="skeleton h-10 w-32 rounded-lg"></div>
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card"
            >
              <div className="skeleton h-4 w-24 rounded mb-2"></div>
              <div className="skeleton h-8 w-16 rounded mb-1"></div>
              <div className="skeleton h-3 w-32 rounded"></div>
            </motion.div>
          ))}
        </div>
        
        {/* Content areas skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="skeleton h-6 w-32 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="skeleton h-4 w-4 rounded"></div>
                  <div className="skeleton h-4 flex-1 rounded"></div>
                  <div className="skeleton h-6 w-16 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <div className="skeleton h-6 w-28 rounded mb-4"></div>
            <div className="skeleton h-32 w-full rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'list') {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="skeleton h-12 w-12 rounded-lg"></div>
                <div>
                  <div className="skeleton h-5 w-32 rounded mb-2"></div>
                  <div className="skeleton h-4 w-48 rounded"></div>
                </div>
              </div>
              <div className="skeleton h-8 w-20 rounded-full"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-3 border-forest-200 border-t-forest-600 rounded-full mx-auto mb-4"
        />
        <p className="text-gray-600 font-medium">Loading...</p>
      </motion.div>
    </div>
  );
};

export default Loading;