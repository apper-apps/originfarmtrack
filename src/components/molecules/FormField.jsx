import React from 'react';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';

const FormField = ({ type = 'text', ...props }) => {
  if (type === 'select') {
    return <Select {...props} />;
  }
  
  return <Input type={type} {...props} />;
};

export default FormField;