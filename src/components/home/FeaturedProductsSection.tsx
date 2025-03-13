import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/ProductCard";
import { useState, useEffect } from "react";

const FeaturedProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products/featured?limit=4');
        if (!response.ok) throw new Error('Failed to fetch featured products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);
  
  if (loading) {
    return (
      <section className="py-16 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading featured products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading featured products</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-16 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-medium mb-4 animate-fade-in">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl animate-fade-in animate-delay-200">
              Our most popular items that customers love. From crunchy traditional snacks to refreshing fruit-infused treats.
            </p>
          </div>
          <Button asChild variant="ghost" className="animate-fade-in animate-delay-300">
            <Link to="/products">
              View all products <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-4 gap-6 animate-fade-in animate-delay-400">
          {products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              image={product.image_url}
              category={product.category}
              isAvailable={product.stock_quantity > 0}
              isPreOrder={product.stock_quantity === 0}
              deliveryEstimate={product.delivery_estimate}
              className={`animate-fade-in animate-delay-${(index + 4) * 100}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
