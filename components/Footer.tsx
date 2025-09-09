import React from 'react';

interface FooterProps {
  onOpenTutorial: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenTutorial }) => {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <footer className="w-full bg-slate-900/50 border-t border-slate-700/50 text-center p-4 mt-8 flex-shrink-0">
      <div className="container mx-auto text-sm text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© {today.getFullYear()} GlowMint. All Rights Reserved.</span>
        <div className="flex items-center gap-4">
            <button
                onClick={onOpenTutorial}
                className="hover:text-teal-400 transition-colors duration-200 underline"
            >
                How to Use GlowMint
            </button>
            <span className="hidden sm:inline">|</span>
            <span>Last Updated: {dateString}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
