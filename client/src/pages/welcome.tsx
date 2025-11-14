import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Play, Leaf } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import FloatingAnimation from '@/components/floating-animation';
import uharvestLogo from '@/assets/uharvest.png';

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const resetApp = useVendingStore(state => state.resetApp);

  const handleStart = () => {
    resetApp();
    setLocation('/selection');
  };

  return (
    <div className="absolute inset-0 urban-green flex flex-col items-center justify-center p-8">
      <FloatingAnimation />
      
      {/* Logo */}
      <div className="flex flex-col items-center mb-16 z-10">
        <img
          src={uharvestLogo}
          alt="Urban Harvest Logo"
          className="w-[40rem] h-auto mb-10 drop-shadow-2xl select-none pointer-events-none ml-20"
          draggable={false}
        />
        {/* <div className="text-urban-yellow text-3xl font-medium text-center">
          Fresh • Healthy • Ready
        </div> */}
      </div>
      
      {/* Welcome Message */}
      <h1 className="text-urban-white text-8xl font-bold text-center mb-16 leading-tight z-10">
        Welcome to <span className="text-urban-yellow">Healthy Living</span>
      </h1>
      
      {/* Start Button */}
      <div className="relative z-10 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-urban-yellow via-yellow-400 to-urban-yellow rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-300 animate-pulse"></div>
        <Button 
          onClick={handleStart}
          className="relative urban-yellow text-black text-5xl font-bold py-10 px-32 h-auto rounded-3xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 touch-btn-large border-2 border-urban-green/20 hover:border-urban-green/50 group-hover:brightness-110"
        >
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-urban-yellow opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>
          <Play className="mr-8 w-14 h-14 group-hover:scale-110 transition-transform duration-300" />
          <span className="relative z-10">Start Now</span>
        </Button>
      </div>
      
      <p className="text-urban-white text-2xl mt-12 text-center opacity-80 z-10">
        Touch Start to begin your healthy journey
      </p>
    </div>
  );
}
