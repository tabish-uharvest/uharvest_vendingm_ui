import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Brush } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import { useOrderDetails, useUpdateOrderStatus } from '@/hooks/useMachineData';
import ProgressBar from '@/components/progress-bar';

export default function ProcessingPage() {
  const [, setLocation] = useLocation();
  const { currentOrderId, selectedItem } = useVendingStore();
  
  // Poll order status
  const { data: orderData, isLoading } = useOrderDetails(currentOrderId || '');
  const updateOrderStatusMutation = useUpdateOrderStatus();

  useEffect(() => {
    // If there's no order ID or selected item, redirect back to the home page
    if (!currentOrderId || !selectedItem) {
      setLocation('/');
      return;
    }
    
    // Check order status and handle transitions
    if (orderData) {
      const order = orderData as any;
      console.log('Order status:', order.status);
      
      if (order.status === 'completed') {
        // Order is complete, go to thank you page
        setLocation('/thank-you');
      } else if (order.status === 'failed' || order.status === 'cancelled') {
        // Order failed or was cancelled, go back to items
        setLocation('/items');
      }
    }
  }, [currentOrderId, selectedItem, orderData, setLocation]);

  const handleProcessingComplete = () => {
    console.log('Processing simulation complete, marking order as completed');
    
    if (currentOrderId) {
      // Update order status to completed
      updateOrderStatusMutation.mutate(
        { orderId: currentOrderId, status: 'completed' },
        {
          onSuccess: () => {
            setTimeout(() => {
              setLocation('/thank-you');
            }, 100);
          },
          onError: (error) => {
            console.error('Failed to mark order as completed:', error);
            // Still navigate to thank you page
            setTimeout(() => {
              setLocation('/thank-you');
            }, 100);
          }
        }
      );
    } else {
      // Fallback if no order ID
      setTimeout(() => {
        setLocation('/thank-you');
      }, 100);
    }
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
