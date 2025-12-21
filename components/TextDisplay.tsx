import React from 'react';

interface TextDisplayProps {
  text: string;
  title: string;
  onClear: () => void;
}

// Simple markdown-to-html. Not complete, but good enough for this use case.
const Markdown: React.FC<{ content: string }> = ({ content }) => {
    const formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>') // H3
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3 border-b border-[--color-border] pb-2">$1</h2>') // H2
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4 border-b border-[--color-border] pb-2">$1</h1>') // H1
        .replace(/^- (.*$)/gim, '<li class="ml-6">$1</li>') // List item
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>') // Wrap lists
        .replace(/\n/g, '<br />'); // Newlines

    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
};


const TextDisplay: React.FC<TextDisplayProps> = ({ text, title, onClear }) => {
  return (
    <div className="w-full h-full bg-[--color-surface-inset]/50 rounded-xl border-2 border-[--color-border] flex flex-col overflow-hidden relative group p-4 animate-fade-in">
        <div className="flex-shrink-0 flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[--color-primary]">{title}</h2>
            <button 
                onClick={onClear} 
                className="py-1 px-3 bg-[--color-surface-2] hover:bg-[--color-surface-3] text-[--color-text-secondary] font-bold rounded-lg text-sm flex items-center gap-2"
                title="Close analysis and view image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Close
            </button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 text-[--color-text-secondary] prose">
            <Markdown content={text} />
        </div>
    </div>
  );
};

export default TextDisplay;
