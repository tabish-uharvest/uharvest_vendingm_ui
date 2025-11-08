import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import { useAvailableAddons, usePresetDetails, useMachineInventory } from '@/hooks/useMachineData';
import { useEffect } from 'react';

export default function CustomizationPage() {
  const [, setLocation] = useLocation();
  const { selectedItem, addons, updateAddon, addToCart, calculateTotal, calculateCalories, machineId, setInventoryData, setSelectedItem } = useVendingStore();
  
  // Check if this is a preset recipe and get the preset ID
  const isPresetRecipe = selectedItem ? (selectedItem as any).isPresetRecipe : false;
  const presetId = selectedItem ? (selectedItem as any).presetId : null;
  
  // Get full inventory data for calorie calculations
  const { data: inventoryData } = useMachineInventory(machineId);
  
  // Use machine API for addons
  const { addons: availableAddons, isLoading, error } = useAvailableAddons(machineId);
  
  // Fetch preset details if this is a preset recipe
  const { data: presetDetails, isLoading: isLoadingPreset } = usePresetDetails(presetId);

  // Set inventory data in store when it loads
  useEffect(() => {
    if (inventoryData) {
      setInventoryData(inventoryData);
    }
  }, [inventoryData, setInventoryData]);

  // Store preset ingredients data when preset details are loaded
  useEffect(() => {
    if (isPresetRecipe && presetDetails && (presetDetails as any).ingredients) {
      // Update the selectedItem to include the raw preset ingredients data
      const updatedItem = {
        ...selectedItem,
        isPresetRecipe: true,
        presetIngredients: (presetDetails as any).ingredients, // Store raw API data
        customIngredients: (presetDetails as any).ingredients.map((ingredient: any) => ({
          id: ingredient.ingredient_id,
          name: ingredient.ingredient_name,
          emoji: ingredient.ingredient_emoji,
          percentage: ingredient.percent
        }))
      };
      setSelectedItem(updatedItem as any);
    }
  }, [presetDetails, isPresetRecipe, setSelectedItem]);

  const handleAddonUpdate = (addonId: string, name: string, price: number, change: number) => {
    updateAddon(addonId, name, price, change);
  };

  const handleAddToCart = () => {
    addToCart();
    setLocation('/payment');
  };

  const getAddonQuantity = (addonId: string) => {
    return addons.find(a => a.id === addonId)?.quantity || 0;
  };

  // Calculate total quantity of all addons
  const getTotalAddonQuantity = () => {
    return addons.reduce((total, addon) => total + addon.quantity, 0);
  };

  // Check if adding more addons is allowed (max 6 total)
  const canAddMoreAddons = (currentAddonId?: string) => {
    const totalQty = getTotalAddonQuantity();
    const currentQty = currentAddonId ? getAddonQuantity(currentAddonId) : 0;
    
    // If this is for a specific addon, check if we can add one more of that addon
    if (currentAddonId) {
      return totalQty < 6;
    }
    
    // For general check
    return totalQty < 6;
  };

  if (!selectedItem) {
    setLocation('/items');
    return null;
  }

  const total = calculateTotal();
  const totalCalories = calculateCalories();
  
  // Check if this is a custom recipe from CreateTabContent
  const isCustomRecipe = (selectedItem as any).isCustomRecipe || selectedItem.id?.startsWith('custom-');
  const showIngredientsLayout = isCustomRecipe || isPresetRecipe;
  
  // Get ingredients - either from custom recipe or fetched preset details
  const customIngredients = isPresetRecipe && presetDetails && (presetDetails as any).ingredients
    ? (presetDetails as any).ingredients.map((ingredient: any) => ({
        id: ingredient.ingredient_id,
        name: ingredient.ingredient_name,
        emoji: ingredient.ingredient_emoji,
        percentage: ingredient.percent
      }))
    : (selectedItem as any).customIngredients || [];

  // Get the correct image for the item
  const getItemImage = () => {
    if (isPresetRecipe) {
      // Use local images for preset recipes
      return selectedItem.category === 'smoothies' ? '/src/assets/glass.png' : '/src/assets/bowl.png';
    }
    // Use the original image for custom recipes or other items
    return selectedItem.image;
  };

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
      
      {/* Loading state for preset details */}
      {isPresetRecipe && isLoadingPreset ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-white text-2xl">Loading recipe details...</div>
        </div>
      ) : (
        <>
          {showIngredientsLayout ? (
        // Custom/Preset Recipe Layout (CreateTabContent/Originals style but read-only)
        <div className="px-8 py-6">
          <div className="bg-white bg-opacity-5 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
            {/* Recipe Display with CreateTabContent Layout */}
            <div className="grid md:grid-cols-2 gap-6 w-full min-h-[400px] overflow-hidden mb-8">
              {/* Left side - Ingredients List (Read-only) */}
              <div className="bg-white bg-opacity-10 rounded-2xl p-5 flex flex-col">
                <h4 className="text-white text-2xl font-bold mb-4">
                  {isPresetRecipe ? 'Recipe Ingredients' : 'Ingredients'}
                </h4>
                
                <div className="space-y-3 flex-grow">
                  {customIngredients.map((ingredient: any, index: number) => (
                    <div 
                      key={ingredient.id || index}
                      className="bg-white bg-opacity-20 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{ingredient.emoji}</span>
                        <div>
                          <p className="text-white text-xl font-semibold">{ingredient.name}</p>
                          <p className="text-urban-yellow">{ingredient.percentage}%</p>
                        </div>
                      </div>
                      {/* No buttons - read-only */}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right side - Container Visualization */}
              <div className="bg-white bg-opacity-10 rounded-2xl p-5 flex flex-col items-center justify-center relative">
                <div className={`relative w-full mt-4 ${selectedItem.category === 'smoothies' ? 'max-w-[300px]' : 'max-w-[350px]'}`}>
                  {selectedItem.category === 'smoothies' ? (
                    <div className="w-full flex items-end justify-center relative">
                      <div className="relative w-full max-w-[300px] h-[300px]">
                        <img 
                          src={getItemImage()} 
                          alt={selectedItem.name} 
                          className="w-full h-full object-contain absolute top-0 left-0 z-10"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex items-end justify-center relative">
                      <div className="relative w-full max-w-[350px] h-[350px]">
                        <img 
                          src={getItemImage()} 
                          alt={selectedItem.name} 
                          className="w-full h-full object-contain absolute top-0 left-0 z-10"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <h3 className="text-white text-2xl font-bold">{selectedItem.name}</h3>
                  <p className="text-urban-yellow text-xl font-semibold">${selectedItem.price}</p>
                </div>
              </div>
            </div>
            
            {/* Add-ons Section for Custom/Preset Recipe */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-urban-white text-3xl font-bold">Add Premium Items</h3>
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span className="text-white font-semibold">
                    Addons: {getTotalAddonQuantity()}/6
                  </span>
                </div>
              </div>
              {isLoading ? (
                <div className="text-white text-center py-8">Loading add-ons...</div>
              ) : error ? (
                <div className="text-red-400 text-center py-8">
                  Error loading add-ons: {(error as Error).message}
                </div>
              ) : availableAddons && availableAddons.length === 0 ? (
                <div className="text-white text-center py-8">No add-ons available</div>
              ) : (
                <div className="space-y-4">
                  {availableAddons?.map((addon) => {
                    const price = parseFloat(addon.price_per_unit);
                    const currentQty = getAddonQuantity(addon.id);
                    const totalQty = getTotalAddonQuantity();
                    const canAdd = canAddMoreAddons(addon.id) && addon.is_available && addon.qty_available > currentQty;
                    const canRemove = currentQty > 0;
                    
                    return (
                      <div key={addon.id} className="bg-white rounded-2xl p-6 shadow-xl flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-4xl mr-6">{addon.emoji || addon.icon || '🥄'}</span>
                          <div>
                            <h4 className="text-urban-green text-xl font-bold">{addon.name}</h4>
                            <p className="text-gray-600 text-lg">+${price.toFixed(2)}</p>
                            {totalQty >= 6 && (
                              <p className="text-red-500 text-sm font-medium">Max addons limit reached (6)</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Button
                            onClick={() => handleAddonUpdate(addon.id, addon.name, price, -1)}
                            className="bg-gray-200 text-gray-700 w-14 h-14 rounded-full font-bold text-2xl hover:bg-gray-300 transition-all touch-btn"
                            disabled={!canRemove}
                            variant="ghost"
                          >
                            <Minus className="w-6 h-6" />
                          </Button>
                          <span className="font-bold text-2xl w-10 text-center text-urban-green">
                            {currentQty}
                          </span>
                          <Button
                            onClick={() => handleAddonUpdate(addon.id, addon.name, price, 1)}
                            className={`w-14 h-14 rounded-full font-bold text-2xl transition-all touch-btn ${
                              canAdd 
                                ? 'urban-yellow text-black hover:bg-yellow-500' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!canAdd}
                            variant="ghost"
                          >
                            <Plus className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Order Summary */}
              <div className="bg-white bg-opacity-10 rounded-2xl p-6 mt-6 backdrop-blur-sm">
                <div className="flex justify-between items-center text-white">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">${total.toFixed(2)}</div>
                    <div className="text-sm opacity-80">Total Price</div>
                  </div>
                  <div className="w-px h-12 bg-white/20 mx-4"></div>
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">{Math.round(totalCalories)}</div>
                    <div className="text-sm opacity-80">Calories</div>
                  </div>
                </div>
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
        </div>
      ) : (
        // Original Layout for Preset Items
        <>
          {/* Selected Item */}
          <div className="px-8 py-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <img 
                src={getItemImage()} 
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-urban-white text-3xl font-bold">Add Premium Ingredients</h3>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span className="text-white font-semibold">
                  Addons: {getTotalAddonQuantity()}/6
                </span>
              </div>
            </div>
            {isLoading ? (
              <div className="text-white text-center py-8">Loading add-ons...</div>
            ) : error ? (
              <div className="text-red-400 text-center py-8">
                Error loading add-ons: {(error as Error).message}
              </div>
            ) : availableAddons && availableAddons.length === 0 ? (
              <div className="text-white text-center py-8">No add-ons available</div>
            ) : (
              <div className="space-y-4">
                {availableAddons?.map((addon) => {
                  const price = parseFloat(addon.price_per_unit);
                  const currentQty = getAddonQuantity(addon.id);
                  const totalQty = getTotalAddonQuantity();
                  const canAdd = canAddMoreAddons(addon.id) && addon.is_available && addon.qty_available > currentQty;
                  const canRemove = currentQty > 0;
                  
                  return (
                    <div key={addon.id} className="bg-white rounded-2xl p-6 shadow-xl flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-4xl mr-6">{addon.emoji || addon.icon || '🥄'}</span>
                        <div>
                          <h4 className="text-urban-green text-xl font-bold">{addon.name}</h4>
                          <p className="text-gray-600 text-lg">+${price.toFixed(2)}</p>
                          {totalQty >= 6 && (
                            <p className="text-red-500 text-sm font-medium">Max addons limit reached (6)</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Button
                          onClick={() => handleAddonUpdate(addon.id, addon.name, price, -1)}
                          className="bg-gray-200 text-gray-700 w-14 h-14 rounded-full font-bold text-2xl hover:bg-gray-300 transition-all touch-btn"
                          disabled={!canRemove}
                          variant="ghost"
                        >
                          <Minus className="w-6 h-6" />
                        </Button>
                        <span className="font-bold text-2xl w-10 text-center text-urban-green">
                          {currentQty}
                        </span>
                        <Button
                          onClick={() => handleAddonUpdate(addon.id, addon.name, price, 1)}
                          className={`w-14 h-14 rounded-full font-bold text-2xl transition-all touch-btn ${
                            canAdd 
                              ? 'urban-yellow text-black hover:bg-yellow-500' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!canAdd}
                          variant="ghost"
                        >
                          <Plus className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Order Summary */}
            <div className="bg-white bg-opacity-10 rounded-2xl p-6 mt-6 backdrop-blur-sm">
              <div className="flex justify-between items-center text-white">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">${total.toFixed(2)}</div>
                  <div className="text-sm opacity-80">Total Price</div>
                </div>
                <div className="w-px h-12 bg-white/20 mx-4"></div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">{Math.round(totalCalories)}</div>
                  <div className="text-sm opacity-80">Calories</div>
                </div>
              </div>
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
        </>
      )}
        </>
      )}
    </div>
  );
}
