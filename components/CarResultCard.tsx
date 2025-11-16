import React from 'react';
import { CarInfo } from '../services/geminiService';
import Button from './Button';

interface CarResultCardProps {
  car: CarInfo;
  onSelect: (price: number) => void;
}

const CarResultCard: React.FC<CarResultCardProps> = ({ car, onSelect }) => {
    
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl transform hover:scale-105 transition-transform duration-300 flex flex-col p-4">
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{car.brand} {car.model}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{car.trim}</p>
      </div>
      <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 my-4 text-center">
        {formatCurrency(car.price)}
      </p>
      <Button onClick={() => onSelect(car.price)} className="w-full mt-auto">
        เลือกคันนี้
      </Button>
    </div>
  );
};

export default CarResultCard;