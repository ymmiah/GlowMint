import React from 'react';

type Resolution = 'Low' | 'Medium' | 'High';

interface ResolutionSelectorProps {
  selectedResolution: Resolution;
  onResolutionChange: (resolution: Resolution) => void;
  isDisabled: boolean;
}

const resolutions: { id: Resolution; label: string; description: string }[] = [
  { id: 'Low', label: 'Low', description: 'Faster, smaller file size' },
  { id: 'Medium', label: 'Medium', description: 'Good balance of quality and size' },
  { id: 'High', label: 'High', description: 'Best quality, larger file size' },
];

const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({ selectedResolution, onResolutionChange, isDisabled }) => {
  return (
    <div className="mt-4 mb-2">
      <h3 className="font-semibold text-slate-300 mb-3">Output Resolution</h3>
      <div className="grid grid-cols-3 gap-3">
        {resolutions.map(({ id, label, description }) => (
          <button
            key={id}
            onClick={() => onResolutionChange(id)}
            disabled={isDisabled}
            className={`p-3 text-center rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5
              ${selectedResolution === id
                ? 'bg-teal-600 border-teal-500 text-white shadow-lg hover:bg-teal-500'
                : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500 text-slate-300'
              }
            `}
            aria-pressed={selectedResolution === id}
            title={description}
          >
            <span className="font-bold text-sm">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ResolutionSelector;