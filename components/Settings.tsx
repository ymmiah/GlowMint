import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { themes as themeDefinitions, type Theme } from '../theme/theme';

const themeOptions = (Object.keys(themeDefinitions) as Theme[]).map(name => ({
    name,
    colors: [
        themeDefinitions[name]['--color-surface-2'],
        themeDefinitions[name]['--color-primary']
    ]
}));


const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-[--color-text-secondary] hover:bg-[--color-surface-2] hover:text-[--color-text-primary] transition-colors"
        aria-label="Open theme settings"
        title="Change Theme"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[--color-surface-1] border border-[--color-border] rounded-lg shadow-2xl p-2 z-30 animate-fade-in">
          <p className="text-sm font-semibold text-[--color-text-secondary] px-2 py-1 mb-1">Select Theme</p>
          <div className="space-y-1">
            {themeOptions.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setTheme(t.name);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between text-left p-2 rounded-md transition-colors ${
                  theme === t.name ? 'bg-[--color-primary-hover]/30' : 'hover:bg-[--color-surface-2]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex -space-x-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[--color-surface-1]" style={{ backgroundColor: t.colors[0] }} />
                    <span className="w-4 h-4 rounded-full border-2 border-[--color-surface-1]" style={{ backgroundColor: t.colors[1] }} />
                  </span>
                  <span className="capitalize text-[--color-text-primary] text-sm font-medium">{t.name}</span>
                </span>
                {theme === t.name && (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[--color-primary]" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                   </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;