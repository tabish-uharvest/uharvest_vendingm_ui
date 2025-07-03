import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import FloatingAnimation from '@/components/floating-animation';

export default function ThankYouPage() {
  const [, setLocation] = useLocation();
  const { currentOrderId, resetApp } = useVendingStore();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!currentOrderId) {
      console.log('No order ID on thank-you page, redirecting to home');
      setLocation('/');
      return;
    }
    
    console.log('Thank-you page loaded for order:', currentOrderId);
    
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          console.log('Countdown complete, resetting app and going home');
          resetApp();
          setLocation('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentOrderId, resetApp, setLocation]);

  const handleOrderAgain = () => {
    resetApp();
    setLocation('/');
  };

  if (!currentOrderId) {
    return null;
  }

  const celebrationElements = ['🎉', '✨', '🥤', '🥗'];

  return (
    <div className="absolute inset-0 urban-green flex flex-col items-center justify-center p-6">
      <FloatingAnimation elements={celebrationElements} />
      
      <div className="text-center z-10">
        {/* Success Icon */}
        <div className="mb-8">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
        </div>
        
        <h2 className="text-urban-white text-4xl font-bold mb-6">
          Thanks! Your order is ready.
        </h2>
        
        <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-8">
          <p className="text-urban-white text-xl mb-2">
            Order: <span className="font-bold text-urban-yellow">{currentOrderId}</span>
          </p>
          <p className="text-urban-white text-lg opacity-80">
            Please collect your order from the pickup area
          </p>
        </div>
        
        {/* Order Again Button */}
        <Button
          onClick={handleOrderAgain}
          className="urban-yellow text-black text-2xl font-bold py-4 px-8 h-auto rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 mb-6 touch-btn-large"
        >
          <RotateCcw className="mr-3 w-6 h-6" />
          Order Again
        </Button>
        
        <p className="text-urban-white text-lg opacity-80">
          Returning to welcome screen in <span className="font-bold text-urban-yellow">{countdown}</span> seconds...
        </p>
      </div>
    </div>
  );
}
