
import React from 'react';

interface TopicInputProps {
  topic: string;
  onChange: (topic: string) => void;
  disabled: boolean;
}

export const TopicInput: React.FC<TopicInputProps> = ({ topic, onChange, disabled }) => {
  return (
    <div>
      <label htmlFor="topic" className="block text-sm font-medium text-slate-400 mb-1">
        Conversation Topic
      </label>
      <input
        type="text"
        id="topic"
        value={topic}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="e.g., asking for directions"
        className="w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};
