import { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Minus, X, AlertCircle } from "lucide-react";
import glassImage from "@/assets/glass.png";

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
  // Determine if we're making a smoothie or salad
  const isSmoothie = category === 'smoothies';
  const containerType = isSmoothie ? 'cup' : 'bowl';
  
  // State for ingredients in the recipe
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [maxIndicatorVisible, setMaxIndicatorVisible] = useState<boolean>(false);

  // Available ingredients based on category
  const availableIngredients = isSmoothie ? [
    { id: 'apple', name: 'Apple', emoji: '🍎', maxPercentage: 40 },
    { id: 'banana', name: 'Banana', emoji: '🍌', maxPercentage: 40 },
    { id: 'strawberry', name: 'Strawberry', emoji: '🍓', maxPercentage: 50 },
    { id: 'raspberry', name: 'Raspberry', emoji: '🍇', maxPercentage: 30 },
    { id: 'ginger', name: 'Ginger', emoji: '🫚', maxPercentage: 10 },
    { id: 'orange', name: 'Orange', emoji: '🍊', maxPercentage: 40 },
    { id: 'kiwi', name: 'Kiwi', emoji: '🥝', maxPercentage: 30 },
    { id: 'mango', name: 'Mango', emoji: '🥭', maxPercentage: 40 },
  ] : [
    { id: 'lettuce', name: 'Lettuce', emoji: '🥬', maxPercentage: 40 },
    { id: 'tomato', name: 'Tomato', emoji: '🍅', maxPercentage: 30 },
    { id: 'cucumber', name: 'Cucumber', emoji: '🥒', maxPercentage: 30 },
    { id: 'carrot', name: 'Carrot', emoji: '🥕', maxPercentage: 30 },
    { id: 'avocado', name: 'Avocado', emoji: '🥑', maxPercentage: 20 },
    { id: 'corn', name: 'Corn', emoji: '🌽', maxPercentage: 20 },
    { id: 'olive', name: 'Olive', emoji: '🫒', maxPercentage: 10 },
    { id: 'pepper', name: 'Bell Pepper', emoji: '🫑', maxPercentage: 20 },
  ];

  // Update total percentage whenever selected ingredients change
  useEffect(() => {
    const newTotal = selectedIngredients.reduce(
      (sum, ingredient) => sum + ingredient.currentPercentage, 0
    );
    setTotalPercentage(newTotal);
  }, [selectedIngredients]);

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
      if (totalPercentage + 10 > 100) {
        setAlert(`The ${containerType} is already full. Please remove something first.`);
        setTimeout(() => setAlert(null), 3000);
        return;
      }
      
      // Increase percentage
      setSelectedIngredients(selectedIngredients.map(item => 
        item.id === ingredient.id 
          ? { ...item, currentPercentage: item.currentPercentage + 10 } 
          : item
      ));
    } else {
      // Check if adding a new ingredient would exceed total 100%
      if (totalPercentage + 10 > 100) {
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
        { ...ingredient, currentPercentage: 10 }
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
          ? { ...item, currentPercentage: item.currentPercentage - 10 } 
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
    
    // TODO: Save recipe or proceed to next step
    setAlert("Recipe created successfully! 🎉");
    setTimeout(() => {
      setAlert(null);
      // Reset form for next creation
      setSelectedIngredients([]);
    }, 3000);
  };

  return (
    <TabsContent value="create" className="scrollbar-hide pb-20">
      <div className="bg-white bg-opacity-5 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
        {/* Header */}
        <h3 className="text-white text-4xl font-bold mb-6 text-center">
          Create Your Own {category.slice(0, -1)}
        </h3>
        
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
                      {ingredient.currentPercentage > 10 ? (
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
            <div className="relative w-full max-w-[250px]">
              {isSmoothie ? (
                /* Smoothie Glass */
                <div className="w-full flex items-end justify-center relative">
                  {/* Glass Image */}
                  <div className="relative w-full max-w-[250px] h-[350px]">
                    <img 
                      src={glassImage} 
                      alt="Smoothie Glass" 
                      className="w-full h-full object-contain absolute top-0 left-0 z-10"
                    />
                    
                    {/* Smoothie Content */}
                    <div className="absolute bottom-[10%] left-[16%] w-[68%] h-[80%] z-0 overflow-hidden rounded-b-3xl">
                      <div 
                        className="absolute bottom-0 w-full"
                        style={{ 
                          height: `${totalPercentage}%`, 
                          background: `linear-gradient(to top, 
                            ${selectedIngredients.map((ing, i) => {
                              const stopPercentage = selectedIngredients
                                .slice(0, i + 1)
                                .reduce((sum, item) => sum + item.currentPercentage, 0);
                              return `${ing.id === 'strawberry' ? '#ff6b6b' : 
                                      ing.id === 'banana' ? '#ffcc5c' : 
                                      ing.id === 'apple' ? '#8cd790' : 
                                      ing.id === 'kiwi' ? '#64a36f' : 
                                      ing.id === 'mango' ? '#ffb347' : 
                                      ing.id === 'raspberry' ? '#c94c4c' : 
                                      ing.id === 'ginger' ? '#e8c872' : 
                                      ing.id === 'orange' ? '#ffac33' : '#a8e6cf'} ${stopPercentage}%`;
                            }).join(', ')}
                          )`,
                          transition: 'height 0.3s ease, background 0.3s ease'
                        }}
                      >
                        {/* Smoothie texture */}
                        <div className="absolute inset-0 opacity-20 mix-blend-overlay" 
                          style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")'}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Salad Bowl */
                <div className="aspect-[4/3] w-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-full border-2 border-white/20 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute w-[90%] h-[70%] bottom-[5%] rounded-[50%] overflow-hidden">
                    <div 
                      className="absolute bottom-0 w-full"
                      style={{ 
                        height: `${totalPercentage}%`, 
                        background: `linear-gradient(to bottom, 
                          ${selectedIngredients.map((ing, i) => {
                            const stopPercentage = selectedIngredients
                              .slice(0, i + 1)
                              .reduce((sum, item) => sum + item.currentPercentage, 0);
                            return `${ing.id === 'lettuce' ? '#90be6d' : 
                                    ing.id === 'tomato' ? '#ff6b6b' : 
                                    ing.id === 'cucumber' ? '#a8e6cf' : 
                                    ing.id === 'carrot' ? '#ffac33' : 
                                    ing.id === 'avocado' ? '#6a994e' : 
                                    ing.id === 'corn' ? '#ffcc5c' : 
                                    ing.id === 'olive' ? '#386641' : 
                                    ing.id === 'pepper' ? '#dc2f02' : '#a8e6cf'} ${stopPercentage}%`;
                          }).join(', ')}
                        )`,
                        transition: 'height 0.3s ease, background 0.3s ease'
                      }}
                    >
                      {/* Bowl content texture */}
                      <div className="absolute inset-0 opacity-20 mix-blend-overlay" 
                        style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")'}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Bowl rim details */}
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-white/20 rounded-full pointer-events-none"></div>
                </div>
              )}
            </div>
            
            {/* Percentage display on container */}
            <div className="mt-4 text-white text-2xl font-bold">
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
      </div>
    </TabsContent>
  );
}
