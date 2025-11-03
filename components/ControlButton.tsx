
import React from 'react';

interface ControlButtonProps {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  className?: string;
}

export const ControlButton: React.FC<ControlButtonProps> = ({ onClick, label, icon, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center space-x-2 px-6 py-3 font-semibold text-white rounded-full shadow-md transition-transform duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
