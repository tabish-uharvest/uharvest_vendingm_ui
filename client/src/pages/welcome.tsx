import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useVendingStore } from '@/lib/store';
import FloatingAnimation from '@/components/floating-animation';

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const { resetApp, setCategory, setSelectedTab } = useVendingStore();

  const handleStart = () => {
    resetApp();
    // Set default category and tab before navigation
    setCategory('sweets');
    setSelectedTab('create');
    setLocation('/items');
  };

  return (
    <div className="welcome-container">
      {/* Floating sweets background */}
      <FloatingAnimation className="z-0 opacity-80" />

      {/* Logo & Tagline */}
      <div className="logo-section">
        <img
          src={"/src/assets/haldiram.png"}
          alt="Haldiram Logo"
          className="logo-img"
          draggable={false}
        />
        <div className="tagline">Taste of Tradition</div>
      </div>

      {/* Welcome Heading */}
      <h1 className="welcome-title">
        <span className="highlight-text">Customized Mithai Box</span>
      </h1>

      {/* Start Button */}
      <div className="start-btn-wrapper">
        <Button 
          onClick={handleStart}
          className="start-btn-rect animate-glow"
        >
         <span>Start Now</span> 
        </Button>
      </div>

      {/* Footer Text */}
      <p className="footer-text animate-fade-in">
        Touch Start to begin your sweet journey
      </p>
    </div>
  );
}