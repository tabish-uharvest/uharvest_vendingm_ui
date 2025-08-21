import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { MenuItem } from "@shared/schema";
import { usePresets } from "@/hooks/useMachineData";
import { useVendingStore } from "@/lib/store";
import { useState } from "react";

interface OriginalsTabContentProps {
  category: string;
  onSelectItem: (item: MenuItem) => void;
}

export function OriginalsTabContent({ category, onSelectItem }: OriginalsTabContentProps) {
  const [, setLocation] = useLocation();
  const machineId = useVendingStore((state) => state.machineId);
  const setSelectedItem = useVendingStore((state) => state.setSelectedItem);
  
  const { data: presetsData, isLoading, error } = usePresets(machineId, category === 'smoothies' ? 'smoothie' : 'salad');
  
  // Convert backend presets to MenuItem format
  const items = presetsData?.presets?.map((preset): MenuItem => ({
    id: preset.preset_id,
    name: preset.preset_name,
    description: preset.preset_description,
    price: preset.preset_price.toString(),
    image: preset.preset_image || '/api/placeholder/400/300', // fallback image
    calories: preset.preset_calories,
    category: preset.preset_category === 'smoothie' ? 'smoothies' : 'salads',
  })) || [];

  // Handle preset selection - just store the preset ID and navigate
  const handlePresetSelect = (item: MenuItem) => {
    // Create a preset item for customization page
    const presetItem = {
      ...item,
      isPresetRecipe: true, // Flag to identify preset recipes
      presetId: item.id // Store the preset ID for fetching details on customization page
    };
    
    setSelectedItem(presetItem as any);
    setLocation('/customization');
  };

  return (
    <TabsContent value="originals" className="pb-20 scrollbar-hide">
      <div className="space-y-6 pb-16 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-white text-2xl">Loading presets from machine...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-red-400 text-2xl">Error loading presets: {(error as Error).message}</div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-white text-2xl">No preset {category} available at this machine</div>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-6 shadow-lg transform transition-all duration-200 hover:scale-[1.02]">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-48 object-cover rounded-2xl mb-5"
              />
              <h3 className="text-urban-green text-3xl font-bold mb-2">{item.name}</h3>
              <p className="text-gray-600 text-xl mb-4">{item.description}</p>
              <div className="flex justify-between items-center mb-5">
                <span className="text-urban-green font-bold text-2xl">${item.price}</span>
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-lg font-medium">
                  {item.calories} cal
                </span>
              </div>
              <Button
                onClick={() => handlePresetSelect(item)}
                className="w-full urban-yellow text-black text-2xl font-bold py-5 h-auto rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 touch-btn"
              >
                <Plus className="mr-3 w-6 h-6" />
                Add to Cart & Customize
              </Button>
            </div>
          ))
        )}
      </div>
    </TabsContent>
  );
}
