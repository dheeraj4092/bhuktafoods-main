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
        <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 lg:px-8">
          {/* Left side - Navigation Menu */}
          <div className="flex items-center">
            <NavigationMenuComponent />
          </div>

          {/* Center - Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link 
              to="/" 
              className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight flex items-center transform transition-transform hover:scale-[1.02]"
            >
              <span className="bg-gradient-to-r from-food-accent to-primary bg-clip-text text-transparent">
                Bhukta Foods
              </span>
            </Link>
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-secondary/50 transition-colors"
                  title="Profile"
                >
                  <User size={18} className="text-muted-foreground" />
                  <span className="hidden sm:inline text-sm text-muted-foreground hover:text-primary transition-colors">
                    Profile
                  </span>
                </Link>
                <Link 
                  to="/orders" 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-secondary/50 transition-colors"
                  title="Orders"
                >
                  <Package size={18} className="text-muted-foreground" />
                  <span className="hidden sm:inline text-sm text-muted-foreground hover:text-primary transition-colors">
                    Orders
                  </span>
                </Link>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-secondary/50 transition-colors"
                title="Login"
              >
                <LogIn size={18} className="text-muted-foreground" />
                <span className="hidden sm:inline text-sm text-muted-foreground hover:text-primary transition-colors">
                  Login
                </span>
              </Link>
            )}
            
            <Link 
              to="/cart" 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-secondary/50 transition-colors relative"
              title="Cart"
            >
              <ShoppingCart size={18} className="text-muted-foreground" />
              <span className="hidden sm:inline text-sm text-muted-foreground hover:text-primary transition-colors">
                Cart
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-food-accent text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
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
