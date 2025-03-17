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

  const words = ["delights", "treats", "flavors", "traditions","goodness"];

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background decorative elements */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-food-fresh/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-food-snack/5 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-16 sm:py-20 lg:py-32">
          {/* Text Content */}
          <div className={`w-full lg:w-1/2 space-y-6 text-center lg:text-left ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <span className="inline-block py-1.5 px-4 text-sm font-medium bg-food-fresh/10 text-food-fresh rounded-full">
              Authentic & Fresh
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight">
              Homemade{" "}
              <FlipWords words={words} className="text-food-fresh"/>{" "}
              <br /> delivered to your door
            </h1>
            <p className="text-base sm:text-lg max-w-xl mx-auto lg:mx-0 text-gray-700 dark:text-gray-300">
              Traditional snacks and fresh healthy meals prepared with love, delivered across India and worldwide.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
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

          {/* Image */}
          <div className={`w-full lg:w-1/2 relative ${isLoaded ? 'animate-fade-in animate-delay-300' : 'opacity-0'}`}>
            <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl transform rotate-2 max-w-[80%] sm:max-w-[70%] mx-auto">
              <img 
                src="https://topikrqamdglxakppbyg.supabase.co/storage/v1/object/public/product-images//logo.png" 
                alt="Traditional Indian Snack" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
