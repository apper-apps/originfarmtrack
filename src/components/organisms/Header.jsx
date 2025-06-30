import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-forest-700 hover:bg-forest-50"
        >
          <ApperIcon name="Menu" className="h-6 w-6" />
        </button>
        
        {/* Search Bar - Hidden on mobile for space */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ApperIcon name="Search" className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search farms, crops, tasks..."
              className="input-field pl-10 pr-4 w-full"
            />
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="p-2 rounded-lg text-gray-600 hover:text-forest-700 hover:bg-forest-50 relative">
            <ApperIcon name="Bell" className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Weather Quick View */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
            <ApperIcon name="Sun" className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">72°F</span>
          </div>
          
          {/* Quick Add Button */}
          <Button
            variant="primary"
            size="sm"
            icon="Plus"
            className="hidden sm:flex"
          >
            Quick Add
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;