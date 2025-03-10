
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/ProductCard";
import { PRODUCTS } from "@/lib/utils";

const FeaturedProductsSection = () => {
  // Featured products (show 4 of them)
  const featuredProducts = PRODUCTS.filter(product => product.isAvailable).slice(0, 4);
  
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in animate-delay-400">
          {featuredProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              className={`animate-fade-in animate-delay-${(index + 4) * 100}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
