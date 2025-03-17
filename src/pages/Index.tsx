import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/ui/FloatingCart";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import SubscriptionCTA from "@/components/home/SubscriptionCTA";
import InfiniteMovingCardsDemo from "@/components/infinite-moving-cards-demo";
import InstagramFeedSection from "@/components/home/InstagramFeedSection";
import { useCart } from "@/context/CartContext";

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { items } = useCart();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Background Logo */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="https://topikrqamdglxakppbyg.supabase.co/storage/v1/object/public/product-images//logo.png" 
            alt="Background Logo" 
            className="w-[500px] h-[500px] object-contain"
          />
        </div>
      </div>

      <Header />
      
      <main className="flex-grow relative z-10">
        <div className="space-y-8 sm:space-y-12">
          <HeroSection />
          
          <section className="container mx-auto px-3 sm:px-4 lg:px-6">
            <CategoriesSection />
          </section>
          
          <section className="container mx-auto px-3 sm:px-4 lg:px-6">
            <FeaturedProductsSection />
          </section>
          
          <section className="container mx-auto px-3 sm:px-4 lg:px-6">
            <HowItWorksSection />
          </section>
          
          <section className="container mx-auto px-3 sm:px-4 lg:px-6">
            <SubscriptionCTA />
          </section>
          
          <section className="container mx-auto px-3 sm:px-4 lg:px-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">What Our Customers Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
                Discover why food lovers choose Bhukta Foods for authentic Indian cuisine
              </p>
            </div>
            <InfiniteMovingCardsDemo />
          </section>
          
          <section className="container mx-auto px-3 sm:px-4 lg:px-6">
            <InstagramFeedSection />
          </section>
        </div>
      </main>
      
      <Footer />
      <FloatingCart />
    </div>
  );
};

export default Index;
