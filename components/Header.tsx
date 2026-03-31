import React from 'react';
import Settings from './Settings';

const Header: React.FC = () => {
  return (
    <header className="flex-shrink-0 bg-[--color-surface-1]/80 backdrop-blur-md border-b border-[--color-border]/30 z-20 pt-safe">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-gradient-to-br from-[--color-primary] to-[--color-secondary] rounded-xl flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[--color-text-primary]">
            GlowMint
          </span>
        </div>
        <div className="flex items-center">
          <Settings />
        </div>
      </div>
    </header>
  );
};

export default Header;