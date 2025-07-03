import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FloatingAnimation from '@/components/floating-animation';
import { CreateTabContent } from '@/components/tabs/CreateTabContent';
import { SavedTabContent } from '@/components/tabs/SavedTabContent';
import { OriginalsTabContent } from '@/components/tabs/OriginalsTabContent';
import { MenuItem } from '@shared/schema';
import { useState, useEffect } from 'react';

export default function ItemsPage() {
  const [, setLocation] = useLocation();
  const { currentCategory, setSelectedItem, selectedTab, setSelectedTab } = useVendingStore();
  const [activeTab, setActiveTab] = useState(selectedTab);

  useEffect(() => {
    // Update local state when selectedTab changes in store
    setActiveTab(selectedTab);
  }, [selectedTab]);

  const { data: items, isLoading } = useQuery({
    queryKey: ['/api/menu', currentCategory],
    queryFn: () => api.getMenuItemsByCategory(currentCategory),
    enabled: !!currentCategory
  });

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setLocation('/customization');
  };

  if (!currentCategory) {
    setLocation('/selection');
    return null;
  }

  return (
    <div className="absolute inset-0 urban-green">
      <FloatingAnimation />
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-4 sticky top-0 z-20 bg-urban-green">
          <Button
            onClick={() => setLocation('/selection')}
            className="bg-white bg-opacity-20 text-white px-4 py-3 rounded-xl hover:bg-opacity-30 transition-all touch-btn flex items-center gap-2"
            variant="ghost"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">
              Back to Selection
            </span>
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center px-4">
          <Tabs 
            defaultValue={selectedTab} 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
              setSelectedTab(value as any);
            }}
            className="w-full max-w-4xl h-full"
          >
            <TabsList className="w-full grid grid-cols-3 p-3 rounded-2xl shadow-lg sticky top-[72px] z-10 bg-black bg-opacity-20 h-auto">
              <TabsTrigger 
                value="create" 
                className="text-2xl font-bold text-white data-[state=active]:urban-yellow data-[state=active]:text-urban-green data-[state=active]:shadow-lg py-6 rounded-xl transition-all duration-300 hover:bg-white hover:bg-opacity-10"
              >
                Create
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="text-2xl font-bold text-white data-[state=active]:urban-yellow data-[state=active]:text-urban-green data-[state=active]:shadow-lg py-6 rounded-xl transition-all duration-300 hover:bg-white hover:bg-opacity-10"
              >
                Saved
              </TabsTrigger>
              <TabsTrigger 
                value="originals" 
                className="text-2xl font-bold text-white data-[state=active]:urban-yellow data-[state=active]:text-urban-green data-[state=active]:shadow-lg py-6 rounded-xl transition-all duration-300 hover:bg-white hover:bg-opacity-10"
              >
                Originals
              </TabsTrigger>
            </TabsList>

            <div className="h-[calc(100vh-160px)] overflow-y-auto mt-16 pb-24 scrollbar-hide">
              <CreateTabContent category={currentCategory} />
              <SavedTabContent category={currentCategory} />
              <OriginalsTabContent 
                items={items} 
                isLoading={isLoading} 
                onSelectItem={handleSelectItem}
              />
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
