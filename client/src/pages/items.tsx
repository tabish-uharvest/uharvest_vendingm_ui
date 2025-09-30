import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize, Minimize } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import FloatingAnimation from '@/components/floating-animation';
import { CreateTabContent } from '@/components/tabs/CreateTabContent';
import { Tabs } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';

export default function ItemsPage() {
  const [, setLocation] = useLocation();
  const { currentCategory } = useVendingStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Update fullscreen state when user uses Esc key or other methods to exit fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!currentCategory) {
    setLocation('/selection');
    return null;
  }

  return (
    <div className="absolute inset-0 urban-green">
      <FloatingAnimation />
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-4 sticky top-0 z-20 bg-urban-green flex items-center justify-between">
          <Button
            onClick={() => setLocation('/selection')}
            className="bg-white bg-opacity-20 text-white px-4 py-3 rounded-xl hover:bg-opacity-30 transition-all touch-btn flex items-center gap-2"
            variant="ghost"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">
              Back to Selection
            </span>
          </Button>

          <Button
            onClick={toggleFullscreen}
            className="bg-white bg-opacity-20 text-white w-12 h-12 rounded-xl hover:bg-opacity-30 transition-all touch-btn flex items-center justify-center"
            variant="ghost"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center px-4">
          <div className="w-full max-w-4xl h-full">
            <Tabs defaultValue="create" className="w-full">
              <div className="h-[calc(100vh-160px)] overflow-y-auto pb-24 scrollbar-hide">
                <CreateTabContent category={currentCategory} />
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
