import { useEffect, useState, useCallback } from 'react';

interface ProgressBarProps {
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

export default function ProgressBar({ 
  duration = 4000, 
  onComplete,
  className = ""
}: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(handleComplete, 0); // Delay callback to avoid state update during render
          return 100;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, handleComplete]);

  return (
    <div className={`w-full bg-white bg-opacity-20 rounded-full h-4 ${className}`}>
      <div 
        className="bg-yellow-400 h-4 rounded-full transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
