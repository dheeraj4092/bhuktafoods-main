import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { getProductImageUrl, DEFAULT_PRODUCT_IMAGE } from "@/lib/image-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Add Supabase URL constant
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Import default image
import defaultProductImage from '@/assets/default-product.svg';

// Add default image URL - first try remote, fallback to local
const DEFAULT_IMAGE = defaultProductImage;

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  image_url?: string;
  category: "snacks" | "fresh" | "pickles-veg" | "pickles-nonveg" | "sweets" | "instant-premix" | "podi";
  isAvailable: boolean;
  isPreOrder?: boolean;
  deliveryEstimate?: string;
  className?: string;
}

const ProductCard = ({
  id,
  name,
  description,
  price,
  image,
  image_url,
  category,
  isAvailable,
  isPreOrder = false,
  deliveryEstimate,
  className,
}: ProductProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState<"250g" | "500g" | "1Kg">("250g");
  const { addItem, items } = useCart();
  
  // Initialize product state with props
  const [product, setProduct] = useState({
    id,
    name,
    description,
    price,
    image,
    image_url,
    category,
    isAvailable,
    isPreOrder,
    deliveryEstimate
  });
  
  // Update product state when props change
  useEffect(() => {
    setProduct({
      id,
      name,
      description,
      price,
      image,
      image_url,
      category,
      isAvailable,
      isPreOrder,
      deliveryEstimate
    });
  }, [id, name, description, price, image, image_url, category, isAvailable, isPreOrder, deliveryEstimate]);
  
  // Get the image URL using the shared utility and product state
  const imageUrl = getProductImageUrl(product.image_url || product.image);
  
  const isInCart = items.some(item => 
    item.productId === product.id && item.quantityUnit === selectedQuantity
  );
  
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
  
  const calculatePrice = (unit: "250g" | "500g" | "1Kg") => {
    switch (unit) {
      case "250g":
        return price;
      case "500g":
        return price * 2;
      case "1Kg":
        return price * 4 * 0.9; // 10% discount for 1Kg
      default:
        return price;
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.isAvailable) {
      toast({
        title: "Product unavailable",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    
    if (isAdding) return;
    
    setIsAdding(true);
    
    try {
      await addItem({
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: calculatePrice(selectedQuantity),
        basePrice: price,
        quantity: 1,
        quantityUnit: selectedQuantity,
        category: product.category as "snacks" | "fresh",
        image: product.image_url || product.image // Use image_url if available, otherwise fall back to image
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} (${selectedQuantity}) has been added to your cart.`,
      });

      // Show success state for 2 seconds
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the add to cart button or quantity selector
    if (
      e.target instanceof Element && 
      (e.target.closest('button') || 
       e.target.closest('[role="combobox"]'))
    ) {
      e.preventDefault();
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      onClick={handleCardClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl flex flex-col bg-white border border-border transition-all duration-300",
        "hover:shadow-lg hover:border-transparent transform hover:-translate-y-1",
        !product.isAvailable && "opacity-70",
        className
      )}
    >
      {/* Category Tag */}
      <div className={cn(
        "absolute top-2 sm:top-4 left-2 sm:left-4 z-10 py-1 px-2 sm:px-3 text-xs font-medium rounded-full",
        product.category === "snacks" 
          ? "bg-food-snack/10 text-food-snack"
          : product.category === "fresh"
          ? "bg-food-fresh/10 text-food-fresh"
          : product.category === "pickles-veg"
          ? "bg-green-100 text-green-800"
          : product.category === "pickles-nonveg"
          ? "bg-red-100 text-red-800"
          : product.category === "sweets"
          ? "bg-yellow-100 text-yellow-800"
          : product.category === "instant-premix"
          ? "bg-blue-100 text-blue-800"
          : "bg-purple-100 text-purple-800"
      )}>
        {product.category === "snacks" ? "Traditional" 
          : product.category === "fresh" ? "Fresh"
          : product.category === "pickles-veg" ? "Veg Pickles"
          : product.category === "pickles-nonveg" ? "Non-Veg Pickles"
          : product.category === "sweets" ? "Sweets"
          : product.category === "instant-premix" ? "Instant Pre-mix"
          : "Podi"}
      </div>
      
      {/* Pre-order Badge */}
      {product.isPreOrder && product.isAvailable && (
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 py-1 px-2 sm:px-3 bg-food-accent/10 text-food-accent text-xs font-medium rounded-full">
          Pre-order
        </div>
      )}
      
      {/* Out of Stock Badge */}
      {!product.isAvailable && (
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 py-1 px-2 sm:px-3 bg-muted text-muted-foreground text-xs font-medium rounded-full">
          Out of Stock
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <img
          src={imageUrl}
          alt={product.name}
          className={cn(
            "object-cover w-full h-full transition-opacity duration-300",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => setIsImageLoaded(true)}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            console.error('Error loading image:', {
              url: imageUrl,
              originalPath: product.image_url || product.image
            });
            const img = e.currentTarget;
            img.src = DEFAULT_PRODUCT_IMAGE;
            setIsImageLoaded(true);
          }}
        />
      </div>
      
      {/* Content */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-medium text-base sm:text-lg text-foreground">{product.name}</h3>
        <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        
        {/* Delivery Estimate (only for fresh) */}
        {product.category === "fresh" && product.deliveryEstimate && (
          <p className="mt-2 sm:mt-3 text-xs font-medium text-food-fresh">
            {product.isPreOrder ? "Pre-order for " : "Delivery in "}{product.deliveryEstimate}
          </p>
        )}
        
        {/* Price and Add Button */}
        <div className="mt-auto pt-3 sm:pt-4 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="font-medium text-sm sm:text-base">{formattedPrice}</span>
            <Select
              value={selectedQuantity}
              onValueChange={(value: "250g" | "500g" | "1Kg") => setSelectedQuantity(value)}
            >
              <SelectTrigger className="w-[80px] sm:w-[100px] h-8 sm:h-10">
                <SelectValue placeholder="Qty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="250g">250g</SelectItem>
                <SelectItem value="500g">500g</SelectItem>
                <SelectItem value="1Kg">1Kg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {selectedQuantity === "500g" && "2x price"}
              {selectedQuantity === "1Kg" && "4x price with 10% discount"}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={!product.isAvailable || isAdding}
              className={cn(
                "relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300",
                product.isAvailable && !isAdding
                  ? "bg-primary text-white hover:bg-primary/90" 
                  : isAdding || showSuccess
                    ? "bg-food-fresh text-white" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              aria-label={isAdding || showSuccess ? "Added to cart" : "Add to cart"}
            >
              {isAdding ? (
                <span className="h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-white rounded-full animate-spin" />
              ) : showSuccess ? (
                <Check size={16} className="sm:size-18" />
              ) : (
                <Plus size={16} className="sm:size-18" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;