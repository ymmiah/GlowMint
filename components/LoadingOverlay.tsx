import React, { useState, useEffect } from 'react';

const messages = [
  "Reticulating splines...",
  "Warming up the AI's creativity circuits...",
  "Consulting with digital muses...",
  "Teaching pixels new tricks...",
  "This is taking a little longer than usual...",
  "The AI is working its magic...",
  "Hang tight, awesome is on its way!",
];

const LoadingOverlay: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[--color-bg]/80 flex flex-col justify-center items-center z-50 backdrop-blur-lg">
      <svg className="animate-spin h-12 w-12 text-[--color-primary]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-xl font-semibold text-[--color-text-primary]">GlowMint is thinking...</p>
      <p className="text-[--color-text-secondary] mt-1 transition-opacity duration-500 text-center px-4">{message}</p>
    </div>
  );
};

export default LoadingOverlay;