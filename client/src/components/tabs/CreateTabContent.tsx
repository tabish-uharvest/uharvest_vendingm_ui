import { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Minus, X, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useVendingStore } from "@/lib/store";
import boxImage from "@/assets/box.png";

// Props interface
interface CreateTabContentProps {
  category: string;
}

// Utility function to extract price number from price string
const extractPrice = (priceString: string): number => {
  // Handle cases like "₹62 / 200 gm" and "₹67 / Pc"
  if (priceString.includes('200 gm')) {
    const price = parseFloat(priceString.replace(/[^0-9]/g, ''));
    return price * 5; // Convert to per kg price (1000/200 = 5)
  }
  if (priceString.includes('/ Pc')) {
    const price = parseFloat(priceString.replace(/[^0-9]/g, ''));
    return price * 15; // Assume 15 pieces per kg
  }
  // Regular per kg price
  return parseFloat(priceString.replace(/[^0-9]/g, ''));
};

// Box variant type definition
interface BoxVariant {
  id: string;
  name: string;
  size: string;
  maxPercentageMultiplier: number;
  price: string;
}

// Ingredient type definition
interface Ingredient {
  id: string;
  name: string;
  image: string;
  price: string;
  maxPercentage: number;
  currentPercentage: number;
}

// Main CreateTabContent component
export function CreateTabContent({ category }: CreateTabContentProps) {
  // Determine if we're making sweets (box category)
  const isSweets = category === 'sweets';
  const containerType = 'box';

  // Available box variants
  const boxVariants: BoxVariant[] = [
    { id: 'half-kg', name: 'Small Box', size: '0.5 kg', maxPercentageMultiplier: 0.5, price: '₹0' },
    { id: 'one-kg', name: 'Regular Box', size: '1 kg', maxPercentageMultiplier: 1, price: '₹0' },
    { id: 'two-kg', name: 'Large Box', size: '2 kg', maxPercentageMultiplier: 2, price: '₹0' },
  ];

  // State for selected box variant
  const [selectedVariant, setSelectedVariant] = useState<BoxVariant>(boxVariants[1]); // Default to 1kg box
  
  // State for ingredients in the recipe
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [maxIndicatorVisible, setMaxIndicatorVisible] = useState<boolean>(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Calculate total price based on selected ingredients and their weights
  const calculateTotalPrice = (ingredients: Ingredient[]): number => {
    return ingredients.reduce((total, ingredient) => {
      const pricePerKg = extractPrice(ingredient.price);
      const weightInKg = (ingredient.currentPercentage / 100) * (selectedVariant.maxPercentageMultiplier);
      return total + (pricePerKg * weightInKg);
    }, 0);
  };

  // Available sweets with numbered images
  const availableIngredients = [
  { id: 'kaju-katli', name: 'Kaju Katli', image: '1.png', price: '₹1299 / kg', maxPercentage: 100 },
  { id: 'soan-papdi', name: 'Soan Papdi', image: '2.png', price: '₹675 / kg', maxPercentage: 100 },
  { id: 'petha', name: 'Petha', image: '3.png', price: '₹310 / kg', maxPercentage: 100 },
  { id: 'kaju-sweets', name: 'Kaju Sweets', image: '4.png', price: '₹571 / kg', maxPercentage: 100 },
  { id: 'coconut-burfi', name: 'Coconut Burfi', image: '5.png', price: '₹684 / kg', maxPercentage: 100 },
  { id: 'plain-burfi', name: 'Plain Burfi', image: '6.png', price: '₹678 / kg', maxPercentage: 100 },
  { id: 'pista-burfi', name: 'Pista Burfi', image: '7.png', price: '₹808 / kg', maxPercentage: 100 },
  { id: 'moti-choor-ladoo', name: 'Moti Choor Ladoo', image: '8.png', price: '₹695 / kg', maxPercentage: 100 },
  { id: 'besan-ladoo', name: 'Besan Ladoo', image: '9.png', price: '₹440 / kg', maxPercentage: 100 },
  { id: 'boondi-ladoo', name: 'Boondi Ladoo', image: '10.png', price: '₹599 / kg', maxPercentage: 100 },
  { id: 'coconut-dry-fruit-ladoo', name: 'Coconut Dry Fruit Ladoo', image: '11.png', price: '₹924 / kg', maxPercentage: 100 },
  { id: 'atta-ladoo', name: 'Atta Ladoo', image: '12.png', price: '₹440 / kg', maxPercentage: 100 },
  { id: 'doda-burfi', name: 'Doda Burfi', image: '13.png', price: '₹319 / kg', maxPercentage: 100 },
  { id: 'moong-dal-halwa', name: 'Moong Dal Halwa', image: '14.png', price: '₹190 / kg', maxPercentage: 100 },
  { id: 'mysore-pak', name: 'Mysore Pak', image: '15.png', price: '₹717 / kg', maxPercentage: 100 },
  { id: 'moong-dal-burfi', name: 'Moong Dal Burfi', image: '16.png', price: '₹381 / kg', maxPercentage: 100 },
  { id: 'special-pinni', name: 'Special Pinni', image: '17.png', price: '₹743 / kg', maxPercentage: 100 },
  { id: 'gajra-bahar', name: 'Gajra Bahar', image: '18.png', price: '₹1675 / kg', maxPercentage: 100 }, // 67/pc
  { id: 'badam-bhog', name: 'Badam Bhog', image: '19.png', price: '₹1675 / kg', maxPercentage: 100 },
  { id: 'madhu-milan', name: 'Madhu Milan', image: '20.png', price: '₹1675 / kg', maxPercentage: 100 },
  { id: 'pista-kali', name: 'Pista Kali', image: '21.png', price: '₹1675 / kg', maxPercentage: 100 },
  { id: 'anarkali', name: 'Anarkali', image: '22.png', price: '₹1675 / kg', maxPercentage: 100 },
  { id: 'pista-sandesh', name: 'Pista Sandesh', image: '23.png', price: '₹757 / kg', maxPercentage: 100 },
  { id: 'kachha-gola-sandesh', name: 'Kachha Gola Sandesh', image: '24.png', price: '₹1250 / kg', maxPercentage: 100 }, // 50/pc
  { id: 'chocolate-sandesh', name: 'Chocolate Sandesh', image: '25.png', price: '₹756 / kg', maxPercentage: 100 },
  { id: 'pineapple-sandesh', name: 'Pineapple Sandesh', image: '26.png', price: '₹820 / kg', maxPercentage: 100 },
  { id: 'kesar-coconut-ladoo', name: 'Kesar Coconut Ladoo', image: '27.png', price: '₹819 / kg', maxPercentage: 100 },
  { id: 'kesar-burfi', name: 'Kesar Burfi', image: '28.png', price: '₹794 / kg', maxPercentage: 100 },
  { id: 'chocolate-burfi', name: 'Chocolate Burfi', image: '29.png', price: '₹808 / kg', maxPercentage: 100 },
  { id: 'milk-burfi', name: 'Milk Burfi', image: '30.png', price: '₹805 / kg', maxPercentage: 100 },
  { id: 'mathura-peda', name: 'Mathura Peda', image: '31.png', price: '₹772 / kg', maxPercentage: 100 },
  { id: 'danedar-burfi', name: 'Danedar Burfi', image: '32.png', price: '₹856 / kg', maxPercentage: 100 },
  { id: 'hari-bhog', name: 'Hari Bhog', image: '33.png', price: '₹1250 / kg', maxPercentage: 100 },
  { id: 'pakeeja', name: 'Pakeeja', image: '34.png', price: '₹1250 / kg', maxPercentage: 100 },
  { id: 'malai-chop', name: 'Malai Chop', image: '35.png', price: '₹1250 / kg', maxPercentage: 100 },
  { id: 'maida-gujiya', name: 'Maida Gujiya', image: '36.png', price: '₹838 / kg', maxPercentage: 100 },
  { id: 'kesar-gujiya', name: 'Kesar Gujiya', image: '37.png', price: '₹927 / kg', maxPercentage: 100 },
  { id: 'sev-badam-burfi', name: 'Sev Badam Burfi', image: '38.png', price: '₹814 / kg', maxPercentage: 100 },
  { id: 'small-mewa-ladoo', name: 'Small Mewa Ladoo', image: '39.png', price: '₹927 / kg', maxPercentage: 100 },
  { id: 'shahi-ladoo', name: 'Shahi Ladoo', image: '40.png', price: '₹1654 / kg', maxPercentage: 100 },
  { id: 'spl-pinni', name: 'Spl Pinni', image: '41.png', price: '₹780 / kg', maxPercentage: 100 },
  { id: 'badam-burfi', name: 'Badam Burfi', image: '42.png', price: '₹1676 / kg', maxPercentage: 100 },
  { id: 'badam-ladoo', name: 'Badam Ladoo', image: '43.png', price: '₹1870 / kg', maxPercentage: 100 },
  { id: 'kaju-honey-dew', name: 'Kaju Honey Dew', image: '44.png', price: '₹1853 / kg', maxPercentage: 100 },
  { id: 'kaju-rose-katli', name: 'Kaju Rose Katli', image: '45.png', price: '₹1257 / kg', maxPercentage: 100 },
  { id: 'kaju-samosa', name: 'Kaju Samosa', image: '46.png', price: '₹1853 / kg', maxPercentage: 100 },
  { id: 'strawberry-katli', name: 'Strawberry Katli', image: '47.png', price: '₹1853 / kg', maxPercentage: 100 },
  { id: 'kaju-kalash', name: 'Kaju Kalash', image: '48.png', price: '₹1875 / kg', maxPercentage: 100 },
  { id: 'kaju-anjeer-cake', name: 'Kaju Anjeer Cake', image: '49.png', price: '₹1764 / kg', maxPercentage: 100 },
  { id: 'kaju-roll', name: 'Kaju Roll', image: '50.png', price: '₹1764 / kg', maxPercentage: 100 },
  { id: 'kaju-fancy-item', name: 'Kaju Fancy Item', image: '51.png', price: '₹2181 / kg', maxPercentage: 100 },
  { id: 'baklava-kaju-tart', name: 'Baklava Mithai Kaju Tart', image: '52.png', price: '₹1737 / kg', maxPercentage: 100 },
  { id: 'baklava-mango-tart', name: 'Baklava Mithai Mango Tart', image: '53.png', price: '₹2189 / kg', maxPercentage: 100 },
  { id: 'baklava-badam-tart', name: 'Baklava Mithai Badam Tart', image: '54.png', price: '₹2189 / kg', maxPercentage: 100 },
  { id: 'baklava-pista-tart', name: 'Baklava Mithai Pista Tart', image: '55.png', price: '₹3647 / kg', maxPercentage: 100 },
  { id: 'baklava-kiwi-tart', name: 'Baklava Mithai Kiwi Tart', image: '56.png', price: '₹1957 / kg', maxPercentage: 100 },
  { id: 'baklava-mix-tart', name: 'Baklava Mithai Mix Tart', image: '57.png', price: '₹2200 / kg', maxPercentage: 100 },
  { id: 'baklava-anjeer-tart', name: 'Baklava Mithai Anjeer Tart', image: '58.png', price: '₹1957 / kg', maxPercentage: 100 },
  { id: 'baklava-turquoise-tart', name: 'Baklava Mithai Turquoise Tart', image: '59.png', price: '₹2431 / kg', maxPercentage: 100 },
  { id: 'baklava-royal-pista-pyramid', name: 'Baklava Mithai Royal Pista Pyramid', image: '60.png', price: '₹2675 / kg', maxPercentage: 100 },
  { id: 'baklava-oso-bulbul-kaju', name: 'Baklava Mithai OSO Bulbul Kaju', image: '61.png', price: '₹2211 / kg', maxPercentage: 100 },
  { id: 'baklava-oso-bulbul-badam', name: 'Baklava Mithai OSO Bulbul Badam', image: '62.png', price: '₹2085 / kg', maxPercentage: 100 },
  { id: 'baklava-oso-bulbul-pista', name: 'Baklava Mithai OSO Bulbul Pista', image: '63.png', price: '₹3474 / kg', maxPercentage: 100 },
  { id: 'baklava-pista-diamond', name: 'Baklava Mithai Pista Diamond', image: '64.png', price: '₹3126 / kg', maxPercentage: 100 },
  { id: 'baklava-ring', name: 'Baklava Mithai Ring', image: '65.png', price: '₹1945 / kg', maxPercentage: 100 },
  { id: 'baklava-finger-roll', name: 'Baklava Mithai Finger Roll', image: '66.png', price: '₹1602 / kg', maxPercentage: 100 },
  { id: 'baklava-kaju-roll', name: 'Baklava Mithai Kaju Roll', image: '67.png', price: '₹2200 / kg', maxPercentage: 100 },
  { id: 'bite-orange', name: 'Bite Orange', image: '68.png', price: '₹1721 / kg', maxPercentage: 100 },
  { id: 'bite-mango', name: 'Bite Mango', image: '69.png', price: '₹1721 / kg', maxPercentage: 100 },
  { id: 'kaju-khajoor', name: 'Kaju Khajoor', image: '70.png', price: '₹1764 / kg', maxPercentage: 100 },
  { id: 'badam-khajoor', name: 'Badam Khajoor', image: '71.png', price: '₹1764 / kg', maxPercentage: 100 },
  { id: 'bite-choco', name: 'Bite Choco', image: '72.png', price: '₹1721 / kg', maxPercentage: 100 },
  { id: 'bite-mewa', name: 'Bite Mewa', image: '73.png', price: '₹1721 / kg', maxPercentage: 100 },
  { id: 'kiwi-delight', name: 'Kiwi Delight', image: '74.png', price: '₹1721 / kg', maxPercentage: 100 },
  { id: 'guava-delight', name: 'Guava Delight', image: '75.png', price: '₹1721 / kg', maxPercentage: 100 },
  { id: 'cranberry-delight', name: 'Cranberry Delight', image: '76.png', price: '₹1778 / kg', maxPercentage: 100 },
  { id: 'patisa', name: 'Patisa', image: '77.png', price: '₹624 / kg', maxPercentage: 100 },
  { id: 'cranberry-burfi', name: 'Cranberry Burfi', image: '78.png', price: '₹1522 / kg', maxPercentage: 100 },
  { id: 'cranberry-fusion', name: 'Cranberry Fusion', image: '79.png', price: '₹1522 / kg', maxPercentage: 100 },
  { id: 'cranberry-launj', name: 'Cranberry Launj', image: '80.png', price: '₹1522 / kg', maxPercentage: 100 },
  { id: 'cranberry-pista-roll', name: 'Cranberry Pista Roll', image: '81.png', price: '₹1522 / kg', maxPercentage: 100 },
  { id: 'kaju-pista-ladoo', name: 'Kaju Pista Ladoo', image: '82.png', price: '₹2007 / kg', maxPercentage: 100 },
  { id: 'kaju-huntan', name: 'Kaju Huntan', image: '83.png', price: '₹1742 / kg', maxPercentage: 100 },
  { id: 'kaju-apple', name: 'Kaju Apple', image: '84.png', price: '₹1774 / kg', maxPercentage: 100 },
  { id: 'kaju-ladoo', name: 'Kaju Ladoo', image: '85.png', price: '₹1764 / kg', maxPercentage: 100 },
  { id: 'kaju-gujia', name: 'Kaju Gujia', image: '86.png', price: '₹1764 / kg', maxPercentage: 100 },
  { id: 'kaju-kesar', name: 'Kaju Kesar', image: '87.png', price: '₹1764 / kg', maxPercentage: 100 },
  { id: 'kaju-gulkand-ladoo', name: 'Kaju Gulkand Ladoo', image: '88.png', price: '₹1853 / kg', maxPercentage: 100 },
  { id: 'chocolate-aam-papad-burfi', name: 'Chocolate Aam Papad Burfi', image: '89.png', price: '₹1059 / kg', maxPercentage: 100 },
  { id: 'pista-launj', name: 'Pista Launj', image: '90.png', price: '₹4410 / kg', maxPercentage: 100 },
  { id: 'balu-shahi', name: 'Balu Shahi', image: '91.png', price: '₹690 / kg', maxPercentage: 100 },
  { id: 'milk-cake', name: 'Milk Cake', image: '92.png', price: '₹798 / kg', maxPercentage: 100 },
  { id: 'kheer-kadam', name: 'Kheer Kadam', image: '93.png', price: '₹860 / kg', maxPercentage: 100 },
  { id: 'kheer-mohan', name: 'Kheer Mohan', image: '94.png', price: '₹574 / kg', maxPercentage: 100 },
  { id: 'khoya-badam-burfi', name: 'Khoya Badam Burfi', image: '95.png', price: '₹838 / kg', maxPercentage: 100 },
  { id: 'khoya-fruit-cake', name: 'Khoya Fruit Cake', image: '96.png', price: '₹860 / kg', maxPercentage: 100 },
  { id: 'kesar-cham-cham', name: 'Kesar Cham Cham', image: '97.png', price: '₹1275 / kg', maxPercentage: 100 }, // 51/pc
  { id: 'kas-katta', name: 'Kas Katta', image: '98.png', price: '₹1250 / kg', maxPercentage: 100 }
];


  // Update total percentage and price whenever selected ingredients change
  useEffect(() => {
    const newTotal = selectedIngredients.reduce(
      (sum, ingredient) => sum + ingredient.currentPercentage, 0
    );
    setTotalPercentage(newTotal);
    
    // Calculate and update total price
    const newPrice = calculateTotalPrice(selectedIngredients);
    setTotalPrice(newPrice);
  }, [selectedIngredients, selectedVariant]);

  // Add ingredient to recipe
  const addIngredient = (ingredient: { id: string; name: string; image: string; price: string; maxPercentage: number }) => {
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
      
      // Check if adding 10% more would exceed max percentage for selected box size
      const maxPercentage = 100 * selectedVariant.maxPercentageMultiplier;
      if (totalPercentage + 10 > maxPercentage) {
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
      // Check if adding a new ingredient would exceed max percentage for selected box size
      const maxPercentage = 100 * selectedVariant.maxPercentageMultiplier;
      if (totalPercentage + 10 > maxPercentage) {
        setAlert(`The ${containerType} is already full. Please remove something first.`);
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
  const [, setLocation] = useLocation();
  const confirmRecipe = async () => {
    const maxPercentage = 100 * selectedVariant.maxPercentageMultiplier;
    if (totalPercentage < maxPercentage) {
      setAlert(`Please fill the ${containerType} completely (${totalPercentage}/100%)`);
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    
    // Generate a random order ID for the sweet box
    const orderId = `SB${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Generate receipt content
    const date = new Date().toLocaleString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Prepare order details for API
    const orderDetails = {
      orderId,
      orderDate: new Date().toISOString(),
      boxDetails: {
        type: selectedVariant.name,
        size: selectedVariant.size,
        maxPercentageMultiplier: selectedVariant.maxPercentageMultiplier
      },
      items: selectedIngredients.map((item, index) => ({
        serialNo: index + 1,
        name: item.name,
        percentage: item.currentPercentage,
        pricePerKg: extractPrice(item.price),
        totalPrice: extractPrice(item.price) * (item.currentPercentage / 100) * selectedVariant.maxPercentageMultiplier
      })),
      totalPrice: Math.ceil(totalPrice),
      printData: {} // Will be filled after generating ESC/POS data
    };

const escpos =
  "\x1B\x40" +                     // Initialize printer
  "\x1B\x61\x31" +                 // Center align
  "🍽️  Haldiram's  🍽️\n" +
  `Order: ${orderId}\n` +
  `${date}\n` +
  "------------------------------------------------\n" +
  "\x1B\x61\x30" +                 // Left align
  `${selectedVariant.name} (${selectedVariant.size})\n` +
  "------------------------------------------------\n" +
  "Sr  Sweet Name                 %     Price\n" +
  "------------------------------------------------\n" +
  selectedIngredients.map((item, index) => {
    const price = Math.ceil(
      extractPrice(item.price) *
      (item.currentPercentage / 100) *
      selectedVariant.maxPercentageMultiplier
    );

    const srCol = (index + 1).toString().padEnd(3);                         // Sr
    const sweetCol = item.name.slice(0, 25).padEnd(25);                     // Sweet name (25)
    const percentCol = item.currentPercentage.toString().padStart(3).padEnd(6); // e.g. " 40   "
    const priceCol = (`₹${price}`).padStart(8);                             // Right aligned price

    return `${srCol}${sweetCol}${percentCol}${priceCol}\n`;
  }).join('') +
  "------------------------------------------------\n" +
  "\x1B\x61\x32" +                 // Right align
  `Total : ₹${Math.ceil(totalPrice)}\n` +
  "\x1B\x61\x31" +                 // Center again
  "Thank you! Visit again 🙏\n\n\n";


    // Add print data to order details
    orderDetails.printData = {
      rawEscpos: escpos,
      formattedText: escpos.replace(/\x1B\x40|\x1B\x61\x31|\x1B\x61\x30|\x1B\x61\x32/g, '') // Clean version for storage
    };

    // ===== DEBUG REQUEST DATA START =====
    console.log('Order Details Request:', JSON.stringify(orderDetails, null, 2));
    // ===== DEBUG REQUEST DATA END =====

    try {
      // Send order details to API
      const response = await fetch("https://sweetcounter.onrender.com/orderdetails", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails)
      });

      if (!response.ok) {
        throw new Error('Failed to save order details');
      }

      // Print receipt using RawBT
      window.location.href = `rawbt://print?data=${encodeURIComponent(escpos)}`;
      
      // Set the order ID in the store and navigate
      useVendingStore.setState({ currentOrderId: orderId });
      setLocation('/thank-you');
    } catch (error) {
      console.error('Error saving order details:', error);
      setAlert('Failed to process order. Please try again.');
      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <TabsContent value="create" className="scrollbar-hide pb-20">
      <div className="bg-white bg-opacity-5 rounded-3xl p-6 shadow-lg backdrop-blur-sm border-2 border-[#DF4530]">
        {/* Header */}
        <h3 className="text-black text-4xl font-bold mb-6 text-center">
          Create Your Own Sweet Box
        </h3>

        {/* Box Size Selection */}
        <div className="mb-8">
          <h4 className="text-black text-xl font-bold mb-4">Select Box Size</h4>
          <div className="grid grid-cols-3 gap-4">
            {boxVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => {
                  setSelectedVariant(variant);
                  setSelectedIngredients([]);
                  setTotalPercentage(0);
                }}
                className={`${
                  selectedVariant.id === variant.id
                    ? 'bg-[#DF4530] border-2 border-[#DF4530] shadow-lg text-black scale-105'
                    : 'bg-white bg-opacity-10 text-black hover:bg-opacity-20 border-2 border-[#DF4530]'
                } p-4 rounded-xl transition-all duration-300 text-center relative overflow-hidden group`}
              >
                <h5 className="text-lg font-bold mb-1 relative z-10">{variant.name}</h5>
                <p className="text-sm mb-2 relative z-10 opacity-90">{variant.size}</p>
                <p className={`${
                  selectedVariant.id === variant.id 
                    ? 'text-white font-bold text-[1.1rem]' 
                    : 'text-black  group-hover:text-urban-yellow/80 text-[1.1rem] font-bold'
                  } relative z-10 transition-colors`}>
                  {selectedVariant.id === variant.id && totalPrice > 0 
                    ? `₹${Math.ceil(totalPrice).toLocaleString('en-IN')}` 
                    : 'Price varies by selection'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Sweet Selection Carousel */}
        <div className="mb-8">
          <h4 className="text-black text-xl font-bold mb-4">Add Sweets to Your Box</h4>
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
                      className={`h-32 w-32 rounded-full flex-shrink-0 flex items-center justify-center transition-all relative overflow-hidden p-0 ${
                        isAtMax 
                          ? 'bg-gray-500/50 border-2 border-red-400' 
                          : isAdded
                            ? 'bg-[#FAC44B]/70 border-2 border-[#FAC44B]' 
                            : 'bg-[#FAC44B]/60 hover:bg-[#FAC44B]/70 border-2 border-transparent'
                      }`}
                      variant="ghost"
                    >
                      <img 
                        src={`/src/assets/${ingredient.image}`} 
                        alt={ingredient.name}
                        className={`w-full h-full object-cover p-2 ${isAtMax ? 'opacity-60' : ''}`}
                      />
                      {isAtMax ? (
                        <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm ${isMaxIngredient ? 'animate-pulse' : ''}`}>
                          <div className="bg-red-500 text-white px-2 py-1 rounded-md font-bold text-xs transform rotate-12">
                            MAX
                          </div>
                        </div>
                      ) : (
                        isAdded && (
                          <div className="absolute top-0 right-0 w-8 h-8 bg-urban-yellow text-black rounded-full flex items-center justify-center">
                            {/* Plus icon removed as requested */}
                          </div>
                        )
                      )}
                    </Button>
                    <div className="flex flex-col items-center text-center max-w-[140px]">
                      <span className="text-black text-sm font-medium font-bold">{ingredient.name}</span>
                      <span className="text-black text-medium font-bold">{ingredient.price}</span>
                      {isAdded && (
                        <span className={`text-xs ${isAtMax ? 'text-red-400 font-bold' : 'text-black font bold'}`}>
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
        
        {/* Main Content Area */}
        <div className="grid md:grid-cols-2 gap-6 w-full min-h-[630px] overflow-hidden">
          {/* Box Visualization (Moved from right to left) */}
          <div className=" rounded-2xl p-5 flex flex-col items-center justify-center relative h-[630px] border-2 border-[#DF4530]">
            {/* Box Visualization */}
            <div className="relative w-full mt-4 max-w-[350px]">
              <div className="w-full flex items-end justify-center relative">
                {/* Box Image */}
                <div className="relative w-full max-w-[350px] h-[450px]">
                  <img 
                    src={boxImage} 
                    alt="Sweet Box" 
                    className="w-full h-full object-contain absolute top-0 left-0 z-10"
                  />
                </div>
              </div>
            </div>
            
            {/* Percentage display on box */}
            <div className="mt-2 text-center">
              <div className="text-black text-2xl font-bold">
                {Math.min(100, (totalPercentage / (100 * selectedVariant.maxPercentageMultiplier)) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-black/70">
                {(totalPercentage * 10).toFixed(0)} / {1000 * selectedVariant.maxPercentageMultiplier} grams
              </div>
            </div>
          </div>

          {/* Ingredient List (Moved from left to right) */}
          <div className="bg-white bg-opacity-10 rounded-2xl p-5 flex flex-col h-[630px]">
            <h4 className="text-black text-2xl font-bold mb-4">
              {selectedIngredients.length > 0 ? "Your Selection" : "Pick Sweets"}
            </h4>
            
            {selectedIngredients.length > 0 ? (
              <div className="space-y-3 flex-grow max-h-[460px] overflow-y-auto pr-2">
                {selectedIngredients.map(ingredient => (
                  <div 
                    key={ingredient.id}
                    className="bg-[#DF4530] rounded-xl p-3 flex items-center justify-between shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={`/src/assets/${ingredient.image}`} 
                        alt={ingredient.name}
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <p className="text-white text-xl font-semibold">{ingredient.name}</p>
                        <p className="text-urban-yellow">{ingredient.currentPercentage}%</p>
                        <p className="text-white/90 text-sm">{ingredient.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ingredient.currentPercentage > 10 ? (
                        <Button
                          onClick={() => decreaseIngredient(ingredient.id)}
                          className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 p-1 flex items-center justify-center"
                          variant="ghost"
                        >
                          <Minus className="w-5 h-5 text-white" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => removeIngredient(ingredient.id)}
                          className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 p-1 flex items-center justify-center"
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
                <p className="text-black text-xl opacity-70 text-center">
                  Add sweets from below to start creating your sweet box
                </p>
              </div>
            )}
            
            {/* Fill percentage indicator */}
            <div className="mt-6 mb-2">
              <div className="flex justify-between text-black mb-1">
                <p>Box Fill Level</p>
                <p>{Math.min(100, (totalPercentage / (100 * selectedVariant.maxPercentageMultiplier)) * 100).toFixed(0)}%</p>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-4">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${Math.min(100, (totalPercentage / (100 * selectedVariant.maxPercentageMultiplier)) * 100)}%`, 
                    transition: 'width 0.3s ease',
                    backgroundColor: '#DF4530'
                  }}
                ></div>
              </div>
              <div className="mt-1 text-sm text-black/70 text-right">
                {(totalPercentage * 10).toFixed(0)} / {1000 * selectedVariant.maxPercentageMultiplier} grams
              </div>
            </div>
          </div>
          

        </div>
        

        
        {/* Main Action Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={confirmRecipe}
            disabled={totalPercentage < (100 * selectedVariant.maxPercentageMultiplier)}
            className={`text-2xl font-bold py-8 px-12 rounded-2xl shadow-xl transform transition-all duration-200 ${
              totalPercentage >= (100 * selectedVariant.maxPercentageMultiplier) 
                ? 'text-white hover:scale-105 hover:shadow-2xl' 
                : 'bg-white/20 text-black border-2 border-[#DF4530]'
            }`}
            style={{
              backgroundColor: totalPercentage >= (100 * selectedVariant.maxPercentageMultiplier) ? '#DF4530' : 'transparent'
            }}
          >
            {totalPercentage >= (100 * selectedVariant.maxPercentageMultiplier) 
              ? 'Create Sweet Box' 
              : `Fill the ${selectedVariant.name} (${Math.min(100, (totalPercentage / (100 * selectedVariant.maxPercentageMultiplier)) * 100).toFixed(0)}%)`}
          </Button>
        </div>
        
        {/* Alert Message */}
        {alert && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black/90 text-white px-10 py-6 rounded-2xl flex items-center gap-4 shadow-2xl animate-in fade-in zoom-in duration-300 border-2 border-urban-yellow max-w-md">
              <AlertCircle className="text-urban-yellow w-8 h-8 flex-shrink-0" />
              <p className="text-2xl font-medium">{alert}</p>
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  );
}