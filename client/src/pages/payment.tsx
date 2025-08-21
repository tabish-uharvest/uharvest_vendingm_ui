import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, X } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import { useCreateOrder, useUpdateOrderStatus } from '@/hooks/useMachineData';
import { useEffect, useState } from 'react';

export default function PaymentPage() {
  const [, setLocation] = useLocation();
  const { cart, setOrderId, setSelectedItem, createOrderData } = useVendingStore();
  const [showTestingPopup, setShowTestingPopup] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  
  // Ensure we have an item to use in the processing page
  useEffect(() => {
    if (cart.length > 0 && cart[0].item) {
      // Set the selected item from cart to ensure processing page has it
      setSelectedItem(cart[0].item);
    }
  }, [cart, setSelectedItem]);

  const createOrderMutation = useCreateOrder();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const handleConfirmPayment = () => {
    if (cart.length === 0) return;
    
    // Create order with "pending" status first
    const orderData = createOrderData();
    if (!orderData) return;

    createOrderMutation.mutate(orderData, {
      onSuccess: (order) => {
        setCurrentOrder(order);
        setOrderId(order.id);
        // Show testing popup for payment simulation
        setShowTestingPopup(true);
      },
      onError: (error) => {
        console.error('Failed to create order:', error);
        // Handle error - maybe show error message
      }
    });
  };

  const handleTestingResult = (success: boolean) => {
    setShowTestingPopup(false);

    if (!currentOrder) return;

    const newStatus = success ? 'processing' : 'failed';

    // Update order status based on payment result
    updateOrderStatusMutation.mutate(
      { orderId: currentOrder.id, status: newStatus },
      {
        onSuccess: () => {
          if (success) {
            setLocation('/processing');
          } else {
            setLocation('/payment'); // Stay on payment page for retry
          }
        },
        onError: (error) => {
          console.error('Failed to update order status:', error);
        }
      }
    );
  };

  const handleCancelPayment = () => {
    if (currentOrder) {
      // Update order status to cancelled
      updateOrderStatusMutation.mutate(
        { orderId: currentOrder.id, status: 'cancelled' },
        {
          onSuccess: () => {
            setLocation('/items');
          },
          onError: (error) => {
            console.error('Failed to cancel order:', error);
            setLocation('/items'); // Go back anyway
          }
        }
      );
    } else {
      setLocation('/items');
    }
  };

  if (cart.length === 0) {
    setLocation('/customization');
    return null;
  }

  const cartItem = cart[0];

  return (
    <div className="absolute inset-0 urban-green overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 urban-green p-6 shadow-lg z-10">
        <Button
          onClick={handleCancelPayment}
          className="absolute left-6 top-6 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all touch-btn"
          variant="ghost"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-urban-white text-3xl font-bold text-center">Review & Pay</h2>
      </div>
      
      {/* Order Summary */}
      <div className="p-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="text-urban-green text-2xl font-bold mb-4">Your Order</h3>
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h4 className="text-urban-green text-xl font-bold mb-2">{cartItem.item.name}</h4>
            <p className="text-gray-600 mb-2">${cartItem.item.price}</p>
          </div>
          
          {cartItem.addons.length > 0 && (
            <div className="mb-4">
              <h5 className="text-urban-green font-bold mb-2">Add-ons:</h5>
              {cartItem.addons.map((addon) => (
                <div key={addon.id} className="flex justify-between text-gray-600 mb-1">
                  <span>{addon.name} (x{addon.quantity})</span>
                  <span>${(addon.price * addon.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Total */}
        <div className="urban-yellow rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="text-black text-2xl font-bold">Total:</span>
            <span className="text-black text-3xl font-bold">${cartItem.total.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Payment Button */}
        <Button
          onClick={handleConfirmPayment}
          disabled={createOrderMutation.isPending}
          className="w-full bg-green-600 text-white text-2xl font-bold py-6 h-auto rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 touch-btn-large"
        >
          <CreditCard className="mr-3 w-6 h-6" />
          {createOrderMutation.isPending ? 'Processing...' : 'Confirm & Pay'}
        </Button>
        
        <p className="text-urban-white text-center mt-4 opacity-80">
          Secure payment powered by Razorpay
        </p>
      </div>

      {/* Testing Mode Popup */}
      {showTestingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 relative">
            {/* Close Button */}
            <Button
              onClick={() => setShowTestingPopup(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              variant="ghost"
            >
              <X className="w-5 h-5 text-gray-600" />
            </Button>

            {/* Popup Content */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Testing Mode</h3>
              <p className="text-gray-600 mb-8">Simulate payment result for testing</p>
              
              <div className="space-y-4">
                {/* Success Button */}
                <Button
                  onClick={() => handleTestingResult(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 h-auto rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  ✅ Mark Success
                </Button>
                
                {/* Failure Button */}
                <Button
                  onClick={() => handleTestingResult(false)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-4 h-auto rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  ❌ Mark Failure
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
