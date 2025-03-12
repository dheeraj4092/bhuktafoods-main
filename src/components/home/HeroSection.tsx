import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className={`w-full lg:w-1/2 space-y-4 sm:space-y-6 text-center lg:text-left ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <span className="inline-block py-1 px-3 text-xs font-medium bg-food-fresh/10 text-food-fresh rounded-full">
              Authentic & Fresh
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight">
              Homemade goodness, <br className="hidden sm:block" /> delivered to your door
            </h1>
            <p className="text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
              Traditional snacks and fresh healthy meals prepared with love, delivered across India and worldwide.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto px-6 font-medium rounded-full">
                <Link to="/products?category=snacks">
                  Explore Traditional Snacks <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto px-6 font-medium rounded-full">
                <Link to="/products?category=fresh">
                  Browse Fresh Foods <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
          <div className={`w-full lg:w-1/2 relative mt-8 lg:mt-0 ${isLoaded ? 'animate-fade-in animate-delay-300' : 'opacity-0'}`}>
            <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl transform lg:rotate-2 max-w-[80%] sm:max-w-[70%] mx-auto">
              <img 
                src="https://topikrqamdglxakppbyg.supabase.co/storage/v1/object/public/product-images//logo.png" 
                alt="Traditional Indian Snack" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl overflow-hidden shadow-xl transform -rotate-6 hidden lg:block animate-float">
              <img 
                src="https://topikrqamdglxakppbyg.supabase.co/storage/v1/object/public/product-images//indian-old-woman-making-cooking-260nw-2197321177.webp" 
                alt="Fresh fruits" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-2xl overflow-hidden shadow-xl transform rotate-12 hidden lg:block animate-float animate-delay-500">
              <img 
                src="https://images.unsplash.com/photo-1570696516188-ade861b84a49?q=80&w=2940&auto=format&fit=crop" 
                alt="Healthy breakfast" 
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
