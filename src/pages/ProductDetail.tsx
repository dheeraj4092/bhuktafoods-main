import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Truck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/ui/FloatingCart";
import { useCart } from "@/context/CartContext";

const ProductDetail = () => {
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      ...product,
      quantity
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
    });
  };
  
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading product details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-medium mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">Sorry, the product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/products">
              <ArrowLeft size={16} className="mr-2" /> Back to products
            </Link>
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {/* Product Image */}
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-medium">{product.name}</h1>
                <p className="mt-2 text-muted-foreground">{product.description}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-2xl font-medium">₹{product.price.toFixed(2)}</span>
                {product.stock_quantity > 0 ? (
                  <span className="text-sm text-green-600">In Stock</span>
                ) : (
                  <span className="text-sm text-orange-600">Pre-order Available</span>
                )}
              </div>
              
              {product.ingredients && (
                <div>
                  <h3 className="font-medium mb-2">Ingredients</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {product.ingredients.map((ingredient, idx) => (
                      <li key={idx}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Quantity selector and Add to Cart */}
              {product.stock_quantity > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center">
                    <span className="mr-4">Quantity</span>
                    <div className="flex items-center border border-input rounded-md">
                      <button 
                        onClick={decrementQuantity}
                        className="px-3 py-1 border-r border-input"
                      >
                        -
                      </button>
                      <span className="px-4 py-1">{quantity}</span>
                      <button 
                        onClick={incrementQuantity}
                        className="px-3 py-1 border-l border-input"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart} 
                    size="lg" 
                    className="w-full"
                  >
                    Add to Cart
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <FloatingCart />
    </div>
  );
};

export default ProductDetail;
