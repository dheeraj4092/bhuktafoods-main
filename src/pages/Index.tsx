
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/ui/FloatingCart";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import SubscriptionCTA from "@/components/home/SubscriptionCTA";
import TestimonialsSection from "@/components/home/TestimonialsSection";
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <HowItWorksSection />
      <SubscriptionCTA />
      <TestimonialsSection />
      <InstagramFeedSection />
      
      <Footer />
      <FloatingCart />
    </div>
  );
};

export default Index;
