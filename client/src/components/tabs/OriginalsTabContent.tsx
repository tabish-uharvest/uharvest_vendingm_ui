import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MenuItem } from "@shared/schema";

interface OriginalsTabContentProps {
  items?: MenuItem[];
  isLoading: boolean;
  onSelectItem: (item: MenuItem) => void;
}

export function OriginalsTabContent({ items, isLoading, onSelectItem }: OriginalsTabContentProps) {
  return (
    <TabsContent value="originals" className="pb-20 scrollbar-hide">
      <div className="space-y-6 pb-16 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-white text-2xl">Loading items...</div>
          </div>
        ) : (
          items?.map((item) => (
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
                onClick={() => onSelectItem(item)}
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
