
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const FloatingCart = () => {
  const { items, totalPrice } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const itemCount = items.length;
  
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(totalPrice);

  useEffect(() => {
    if (itemCount > 0) {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [itemCount]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
      <Link
        to="/cart"
        className={cn(
          "flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-full",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          "hover:bg-primary/90 transform hover:-translate-y-1",
          isAnimating && "animate-bounce"
        )}
      >
        <ShoppingBag size={20} />
        <span className="font-medium">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
        <div className="w-px h-5 bg-white/20 mx-1" />
        <span className="font-medium">{formattedPrice}</span>
      </Link>
    </div>
  );
};

export default FloatingCart;
