import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import FloatingAnimation from '@/components/floating-animation';

export default function SelectionPage() {
  const [, setLocation] = useLocation();
  const { setCategory, setSelectedTab } = useVendingStore();

  const handleCategorySelect = (category: string, tab: string = 'originals') => {
    setCategory(category);
    setSelectedTab(tab);
    setLocation('/items');
  };

  return (
    <div className="absolute inset-0 urban-green flex flex-col">
      <FloatingAnimation />
      
      {/* Header with Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          onClick={() => setLocation('/')}
          className="bg-white bg-opacity-20 text-white px-6 py-4 rounded-xl hover:bg-opacity-30 transition-all touch-btn flex items-center gap-3"
          variant="ghost"
        >
          <ArrowLeft className="w-7 h-7" />
          <span className="text-xl font-medium">Main Screen</span>
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <h2 className="text-urban-white text-6xl font-bold text-center mb-10 z-10">
          What would you like today?
        </h2>
      
        <div className="grid grid-cols-1 gap-10 w-full max-w-5xl">
          {/* Smoothie Option */}
          <div className="bg-white rounded-3xl p-7 shadow-2xl z-10">
            <div className="flex flex-col items-center">
              <img 
                src="https://images.unsplash.com/photo-1553530666-ba11a7da3888?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                alt="Fresh colorful smoothies" 
                className="w-full h-52 object-cover rounded-2xl shadow-lg mb-7"
              />
              <h3 className="text-urban-green text-5xl font-bold mb-3">Smoothies</h3>
              <p className="text-gray-600 text-2xl mb-7">Fresh blended goodness</p>
              
              <div className="space-y-4 w-full">
                <Button
                  onClick={() => handleCategorySelect('smoothies', 'create')}
                  className="w-full urban-yellow text-black rounded-xl py-5 shadow-xl h-auto transform transition-all duration-200 hover:scale-105 active:scale-95"
                  variant="ghost"
                >
                  <span className="text-2xl font-bold">Create Your Own Smoothie</span>
                </Button>
                <Button
                  onClick={() => handleCategorySelect('smoothies', 'saved')}
                  className="w-full urban-yellow text-black rounded-xl py-5 shadow-xl h-auto transform transition-all duration-200 hover:scale-105 active:scale-95"
                  variant="ghost"
                >
                  <span className="text-2xl font-bold">Your Saved Smoothies</span>
                </Button>
                <Button
                  onClick={() => handleCategorySelect('smoothies', 'originals')}
                  className="w-full urban-yellow text-black rounded-xl py-5 shadow-xl h-auto transform transition-all duration-200 hover:scale-105 active:scale-95"
                  variant="ghost"
                >
                  <span className="text-2xl font-bold">Urban Harvest's Originals</span>
                </Button>

              </div>
            </div>
          </div>
          
          {/* Salad Option */}
          <div className="bg-white rounded-3xl p-7 shadow-2xl z-10">
            <div className="flex flex-col items-center">
              <img 
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                alt="Fresh healthy salads" 
                className="w-full h-52 object-cover rounded-2xl shadow-lg mb-7"
              />
              <h3 className="text-urban-green text-5xl font-bold mb-3">Salads</h3>
              <p className="text-gray-600 text-2xl mb-7">Crisp & nutritious bowls</p>
              
              <div className="space-y-4 w-full">
                <Button
                  onClick={() => handleCategorySelect('salads', 'create')}
                  className="w-full urban-yellow text-black rounded-xl py-5 shadow-xl h-auto transform transition-all duration-200 hover:scale-105 active:scale-95"
                  variant="ghost"
                >
                  <span className="text-2xl font-bold">Create Your Own Salad</span>
                </Button>
                <Button
                  onClick={() => handleCategorySelect('salads', 'saved')}
                  className="w-full urban-yellow text-black rounded-xl py-5 shadow-xl h-auto transform transition-all duration-200 hover:scale-105 active:scale-95"
                  variant="ghost"
                >
                  <span className="text-2xl font-bold">Your Saved Salads</span>
                </Button>
                <Button
                  onClick={() => handleCategorySelect('salads', 'originals')}
                  className="w-full urban-yellow text-black rounded-xl py-5 shadow-xl h-auto transform transition-all duration-200 hover:scale-105 active:scale-95"
                  variant="ghost"
                >
                  <span className="text-2xl font-bold">Urban Harvest's Originals</span>
                </Button>                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
