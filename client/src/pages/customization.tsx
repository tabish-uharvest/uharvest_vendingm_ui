import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function CustomizationPage() {
  const [, setLocation] = useLocation();
  const { selectedItem, addons, updateAddon, addToCart, calculateTotal } = useVendingStore();

  const { data: availableAddons } = useQuery({
    queryKey: ['/api/addons'],
    queryFn: api.getAddons
  });

  const handleAddonUpdate = (addonId: string, name: string, price: string, change: number) => {
    updateAddon(addonId, name, parseFloat(price), change);
  };

  const handleAddToCart = () => {
    addToCart();
    setLocation('/payment');
  };

  const getAddonQuantity = (addonId: string) => {
    return addons.find(a => a.id === addonId)?.quantity || 0;
  };

  if (!selectedItem) {
    setLocation('/items');
    return null;
  }

  const total = calculateTotal();

  return (
    <div className="absolute inset-0 urban-green overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 urban-green p-8 shadow-lg z-10">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setLocation('/items')}
            className="bg-white bg-opacity-20 text-white px-6 py-4 rounded-xl hover:bg-opacity-30 transition-all touch-btn flex items-center gap-3"
            variant="ghost"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-lg font-medium">Back to Items</span>
          </Button>
        </div>
        <h2 className="text-urban-white text-4xl font-bold text-center">Customize Your Order</h2>
      </div>
      
      {/* Selected Item */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <img 
            src={selectedItem.image} 
            alt={selectedItem.name} 
            className="w-full h-48 object-cover rounded-2xl mb-6"
          />
          <h3 className="text-urban-green text-3xl font-bold mb-3">{selectedItem.name}</h3>
          <div className="flex justify-between items-center">
            <span className="text-urban-green font-bold text-2xl">${selectedItem.price}</span>
            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-lg font-medium">
              {selectedItem.calories} cal
            </span>
          </div>
        </div>
      </div>
      
      {/* Add-ons */}
      <div className="px-8 py-4">
        <h3 className="text-urban-white text-3xl font-bold mb-6">Add Premium Ingredients</h3>
        <div className="space-y-4">
          {availableAddons?.map((addon) => (
            <div key={addon.id} className="bg-white rounded-2xl p-6 shadow-xl flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-4xl mr-6">{addon.icon}</span>
                <div>
                  <h4 className="text-urban-green text-xl font-bold">{addon.name}</h4>
                  <p className="text-gray-600 text-lg">+${addon.price}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => handleAddonUpdate(addon.id, addon.name, addon.price, -1)}
                  className="bg-gray-200 text-gray-700 w-14 h-14 rounded-full font-bold text-2xl hover:bg-gray-300 transition-all touch-btn"
                  disabled={getAddonQuantity(addon.id) === 0}
                  variant="ghost"
                >
                  <Minus className="w-6 h-6" />
                </Button>
                <span className="font-bold text-2xl w-10 text-center text-urban-green">
                  {getAddonQuantity(addon.id)}
                </span>
                <Button
                  onClick={() => handleAddonUpdate(addon.id, addon.name, addon.price, 1)}
                  className="urban-yellow text-black w-14 h-14 rounded-full font-bold text-2xl hover:bg-yellow-500 transition-all touch-btn"
                  variant="ghost"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="w-full urban-yellow text-black text-3xl font-bold py-8 h-auto rounded-2xl mt-10 shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 touch-btn-large"
        >
          <ShoppingCart className="mr-4 w-8 h-8" />
          Add to Cart - ${total.toFixed(2)}
        </Button>
      </div>
    </div>
  );
}
