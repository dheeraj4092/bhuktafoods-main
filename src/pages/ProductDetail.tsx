import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Truck, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/ui/FloatingCart";
import { useCart } from "@/context/CartContext";
import defaultProductImage from '@/assets/default-product.svg';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const DEFAULT_IMAGE = defaultProductImage;

const ProductDetail = () => {
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedQuantity, setSelectedQuantity] = useState<"250g" | "500g" | "1Kg">("250g");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { addItem } = useCart();

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) {
      return DEFAULT_IMAGE;
    }
    
    if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
      return imagePath;
    }
    
    try {
      const cleanPath = imagePath.replace(/^\/+/, '').trim();
      return `${SUPABASE_URL}/storage/v1/object/public/product-images/${cleanPath}`;
    } catch (error) {
      console.error('Error constructing image URL:', error);
      return DEFAULT_IMAGE;
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with ID:', productId);
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Product data received:', data);
        
        if (!data) {
          throw new Error('No product data received');
        }
        
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
  
  const calculatePrice = (unit: "250g" | "500g" | "1Kg") => {
    if (!product) return 0;
    switch (unit) {
      case "250g":
        return product.price;
      case "500g":
        return product.price * 2;
      case "1Kg":
        return product.price * 4 * 0.9; // 10% discount for 1Kg
      default:
        return product.price;
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: calculatePrice(selectedQuantity),
      basePrice: product.price,
      image: product.image_url,
      quantity,
      quantityUnit: selectedQuantity,
      category: product.category,
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} (${selectedQuantity}) added to your cart`,
    });
  };
  
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">Error Loading Product</h2>
            <p className="text-muted-foreground mb-4">{error || "Product not found"}</p>
            <Button asChild>
              <Link to="/products">Back to Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Button asChild variant="ghost" className="mb-8">
            <Link to="/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                {!isImageLoaded && (
                  <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
                <img
                  src={getImageUrl(product.image_url || product.image)}
                  alt={product.name}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    !isImageLoaded && "opacity-0",
                    isImageLoaded && "opacity-100"
                  )}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={(e) => {
                    console.error('Error loading image:', {
                      url: product.image_url || product.image,
                      originalPath: product.image_url || product.image
                    });
                    const img = e.target as HTMLImageElement;
                    img.src = DEFAULT_IMAGE;
                    setIsImageLoaded(true);
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <img
                  src={getImageUrl(product.image_url || product.image)}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                />
                {/* Add more product images here if available */}
              </div>
            </div>

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
                  <div className="flex items-center gap-4">
                    <span>Quantity</span>
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

                  <div className="flex items-center gap-4">
                    <span>Unit</span>
                    <Select
                      value={selectedQuantity}
                      onValueChange={(value: "250g" | "500g" | "1Kg") => setSelectedQuantity(value)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="250g">250g</SelectItem>
                        <SelectItem value="500g">500g</SelectItem>
                        <SelectItem value="1Kg">1Kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {selectedQuantity === "500g" && "2x price"}
                    {selectedQuantity === "1Kg" && "4x price with 10% discount"}
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart} 
                    size="lg" 
                    className="w-full"
                  >
                    Add to Cart - ₹{calculatePrice(selectedQuantity).toFixed(2)}
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
