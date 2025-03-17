import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, LogIn, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import NavigationMenuComponent from "./NavigationMenu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { items } = useCart();
  const { user } = useAuth();
  
  const itemCount = items.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <NavigationMenuComponent />
            
            <Link 
              to="/" 
              className="text-base sm:text-lg md:text-xl font-semibold tracking-tight flex items-center transform transition-transform hover:scale-[1.02]"
            >
              <span className="bg-gradient-to-r from-food-accent to-primary bg-clip-text text-transparent">
                Bhukta Foods
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="p-1.5 rounded-full hover:bg-secondary/50 transition-colors"
                  title="Profile"
                >
                  <User size={18} className="text-muted-foreground hover:text-primary transition-colors" />
                </Link>
                <Link 
                  to="/orders" 
                  className="p-1.5 rounded-full hover:bg-secondary/50 transition-colors"
                  title="Orders"
                >
                  <Package size={18} className="text-muted-foreground hover:text-primary transition-colors" />
                </Link>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="p-1.5 rounded-full hover:bg-secondary/50 transition-colors"
                title="Login"
              >
                <LogIn size={18} className="text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            )}
            
            <Link 
              to="/cart" 
              className="p-1.5 rounded-full hover:bg-secondary/50 transition-colors relative"
              title="Cart"
            >
              <ShoppingCart size={18} className="text-muted-foreground hover:text-primary transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-food-accent text-white text-xs font-medium rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-scale-in">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
