import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, LogIn } from "lucide-react";
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
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 py-4 px-6 lg:px-10",
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-xl font-medium tracking-tight flex items-center transform transition-transform hover:scale-[1.02]"
        >
          <span>Bhukta Foods</span>
        </Link>

        <nav className="flex items-center space-x-10">
          <NavigationMenuComponent />
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <Link to="/profile" className="p-2 rounded-full hover:bg-secondary transition-colors">
              <User size={20} className="text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          ) : (
            <Link to="/auth" className="p-2 rounded-full hover:bg-secondary transition-colors">
              <LogIn size={20} className="text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          )}
          
          <Link to="/cart" className="p-2 rounded-full hover:bg-secondary transition-colors relative">
            <ShoppingCart size={20} className="text-muted-foreground hover:text-primary transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-food-accent text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
