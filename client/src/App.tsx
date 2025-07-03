import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import WelcomePage from "@/pages/welcome";
import SelectionPage from "@/pages/selection";
import ItemsPage from "@/pages/items";
import CustomizationPage from "@/pages/customization";
import PaymentPage from "@/pages/payment";
import ProcessingPage from "@/pages/processing";
import ThankYouPage from "@/pages/thank-you";

function Router() {
  return (
    <div className="app-container w-full h-screen max-w-2xl mx-auto relative overflow-hidden">
      <Switch>
        <Route path="/" component={WelcomePage} />
        <Route path="/selection" component={SelectionPage} />
        <Route path="/items" component={ItemsPage} />
        <Route path="/customization" component={CustomizationPage} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/processing" component={ProcessingPage} />
        <Route path="/thank-you" component={ThankYouPage} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
