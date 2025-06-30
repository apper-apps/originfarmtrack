import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    primary: 'bg-forest-100 text-forest-800'
  };
  
  return (
    <span className={`status-pill ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;