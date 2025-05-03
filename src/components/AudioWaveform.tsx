
import React from 'react';

interface AudioWaveformProps {
  isActive: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ isActive }) => {
  const barsCount = 14;
  
  return (
    <div className="flex items-center justify-center gap-1 h-16 my-4">
      {Array.from({ length: barsCount }).map((_, i) => (
        <div
          key={i}
          className={`w-1 md:w-2 h-8 bg-primary rounded-full transform origin-bottom 
                    ${isActive ? "animate-wave" : "scale-y-[0.3]"}`}
          style={{
            animationDelay: `${i * (1 / barsCount)}s`,
            opacity: isActive ? 1 : 0.3,
            height: `${Math.max(16, Math.min(64, Math.random() * 64))}px`
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
