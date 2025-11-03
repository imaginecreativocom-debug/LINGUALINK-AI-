
import React from 'react';

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Italian', 'Japanese', 'Mandarin Chinese'];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onChange: (language: string) => void;
  disabled: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onChange, disabled }) => {
  return (
    <div>
      <label htmlFor="language" className="block text-sm font-medium text-slate-400 mb-1">
        Language to Practice
      </label>
      <select
        id="language"
        value={selectedLanguage}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
};