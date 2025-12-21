import React from 'react';

type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onRatioChange: (ratio: AspectRatio) => void;
  isDisabled: boolean;
}

// FIX: Changed JSX.Element to React.ReactElement to fix "Cannot find namespace 'JSX'" error.
const ratios: { id: AspectRatio; label: string; icon: React.ReactElement }[] = [
  { id: '1:1', label: 'Square', icon: <svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="4" y="4" width="16" height="16" rx="2" /></svg> },
  { id: '4:3', label: 'Landscape', icon: <svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="2" y="6" width="20" height="12" rx="2" /></svg> },
  { id: '3:4', label: 'Portrait', icon: <svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="6" y="2" width="12" height="20" rx="2" /></svg> },
  { id: '16:9', label: 'Widescreen', icon: <svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="1" y="7" width="22" height="10" rx="2" /></svg> },
  { id: '9:16', label: 'Story', icon: <svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="7" y="1" width="10" height="22" rx="2" /></svg> },
];

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onRatioChange, isDisabled }) => {
  return (
    <div className="mt-4">
      <label className="block text-sm font-semibold text-[--color-text-secondary] mb-2">Aspect Ratio</label>
      <div className="grid grid-cols-5 gap-3">
        {ratios.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onRatioChange(id)}
            disabled={isDisabled}
            className={`p-3 text-center rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary-focus] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 flex flex-col items-center justify-center gap-1
              ${selectedRatio === id
                ? 'bg-[--color-primary] border-[--color-primary-hover] text-[--color-primary-text] shadow-lg hover:bg-[--color-primary-hover]'
                : 'bg-[--color-surface-2] border-[--color-border] hover:bg-[--color-surface-3] hover:border-[--color-surface-3] text-[--color-text-secondary]'
              }
            `}
            aria-pressed={selectedRatio === id}
            title={`${label} (${id})`}
          >
            <span className="fill-current">{icon}</span>
            <span className="font-bold text-xs">{id}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AspectRatioSelector;