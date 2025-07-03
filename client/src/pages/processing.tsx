import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Brush } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import ProgressBar from '@/components/progress-bar';

export default function ProcessingPage() {
  const [, setLocation] = useLocation();
  const { currentOrderId, selectedItem } = useVendingStore();

  useEffect(() => {
    // If there's no order ID or selected item, redirect back to the home page
    if (!currentOrderId || !selectedItem) {
      setLocation('/');
      return;
    }
    
    // If we have the required data, make sure the UI is updated
    console.log('Processing order:', currentOrderId, 'for item:', selectedItem.name);
  }, [currentOrderId, selectedItem, setLocation]);

  const handleProcessingComplete = () => {
    console.log('Processing complete, navigating to thank-you page');
    // Use a small timeout to ensure state is settled before navigation
    setTimeout(() => {
      setLocation('/thank-you');
    }, 100);
  };

  if (!currentOrderId || !selectedItem) {
    return null;
  }

  const itemType = selectedItem.category === 'smoothies' ? 'Smoothie' : 'Salad';

  return (
    <div className="absolute inset-0 urban-green flex flex-col items-center justify-center p-6">
      <div className="text-center">
        {/* Processing Animation */}
        <div className="mb-8">
          <Brush className="w-20 h-20 text-urban-yellow animate-pulse mx-auto" />
        </div>
        
        <h2 className="text-urban-white text-4xl font-bold mb-8">
          Making your {selectedItem.name}...
        </h2>
        
        {/* Progress Bar */}
        <ProgressBar
          duration={4000}
          onComplete={handleProcessingComplete}
          className="w-full max-w-md mb-8"
          key={currentOrderId} // Add key to ensure it re-renders
        />
        
        {/* Order ID */}
        <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-8">
          <p className="text-urban-white text-lg">
            Order ID: <span className="font-bold text-urban-yellow">{currentOrderId}</span>
          </p>
        </div>
        
        <p className="text-urban-white text-xl opacity-80">
          Please wait while we prepare your order...
        </p>
      </div>
    </div>
  );
}
