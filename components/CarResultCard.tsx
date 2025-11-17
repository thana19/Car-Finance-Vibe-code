import React, { useState } from 'react';
import { CarInfo } from '../services/geminiService';
import Button from './Button';
import CarIcon from './icons/CarIcon';

interface CarResultCardProps {
  car: CarInfo;
  onSelect: (car: CarInfo) => void;
}

const CarResultCard: React.FC<CarResultCardProps> = ({ car, onSelect }) => {
  const [imageError, setImageError] = useState(false);
  const [logoImageError, setLogoImageError] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleImageError = () => setImageError(true);
  const handleLogoError = () => setLogoImageError(true);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl transform hover:scale-105 transition-transform duration-300 flex flex-col overflow-hidden">
      <div className="relative w-full h-36 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {car.imageUrl && !imageError ? (
          <img
            src={car.imageUrl}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        ) : car.brandLogoUrl && !logoImageError ? (
          <img
            src={car.brandLogoUrl}
            alt={`${car.brand} Logo`}
            className="w-auto h-20 max-w-[75%] object-contain"
            onError={handleLogoError}
            loading="lazy"
          />
        ) : (
          <div className="text-gray-400 dark:text-gray-500">
            <CarIcon className="w-16 h-16" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate" title={`${car.brand} ${car.model}`}>{car.brand} {car.model}</h3>
          {car.trim && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{car.trim}</p>}
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">ราคาประมาณ</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(car.price)}
          </p>
        </div>

        <Button onClick={() => onSelect(car)} className="w-full mt-4">
          เลือกคันนี้
        </Button>
      </div>
    </div>
  );
};

export default CarResultCard;
