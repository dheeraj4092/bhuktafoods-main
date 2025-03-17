import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { FlipWords } from "@/components/ui/flip-words";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const words = ["goodness", "delights", "treats", "flavors", "traditions"];

  return (
    <section className="pt-32 pb-20 px-6 lg:px-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-row items-center gap-16">
          <div className={`w-1/2 space-y-6 text-left ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <span className="inline-block py-1 px-3 text-xs font-medium bg-food-fresh/10 text-food-fresh rounded-full">
              Authentic & Fresh
            </span>
            <h1 className="text-6xl font-medium leading-tight">
              Homemade{" "}
              <FlipWords words={words} className="text-food-fresh"/>{" "}
              <br /> delivered to your door
            </h1>
            <p className="text-lg max-w-xl">
              Traditional snacks and fresh healthy meals prepared with love, delivered across India and worldwide.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Link to="/products">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-6 py-2"
                >
                  <span>View All Products</span>
                  <ArrowRight size={16} />
                </HoverBorderGradient>
              </Link>
            </div>
          </div>
          <div className={`w-1/2 relative ${isLoaded ? 'animate-fade-in animate-delay-300' : 'opacity-0'}`}>
            <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl transform rotate-2 max-w-[70%] mx-auto">
              <img 
                src="https://topikrqamdglxakppbyg.supabase.co/storage/v1/object/public/product-images//logo.png" 
                alt="Traditional Indian Snack" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-food-fresh/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-food-snack/5 rounded-full blur-3xl -z-10" />
    </section>
  );
};

export default HeroSection;
