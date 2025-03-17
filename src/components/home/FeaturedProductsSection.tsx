import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/ProductCard";
import { PRODUCTS } from "@/lib/utils";

const FeaturedProductsSection = () => {
  const featuredProducts = PRODUCTS.filter(product => product.isAvailable).slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextProduct = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevProduct = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const getAdjacentIndex = (offset: number) => {
    return (currentIndex + offset + featuredProducts.length) % featuredProducts.length;
  };

  return (
    <section className="py-16 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-medium mb-4 animate-fade-in">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl animate-fade-in animate-delay-200">
              Our most popular items that customers love. From crunchy traditional snacks to refreshing fruit-infused treats.
            </p>
          </div>
          <Button asChild variant="ghost" className="self-start md:self-auto animate-fade-in animate-delay-300">
            <Link to="/products">
              View all products <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
        
        <div className="relative h-[500px] animate-fade-in animate-delay-400">
          {/* Previous Product Preview */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[200px] opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={prevProduct}
          >
            <ProductCard 
              {...featuredProducts[getAdjacentIndex(-1)]} 
              className="scale-90"
            />
          </div>

          {/* Current Product */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] z-10">
            <ProductCard 
              {...featuredProducts[currentIndex]} 
              className="scale-100 shadow-xl"
            />
          </div>

          {/* Next Product Preview */}
          <div 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[200px] opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={nextProduct}
          >
            <ProductCard 
              {...featuredProducts[getAdjacentIndex(1)]} 
              className="scale-90"
            />
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "bg-primary w-4" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;