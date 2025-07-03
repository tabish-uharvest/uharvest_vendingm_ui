import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import { api } from '@/lib/api';
import { useEffect } from 'react';

export default function PaymentPage() {
  const [, setLocation] = useLocation();
  const { cart, setOrderId, setSelectedItem } = useVendingStore();
  
  // Ensure we have an item to use in the processing page
  useEffect(() => {
    if (cart.length > 0 && cart[0].item) {
      // Set the selected item from cart to ensure processing page has it
      setSelectedItem(cart[0].item);
    }
  }, [cart, setSelectedItem]);

  const createOrderMutation = useMutation({
    mutationFn: api.createOrder,
    onSuccess: (order) => {
      setOrderId(order.id);
      setLocation('/processing');
    }
  });

  const handleConfirmPayment = () => {
    if (cart.length === 0) return;

    const cartItem = cart[0];
    const orderData = {
      itemId: cartItem.item.id,
      itemName: cartItem.item.name,
      itemPrice: cartItem.item.price,
      addons: JSON.stringify(cartItem.addons),
      totalPrice: cartItem.total.toString(),
      status: 'processing'
    };

    createOrderMutation.mutate(orderData);
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
          onClick={() => setLocation('/customization')}
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
    </div>
  );
}
