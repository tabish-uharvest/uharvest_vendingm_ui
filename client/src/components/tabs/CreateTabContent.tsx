import { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Minus, X, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import glassImage from "@/assets/glass.png";
import bowlImage from "@/assets/bowl.png";
import { useAvailableIngredients, useMachineInventory } from "@/hooks/useMachineData";
import { useVendingStore } from "@/lib/store";

// Props interface
interface CreateTabContentProps {
  category: string;
}

// Ingredient type definition
interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  maxPercentage: number;
  currentPercentage: number;
}

// Main CreateTabContent component
export function CreateTabContent({ category }: CreateTabContentProps) {
  const [, setLocation] = useLocation();
  const machineId = useVendingStore((state) => state.machineId);
  const setSelectedItem = useVendingStore((state) => state.setSelectedItem);
  const inventoryData = useVendingStore((state) => state.inventoryData);
  const setInventoryData = useVendingStore((state) => state.setInventoryData);
  
  // Load inventory data and ingredients
  const { data: fullInventoryData } = useMachineInventory(machineId);
  const { ingredients: apiIngredients, isLoading, error } = useAvailableIngredients(machineId);
  
  // Set inventory data in store when it loads
  useEffect(() => {
    if (fullInventoryData) {
      console.log('Setting inventory data in CreateTab:', fullInventoryData);
      setInventoryData(fullInventoryData);
    }
  }, [fullInventoryData, setInventoryData]);
  
  // Determine if we're making a smoothie or salad
  const isSmoothie = category === 'smoothies';
  const containerType = isSmoothie ? 'cup' : 'bowl';
  
  // State for ingredients in the recipe
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [maxIndicatorVisible, setMaxIndicatorVisible] = useState<boolean>(false);
  
  // State for liquid selection (smoothies only)
  const [selectedLiquids, setSelectedLiquids] = useState<{
    milk: boolean;
    hotWater: boolean;
  }>({
    milk: false,
    hotWater: false
  });

  // State for dressing selection (salads only)
  const [selectedDressings, setSelectedDressings] = useState<{
    dressing1: boolean;
    dressing2: boolean;
  }>({
    dressing1: false,
    dressing2: false
  });

  // Convert API ingredients to local format - filter by category if needed
  const availableIngredients = apiIngredients
    .filter((ingredient) => {
      // You can add more sophisticated filtering here based on your data
      // For now, showing all available ingredients
      return ingredient.is_available && !ingredient.is_low_stock;
    })
    .map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      emoji: ingredient.emoji || ingredient.icon || '🥬', // Use emoji or icon, fallback to generic
      maxPercentage: ingredient.max_percent_limit,
    }));

  // Update total percentage whenever selected ingredients change
  useEffect(() => {
    const newTotal = selectedIngredients.reduce(
      (sum, ingredient) => sum + ingredient.currentPercentage, 0
    );
    setTotalPercentage(newTotal);
  }, [selectedIngredients]);

  // Debug log for price calculation
  useEffect(() => {
    if (selectedIngredients.length > 0 && inventoryData) {
      console.log('CreateTab - Selected ingredients:', selectedIngredients);
      console.log('CreateTab - Inventory data:', inventoryData);
    }
  }, [selectedIngredients, inventoryData]);

  // Add ingredient to recipe
  const addIngredient = (ingredient: { id: string; name: string; emoji: string; maxPercentage: number }) => {
    // Check if this ingredient is already added
    const existingIngredient = selectedIngredients.find(item => item.id === ingredient.id);
    
    if (existingIngredient) {
      // If ingredient exists, increase its percentage (if possible)
      if (existingIngredient.currentPercentage >= existingIngredient.maxPercentage) {
        setAlert(`${ingredient.name} already at maximum capacity (${ingredient.maxPercentage}%)`);
        
        // Show max indicator animation
        setMaxIndicatorVisible(true);
        setTimeout(() => {
          setMaxIndicatorVisible(false);
        }, 1000);
        
        setTimeout(() => setAlert(null), 3000);
        return;
      }
      
      // Check if adding 10% more would exceed total 100%
      if (totalPercentage + 20 > 100) {
        setAlert(`The ${containerType} is already full. Please remove something first.`);
        setTimeout(() => setAlert(null), 3000);
        return;
      }
      
      // Increase percentage
      setSelectedIngredients(selectedIngredients.map(item => 
        item.id === ingredient.id 
          ? { ...item, currentPercentage: item.currentPercentage + 20 } 
          : item
      ));
    } else {
      // Check if adding a new ingredient would exceed total 100%
      if (totalPercentage + 20 > 100) {
        setAlert(`The ${containerType} is already full. Please remove something first.`);
        setTimeout(() => setAlert(null), 3000);
        return;
      }
      
      // Check if we already have 5 ingredients
      if (selectedIngredients.length >= 5) {
        setAlert(`You can only add up to 5 ingredients.`);
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      // Add new ingredient with 10% to start
      setSelectedIngredients([
        ...selectedIngredients,
        { ...ingredient, currentPercentage: 20 }
      ]);
    }
  };

  // Decrease ingredient percentage
  const decreaseIngredient = (id: string) => {
    const ingredient = selectedIngredients.find(item => item.id === id);
    if (!ingredient) return;

    if (ingredient.currentPercentage <= 10) {
      // If at 10%, remove completely
      setSelectedIngredients(selectedIngredients.filter(item => item.id !== id));
    } else {
      // Otherwise decrease by 10%
      setSelectedIngredients(selectedIngredients.map(item => 
        item.id === id 
          ? { ...item, currentPercentage: item.currentPercentage - 20 } 
          : item
      ));
    }
  };

  // Remove ingredient completely
  const removeIngredient = (id: string) => {
    setSelectedIngredients(selectedIngredients.filter(item => item.id !== id));
  };
  
  // Handle recipe confirmation
  const confirmRecipe = () => {
    if (totalPercentage < 100) {
      setAlert(`Please fill the ${containerType} completely (${totalPercentage}/100%)`);
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    // For smoothies, check if at least one liquid is selected
    if (isSmoothie && !selectedLiquids.milk && !selectedLiquids.hotWater) {
      setAlert('Please select at least one base (Milk or Hot Water)');
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    // For salads, check if at least one dressing is selected
    if (!isSmoothie && !selectedDressings.dressing1 && !selectedDressings.dressing2) {
      setAlert('Please select at least one dressing');
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    
    // Calculate dynamic price and calories based on ingredients used
    const totalPrice = selectedIngredients.reduce((sum, ingredient) => {
      const inventoryItem = inventoryData?.ingredients?.find((inv: any) => inv.id === ingredient.id);
      if (!inventoryItem) {
        console.log(`No inventory item found for ingredient ${ingredient.id}`);
        return sum;
      }
      
      // Calculate grams used: each 10% = min_qty_g grams
      const percentageIncrements = ingredient.currentPercentage / 10; // Number of 10% increments
      const gramsUsed = percentageIncrements * parseFloat(inventoryItem.min_qty_g);
      
      // Calculate price: price_per_unit × grams used
      const pricePerGram = parseFloat(inventoryItem.price_per_unit);
      const ingredientPrice = gramsUsed * pricePerGram;
      
      console.log(`Ingredient: ${ingredient.name}, Percentage: ${ingredient.currentPercentage}%, Increments: ${percentageIncrements}, Grams: ${gramsUsed}, Price per gram: ${pricePerGram}, Total price: ${ingredientPrice}`);
      
      return sum + ingredientPrice;
    }, 0);

    const totalCalories = selectedIngredients.reduce((sum, ingredient) => {
      const inventoryItem = inventoryData?.ingredients?.find((inv: any) => inv.id === ingredient.id);
      if (!inventoryItem) return sum;
      
      // Calculate grams used: each 10% = min_qty_g grams
      const percentageIncrements = ingredient.currentPercentage / 10; // Number of 10% increments
      const gramsUsed = percentageIncrements * parseFloat(inventoryItem.min_qty_g);
      
      // Calculate calories: calories_per_unit × grams used
      const caloriesPerGram = parseFloat(inventoryItem.calories_per_unit);
      const ingredientCalories = gramsUsed * caloriesPerGram;
      
      return sum + ingredientCalories;
    }, 0);
    
    console.log(`Total price calculated: ${totalPrice}, Total calories: ${totalCalories}`);

    // Build liquids array for API
    // For smoothies: includes milk and hot water
    // For salads: includes salad dressings (passed as liquids)
    const liquidsArray = [];
    
    if (isSmoothie) {
      // Smoothie liquids
      if (selectedLiquids.milk) {
        liquidsArray.push({ liquid_name: 'milk', qty: '50ml' });
      }
      if (selectedLiquids.hotWater) {
        liquidsArray.push({ liquid_name: 'hot water', qty: '50ml' });
      }
    } else {
      // Salad dressings (passed as liquids in API)
      if (selectedDressings.dressing1) {
        liquidsArray.push({ liquid_name: 'salad dressing 1', qty: '50ml' });
      }
      if (selectedDressings.dressing2) {
        liquidsArray.push({ liquid_name: 'salad dressing 2', qty: '50ml' });
      }
    }
    
    // Create a custom recipe item and navigate to customization
    const customRecipe = {
      id: `custom-${Date.now()}`,
      name: `Custom ${isSmoothie ? 'Smoothie' : 'Salad'}`,
      category: isSmoothie ? 'smoothies' : 'salads',
      price: totalPrice.toFixed(2), // Dynamic price based on ingredients
      calories: Math.round(totalCalories).toString(), // Dynamic calories
      description: "Your custom creation",
      image: isSmoothie ? glassImage : bowlImage,
      customIngredients: selectedIngredients.map(ingredient => ({
        id: ingredient.id,
        name: ingredient.name,
        emoji: ingredient.emoji,
        percentage: ingredient.currentPercentage
      })),
      customLiquids: liquidsArray, // Include liquids for smoothies and dressings for salads
      isCustomRecipe: true // Flag to identify custom recipes
    };
    
    console.log('Custom Recipe:', customRecipe);
    setSelectedItem(customRecipe as any);
    setLocation('/customization');
  };

  return (
    <TabsContent value="create" className="scrollbar-hide pb-20">
      <div className="bg-white bg-opacity-5 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
        {/* Header */}
        <h3 className="text-white text-4xl font-bold mb-6 text-center">
          Create Your Own {category.slice(0, -1)}
        </h3>
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-white text-2xl">Loading ingredients from machine...</div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex items-center justify-center p-8">
            <div className="text-red-400 text-2xl">Error loading ingredients: {(error as Error).message}</div>
          </div>
        ) : availableIngredients.length === 0 ? (
          /* No ingredients available */
          <div className="flex items-center justify-center p-8">
            <div className="text-white text-2xl">No ingredients available at this machine</div>
          </div>
        ) : (
          /* Main Content - Exact same layout as original */
          <>
            {/* Choose Your Base Section (For Smoothies Only) */}
            {isSmoothie && (
              <div className="mb-8 bg-white bg-opacity-10 rounded-2xl p-6">
                <h4 className="text-white text-xl font-bold mb-4">Choose Your Base</h4>
                <div className="flex gap-4 flex-wrap">
                  <Button
                    onClick={() => setSelectedLiquids({ ...selectedLiquids, milk: !selectedLiquids.milk })}
                    className={`flex-1 min-w-[150px] py-6 px-6 rounded-xl font-semibold text-lg transition-all ${
                      selectedLiquids.milk
                        ? 'urban-yellow text-black border-2 border-yellow-300'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 border-2 border-transparent'
                    }`}
                    variant="ghost"
                  >
                    🥛 Milk 
                  </Button>
                  <Button
                    onClick={() => setSelectedLiquids({ ...selectedLiquids, hotWater: !selectedLiquids.hotWater })}
                    className={`flex-1 min-w-[150px] py-6 px-6 rounded-xl font-semibold text-lg transition-all ${
                      selectedLiquids.hotWater
                        ? 'urban-yellow text-black border-2 border-yellow-300'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 border-2 border-transparent'
                    }`}
                    variant="ghost"
                  >
                    💧 Hot Water 
                  </Button>
                </div>
              </div>
            )}
            
            {/* Choose Your Dressing Section (For Salads Only) */}
            {!isSmoothie && (
              <div className="mb-8 bg-white bg-opacity-10 rounded-2xl p-6">
                <h4 className="text-white text-xl font-bold mb-4">Choose Your Dressing</h4>
                <div className="flex gap-4 flex-wrap">
                  <Button
                    onClick={() => setSelectedDressings({ ...selectedDressings, dressing1: !selectedDressings.dressing1 })}
                    className={`flex-1 min-w-[150px] py-6 px-6 rounded-xl font-semibold text-lg transition-all ${
                      selectedDressings.dressing1
                        ? 'urban-yellow text-black border-2 border-yellow-300'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 border-2 border-transparent'
                    }`}
                    variant="ghost"
                  >
                    🥗 Salad Dressing 1 
                  </Button>
                  <Button
                    onClick={() => setSelectedDressings({ ...selectedDressings, dressing2: !selectedDressings.dressing2 })}
                    className={`flex-1 min-w-[150px] py-6 px-6 rounded-xl font-semibold text-lg transition-all ${
                      selectedDressings.dressing2
                        ? 'urban-yellow text-black border-2 border-yellow-300'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 border-2 border-transparent'
                    }`}
                    variant="ghost"
                  >
                    🥗 Salad Dressing 2 
                  </Button>
                </div>
              </div>
            )}
            
            {/* Main Content Area */}
            <div className="grid md:grid-cols-2 gap-6 w-full min-h-[630px] overflow-hidden">
              {/* Left side - Ingredient List */}
              <div className="bg-white bg-opacity-10 rounded-2xl p-5 flex flex-col h-[630px]">
                <h4 className="text-white text-2xl font-bold mb-4">
                  {selectedIngredients.length > 0 ? "Add more" : "Pick ingredients"}
                </h4>
                
                {selectedIngredients.length > 0 ? (
                  <div className="space-y-3 flex-grow max-h-[460px] overflow-y-hidden pr-2">
                    {selectedIngredients.map(ingredient => (
                      <div 
                        key={ingredient.id}
                        className="bg-white bg-opacity-20 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{ingredient.emoji}</span>
                          <div>
                            <p className="text-white text-xl font-semibold">{ingredient.name}</p>
                            <p className="text-urban-yellow">{ingredient.currentPercentage}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {ingredient.currentPercentage > 20 ? (
                            <Button
                              onClick={() => decreaseIngredient(ingredient.id)}
                              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-10 h-10 p-1 flex items-center justify-center"
                              variant="ghost"
                            >
                              <Minus className="w-5 h-5 text-white" />
                            </Button>
                          ) : (
                            <Button
                              onClick={() => removeIngredient(ingredient.id)}
                              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-10 h-10 p-1 flex items-center justify-center"
                              variant="ghost"
                            >
                              <X className="w-5 h-5 text-white" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center">
                    <p className="text-white text-xl opacity-70 text-center">
                      Add ingredients from below to start creating your {category.slice(0, -1)}
                    </p>
                  </div>
                )}
                
                {/* Fill percentage indicator */}
                <div className="mt-6 mb-2">
                  <div className="flex justify-between text-white mb-1">
                    <p>Fill level</p>
                    <p>{totalPercentage}%</p>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-4">
                    <div 
                      className="h-full rounded-full urban-yellow"
                      style={{ width: `${totalPercentage}%`, transition: 'width 0.3s ease' }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Cup/Bowl Visualization */}
              <div className="bg-white bg-opacity-10 rounded-2xl p-5 flex flex-col items-center justify-center relative h-[630px]">
                {/* Container Visualization */}
                <div className={`relative w-full mt-4 ${isSmoothie ? 'max-w-[300px]' : 'max-w-[350px]'}`}>
                  {isSmoothie ? (
                    /* Smoothie Glass */
                    <div className="w-full flex items-end justify-center relative">
                      {/* Glass Image */}
                      <div className="relative w-full max-w-[300px] h-[400px]">
                        <img 
                          src={glassImage} 
                          alt="Smoothie Glass" 
                          className="w-full h-full object-contain absolute top-0 left-0 z-10"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Salad Bowl */
                    <div className="w-full flex items-end justify-center relative">
                      {/* Bowl Image */}
                      <div className="relative w-full max-w-[350px] h-[450px]">
                        <img 
                          src={bowlImage} 
                          alt="Salad Bowl" 
                          className="w-full h-full object-contain absolute top-0 left-0 z-10"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Percentage display on container */}
                <div className="mt-2 text-white text-2xl font-bold">
                  {totalPercentage}%
                </div>
              </div>
            </div>
            
            {/* Ingredient Carousel */}
            <div className="mt-8">
              <h4 className="text-white text-xl font-bold mb-4">Add Ingredients</h4>
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-6">
                  {availableIngredients.map((ingredient) => {
                    // Check if this ingredient is at max capacity
                    const existingItem = selectedIngredients.find(item => item.id === ingredient.id);
                    const isAtMax = existingItem && existingItem.currentPercentage >= ingredient.maxPercentage;
                    const isAdded = Boolean(existingItem);
                    const isMaxIngredient = existingItem?.id === selectedIngredients.find(item => 
                      item.currentPercentage >= item.maxPercentage && maxIndicatorVisible)?.id;
                    
                    return (
                      <div 
                        key={ingredient.id} 
                        className="flex flex-col items-center gap-2"
                      >
                        <Button
                          onClick={() => addIngredient(ingredient)}
                          disabled={isAtMax}
                          className={`h-20 w-20 rounded-full flex-shrink-0 flex items-center justify-center transition-all relative overflow-hidden ${
                            isAtMax 
                              ? 'bg-gray-500/50 border-2 border-red-400' 
                              : isAdded
                                ? 'bg-white/90 border-2 border-urban-yellow' 
                                : 'bg-white hover:bg-white/90'
                          }`}
                          variant="ghost"
                        >
                          <span className={`text-4xl ${isAtMax ? 'opacity-60' : ''}`}>{ingredient.emoji}</span>
                          {isAtMax ? (
                            <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm ${isMaxIngredient ? 'animate-pulse' : ''}`}>
                              <div className="bg-red-500 text-white px-2 py-1 rounded-md font-bold text-xs transform rotate-12">
                                MAX
                              </div>
                            </div>
                          ) : (
                            isAdded ? (
                              <div className="absolute top-0 right-0 w-6 h-6 bg-urban-yellow text-black rounded-full flex items-center justify-center">
                                {/* <Plus className="w-3 h-3" /> */}
                              </div>
                            ) : (
                              <div className="absolute top-0 right-0 w-5 h-5 bg-urban-yellow text-black rounded-full flex items-center justify-center">
                                {/* <Plus className="w-3 h-3" /> */}
                              </div>
                            )
                          )}
                        </Button>
                        <div className="flex flex-col items-center">
                          <span className="text-white text-sm font-medium">{ingredient.name}</span>
                          {isAdded && (
                            <span className={`text-xs ${isAtMax ? 'text-red-400 font-semibold' : 'text-urban-yellow'}`}>
                              {existingItem?.currentPercentage}% {isAtMax && '(MAX)'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Main Action Button */}
            <div className="mt-8 flex justify-center">
              <Button
                onClick={confirmRecipe}
                disabled={totalPercentage < 100}
                className={`text-2xl font-bold py-8 px-12 rounded-2xl shadow-xl transform transition-all duration-200 ${
                  totalPercentage >= 100 
                    ? 'urban-yellow text-black hover:scale-105 hover:shadow-2xl' 
                    : 'bg-white/20 text-white/70'
                }`}
              >
                {totalPercentage >= 100 ? 'Confirm Recipe' : `Fill the ${containerType} (${totalPercentage}/100%)`}
              </Button>
            </div>
            
            {/* Alert Message */}
            {alert && (
              <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-8 py-5 rounded-xl flex items-center gap-3 z-30 shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300 border-l-4 border-urban-yellow">
                <AlertCircle className="text-urban-yellow w-6 h-6 flex-shrink-0" />
                <p className="text-lg font-medium">{alert}</p>
              </div>
            )}
          </>
        )}
      </div>
    </TabsContent>
  );
}
