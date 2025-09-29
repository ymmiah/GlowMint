import React, { useEffect } from 'react';

interface TutorialModalProps {
  onClose: () => void;
}

const TutorialCard: React.FC<{
  step: string;
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}> = ({ step, title, children, icon }) => (
  <section className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-6 items-start">
    <div className="flex-shrink-0 flex flex-row sm:flex-col items-center gap-4 w-full sm:w-24 text-center">
      <div className="bg-teal-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">{step}</div>
      <div className="text-teal-400">{icon}</div>
      <h3 className="text-lg font-bold text-white hidden sm:block">{title}</h3>
    </div>
    <div className="flex-grow">
        <h3 className="text-xl font-bold text-white mb-4 block sm:hidden">{title}</h3>
        {children}
    </div>
  </section>
);

const BeforeAfter: React.FC<{
  before: React.ReactNode;
  after: React.ReactNode;
  label: string;
}> = ({ before, after, label }) => (
  <div className="bg-slate-900/50 p-3 rounded-lg flex flex-col items-center h-full">
    <div className="flex gap-2 justify-center items-center">
      <div className="w-28 h-28 bg-slate-700 rounded-lg flex flex-col items-center justify-center p-2 text-center overflow-hidden">
        {before}
        <span className="text-xs font-bold text-slate-400 mt-2">Before</span>
      </div>
      <div className="flex items-center justify-center text-teal-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </div>
      <div className="w-28 h-28 bg-slate-700 rounded-lg flex flex-col items-center justify-center p-2 text-center overflow-hidden">
        {after}
        <span className="text-xs font-bold text-teal-300 mt-2">After</span>
      </div>
    </div>
    <h5 className="font-semibold text-white mt-3 text-sm">{label}</h5>
  </div>
);

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 flex flex-col justify-center items-center z-50 backdrop-blur-lg animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    How to use GlowMint
                </h2>
                <button
                    onClick={onClose}
                    className="text-slate-400 text-3xl hover:text-white transition-all duration-200 transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-slate-200 rounded-full w-10 h-10 flex items-center justify-center"
                    aria-label="Close tutorial"
                >
                    &times;
                </button>
            </header>
            <div className="flex-grow p-6 md:p-8 overflow-y-auto space-y-8">
                
                <TutorialCard step="1" title="Upload" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>}>
                    <p className="text-slate-300 mb-4">Start by uploading one or more images. You can either <strong className="text-teal-400">click the upload area</strong> to select files from your device, or simply <strong className="text-teal-400">drag and drop</strong> images directly onto it.</p>
                    <ul className="list-disc list-inside text-slate-400 space-y-2">
                        <li><strong className="text-white">Single Mode:</strong> Perfect for enhancements, style changes, or object removal on one photo.</li>
                        <li><strong className="text-white">Batch Mode:</strong> Upload multiple images to apply the same edit to all of them at once.</li>
                    </ul>
                </TutorialCard>
                
                <TutorialCard step="2" title="Instruct" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}>
                    <div className="space-y-6">
                        <div>
                             <h4 className="font-bold text-white text-lg mb-2">Choose your Mode</h4>
                             <p className="text-slate-300 mb-4">Use the toggle to switch between <strong className="text-teal-400">Single</strong> and <strong className="text-teal-400">Batch</strong> editing modes. Batch mode is automatically suggested when you upload multiple images.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg mb-2">Option A: Edit with a Prompt</h4>
                            <p className="text-slate-300 mb-4">Your creativity is the limit! Describe the edit you want in the text box. Be as descriptive as possible for the best results.</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-slate-900 p-3 rounded-lg border border-red-500/50">
                                    <p className="font-semibold text-red-400">Weak Prompt:</p>
                                    <p className="text-slate-400 italic">"make it vintage"</p>
                                </div>
                                <div className="bg-slate-900 p-3 rounded-lg border border-green-500/50">
                                    <p className="font-semibold text-green-400">Strong Prompt:</p>
                                    <p className="text-slate-400 italic">"Give this photo a vintage look, like an old film photograph from the 1970s. Adjust colors to be warm and faded, add subtle film grain."</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg mb-2">Option B: Use Quick Actions</h4>
                             <p className="text-slate-300 mb-4">For common tasks, use our library of pre-made edits. These work in both Single and Batch modes (interactive tools like Magic Erase are single-mode only).</p>
                        </div>
                    </div>
                </TutorialCard>

                <TutorialCard step="3" title="Generate & Review" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>}>
                     <p className="text-slate-300 mb-4">Once you're ready, hit the <strong className="text-teal-400">✨ Generate</strong> button. The AI will process your request and your edited masterpiece(s) will appear in the result panel.</p>
                     
                     <div className="bg-slate-900/30 p-4 rounded-lg mt-4">
                        <h5 className="font-semibold text-teal-300 mb-3">Reviewing Your Masterpiece</h5>
                        <div className="space-y-4">
                           <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <button className="p-2 bg-slate-700 rounded-full text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
                                    <button className="p-2 bg-slate-700 rounded-full text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
                                </div>
                                 <p className="text-slate-400 text-sm">In <strong className="text-white">Batch Mode</strong>, use the arrows to navigate through all your results.</p>
                           </div>
                           <div className="flex items-center gap-4">
                                <div className="bg-slate-700 p-1 rounded-full flex items-center text-xs font-semibold">
                                    <span className="px-3 py-1.5 rounded-full bg-slate-600 text-white">Toggle</span>
                                    <span className="px-3 py-1.5 text-slate-400">Slider</span>
                                    <span className="px-3 py-1.5 text-slate-400">Side-by-Side</span>
                                </div>
                                <p className="text-slate-400 text-sm">Use the <strong className="text-white">View Modes</strong> to compare your original and edited images in different ways.</p>
                           </div>
                           <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <button className="p-2 bg-slate-700 rounded-md text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 015 5v1" /></svg></button>
                                    <button className="p-2 bg-slate-700 rounded-md text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H8a5 5 0 00-5 5v1" /></svg></button>
                                </div>
                                <p className="text-slate-400 text-sm">In <strong className="text-white">Single Mode</strong>, undo and redo your edits to experiment freely.</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center gap-3">
                            <button className="py-2 px-3 bg-green-600 text-white font-bold rounded-lg flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg><span>Download</span></button>
                            <p className="text-slate-400 text-sm">Save your creation.</p>
                        </div>
                        <div className="flex items-center gap-3">
                             <button className="py-2 px-3 bg-teal-600 text-white font-bold rounded-lg flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg><span>Use as Input</span></button>
                             <p className="text-slate-400 text-sm">Use the result as a new starting point.</p>
                        </div>
                     </div>
                </TutorialCard>

                 <div className="text-center pt-4">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Pro Tips
                    </h3>
                </div>

                <section className="bg-slate-800/50 p-6 rounded-2xl">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                             <h4 className="font-bold text-white text-lg mb-2">Negative Prompts</h4>
                            <p className="text-slate-300 text-sm">Under "Advanced Options", use the Negative Prompt to specify what you <strong className="text-red-400">don't</strong> want in the final image. This is useful for removing watermarks, text, or avoiding strange artifacts like "extra fingers".</p>
                        </div>
                         <div>
                             <h4 className="font-bold text-white text-lg mb-2">Compare Views</h4>
                            <p className="text-slate-300 text-sm">After an edit, use the view mode selectors under the result panel. The <strong className="text-teal-400">Slider</strong> is great for a detailed before-and-after comparison.</p>
                        </div>
                         <div>
                             <h4 className="font-bold text-white text-lg mb-2">Output Resolution</h4>
                            <p className="text-slate-300 text-sm">Choose your desired output quality. <strong className="text-teal-400">High</strong> gives the best detail but takes longer, while <strong className="text-teal-400">Low</strong> is faster for quick previews.</p>
                        </div>
                        <div>
                             <h4 className="font-bold text-white text-lg mb-2">Iterative Editing</h4>
                            <p className="text-slate-300 text-sm">Don't stop at one edit! Use the <strong className="text-teal-400">"Use as Input"</strong> button to take your edited image and apply more changes to it. Layer effects to create something truly unique.</p>
                        </div>
                     </div>
                </section>

                <div className="text-center pt-4 pb-2">
                    <button onClick={onClose} className="py-3 px-8 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50">
                        Start Creating!
                    </button>
                </div>
                
            </div>
        </div>
    </div>
  );
};

export default TutorialModal;