import React from 'react';
import { ConversationStatus } from '../types';

interface StatusIndicatorProps {
  status: ConversationStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case ConversationStatus.READY:
        return 'bg-green-500';
      case ConversationStatus.AI_REPLYING:
      case ConversationStatus.INITIALIZING:
        return 'bg-sky-500 animate-pulse';
      case ConversationStatus.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`w-3 h-3 rounded-full ${getStatusColor()} transition-colors`}></span>
      <span className="text-sm text-slate-400 font-medium">{status}</span>
    </div>
  );
};