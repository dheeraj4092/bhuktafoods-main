import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "snacks" | "fresh";
  isAvailable: boolean;
  isPreOrder?: boolean;
  deliveryEstimate?: string;
  className?: string; // Add this line to support the className prop
}

const ProductCard = ({
  id,
  name,
  description,
  price,
  image,
  category,
  isAvailable,
  isPreOrder = false,
  deliveryEstimate,
  className,
}: ProductProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, items } = useCart();
  
  const isInCart = items.some(item => item.id === id);
  
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAvailable) return;
    
    setIsAdding(true);
    setTimeout(() => {
      addItem({
        id,
        name,
        price,
        image,
        quantity: 1,
        category,
      });
      setIsAdding(false);
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
      });
    }, 300);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl flex flex-col bg-white border border-border transition-all duration-300",
        "hover:shadow-lg hover:border-transparent transform hover:-translate-y-1",
        !isAvailable && "opacity-70",
        className
      )}
    >
      {/* Category Tag */}
      <div className={cn(
        "absolute top-4 left-4 z-10 py-1 px-3 text-xs font-medium rounded-full",
        category === "snacks" 
          ? "bg-food-snack/10 text-food-snack"
          : "bg-food-fresh/10 text-food-fresh"
      )}>
        {category === "snacks" ? "Traditional" : "Fresh"}
      </div>
      
      {/* Pre-order Badge */}
      {isPreOrder && isAvailable && (
        <div className="absolute top-4 right-4 z-10 py-1 px-3 bg-food-accent/10 text-food-accent text-xs font-medium rounded-full">
          Pre-order
        </div>
      )}
      
      {/* Out of Stock Badge */}
      {!isAvailable && (
        <div className="absolute top-4 right-4 z-10 py-1 px-3 bg-muted text-muted-foreground text-xs font-medium rounded-full">
          Out of Stock
        </div>
      )}
      
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-secondary loading-shimmer" />
        )}
        <img
          src={image}
          alt={name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700 ease-out",
            "group-hover:scale-105",
            !isImageLoaded && "opacity-0",
            isImageLoaded && "opacity-100"
          )}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      
      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-medium text-lg text-foreground">{name}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{description}</p>
        
        {/* Delivery Estimate (only for fresh) */}
        {category === "fresh" && deliveryEstimate && (
          <p className="mt-3 text-xs font-medium text-food-fresh">
            {isPreOrder ? "Pre-order for " : "Delivery in "}{deliveryEstimate}
          </p>
        )}
        
        {/* Price and Add Button */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-medium">{formattedPrice}</span>
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable || isInCart}
            className={cn(
              "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
              isAvailable && !isInCart 
                ? "bg-primary text-white hover:bg-primary/90" 
                : isInCart 
                  ? "bg-food-fresh text-white" 
                  : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            aria-label={isInCart ? "Added to cart" : "Add to cart"}
          >
            {isAdding ? (
              <span className="h-5 w-5 border-t-2 border-white rounded-full animate-spin" />
            ) : isInCart ? (
              <Check size={18} />
            ) : (
              <Plus size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
