
import React from 'react';
import Card from './Card';
import Button from './Button';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  details: {
    carPrice: string;
    downPaymentAmount: string;
    financedAmount: string;
    interestRate: string;
    loanTerm: string;
  };
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onConfirm, onCancel, details }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
      onClick={onCancel}
    >
      <div className="relative w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
        <Card className="transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">ยืนยันข้อมูลการคำนวณ</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนดำเนินการต่อ</p>
          
          <div className="space-y-3 text-lg border-y border-gray-200 dark:border-gray-700 py-4 mb-6">
            <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-400">ราคารถยนต์:</span> <span className="font-semibold">{details.carPrice} บาท</span></div>
            <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-400">เงินดาวน์:</span> <span className="font-semibold">{details.downPaymentAmount} บาท</span></div>
            <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-400">ยอดจัดไฟแนนซ์:</span> <span className="font-semibold">{details.financedAmount} บาท</span></div>
            <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-400">ดอกเบี้ย:</span> <span className="font-semibold">{details.interestRate}% ต่อปี</span></div>
            <div className="flex justify-between"><span className="font-medium text-gray-600 dark:text-gray-400">ระยะเวลา:</span> <span className="font-semibold">{details.loanTerm} ปี</span></div>
          </div>

          <div className="flex justify-end gap-4">
            <Button onClick={onCancel} className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 flex items-center gap-2">
              <XCircleIcon className="w-5 h-5" />
              ยกเลิก
            </Button>
            <Button onClick={onConfirm} className="flex items-center gap-2">
               <CheckCircleIcon className="w-5 h-5" />
              ยืนยัน
            </Button>
          </div>
        </Card>
      </div>
       <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationDialog;
