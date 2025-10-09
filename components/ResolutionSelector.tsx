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
      <h3 className="font-semibold text-[--color-text-secondary] mb-3">Output Resolution</h3>
      <div className="grid grid-cols-3 gap-3">
        {resolutions.map(({ id, label, description }) => (
          <button
            key={id}
            onClick={() => onResolutionChange(id)}
            disabled={isDisabled}
            className={`p-3 text-center rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary-focus] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5
              ${selectedResolution === id
                ? 'bg-[--color-primary] border-[--color-primary-hover] text-[--color-primary-text] shadow-lg hover:bg-[--color-primary-hover]'
                : 'bg-[--color-surface-2] border-[--color-border] hover:bg-[--color-surface-3] hover:border-[--color-surface-3] text-[--color-text-secondary]'
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