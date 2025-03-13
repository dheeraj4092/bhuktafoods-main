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
      
      <main className="flex-grow">
        <div className="space-y-24 sm:space-y-32">
          <HeroSection />
          
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <CategoriesSection />
          </section>
          
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FeaturedProductsSection />
          </section>
          
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <HowItWorksSection />
          </section>
          
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SubscriptionCTA />
          </section>
          
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <TestimonialsSection />
          </section>
          
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
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
