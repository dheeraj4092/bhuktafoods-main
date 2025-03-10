import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          <Link 
            to="/" 
            className={cn(
              "text-sm font-medium transition-colors",
              location.pathname === "/" ? "text-food-accent" : "text-foreground hover:text-food-accent"
            )}
          >
            Home
          </Link>
          <Link 
            to="/products?category=snacks" 
            className={cn(
              "text-sm font-medium transition-colors",
              location.pathname.includes("/products") && location.search.includes("category=snacks") 
                ? "text-food-snack" 
                : "text-foreground hover:text-food-snack"
            )}
          >
            Traditional Snacks
          </Link>
          <Link 
            to="/products?category=fresh" 
            className={cn(
              "text-sm font-medium transition-colors",
              location.pathname.includes("/products") && location.search.includes("category=fresh") 
                ? "text-food-fresh" 
                : "text-foreground hover:text-food-fresh"
            )}
          >
            Fresh Foods
          </Link>
          <Link 
            to="/cart" 
            className={cn(
              "text-sm font-medium transition-colors relative",
              location.pathname === "/cart" ? "text-primary" : "text-foreground hover:text-primary"
            )}
          >
            Cart
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
          <Link 
            to="/subscription" 
            className={cn(
              "text-sm font-medium transition-colors",
              location.pathname === "/subscription" ? "text-primary" : "text-foreground hover:text-primary"
            )}
          >
            Subscriptions
          </Link>
        </nav>

        {/* Header Actions */}
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
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={20} className="text-primary" />
            ) : (
              <Menu size={20} className="text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg animate-slide-down">
          <nav className="flex flex-col p-6 space-y-4">
            <Link 
              to="/" 
              className={cn(
                "text-base font-medium transition-colors py-2",
                location.pathname === "/" ? "text-food-accent" : "text-foreground"
              )}
            >
              Home
            </Link>
            <Link 
              to="/products?category=snacks" 
              className={cn(
                "text-base font-medium transition-colors py-2",
                location.pathname.includes("/products") && location.search.includes("category=snacks") 
                  ? "text-food-snack" 
                  : "text-foreground"
              )}
            >
              Traditional Snacks
            </Link>
            <Link 
              to="/products?category=fresh" 
              className={cn(
                "text-base font-medium transition-colors py-2",
                location.pathname.includes("/products") && location.search.includes("category=fresh") 
                  ? "text-food-fresh" 
                  : "text-foreground"
              )}
            >
              Fresh Foods
            </Link>
            <Link 
              to="/cart" 
              className={cn(
                "text-base font-medium transition-colors py-2 relative",
                location.pathname === "/cart" ? "text-primary" : "text-foreground"
              )}
            >
              Cart
              {items.length > 0 && (
                <span className="absolute top-1/2 -translate-y-1/2 right-0 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            <Link 
              to="/subscription" 
              className={cn(
                "text-base font-medium transition-colors py-2",
                location.pathname === "/subscription" ? "text-primary" : "text-foreground"
              )}
            >
              Subscriptions
            </Link>
            <hr className="border-border" />
            {user ? (
              <>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/profile">
                    <User size={16} className="mr-2" />
                    My Profile
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/auth">
                  <LogIn size={16} className="mr-2" />
                  Sign In / Register
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
