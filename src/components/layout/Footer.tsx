import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-food-light/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-food-accent to-primary bg-clip-text text-transparent">
              snackolicious
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Crafting authentic traditional snacks and fresh foods, delivered to your doorstep with care.
            </p>
            <div className="flex space-x-3 pt-1">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-food-accent transition-colors"
                title="Instagram"
              >
                <Instagram size={16} />
                <span className="sr-only">Instagram</span>
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-food-accent transition-colors"
                title="Facebook"
              >
                <Facebook size={16} />
                <span className="sr-only">Facebook</span>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-food-accent transition-colors"
                title="Twitter"
              >
                <Twitter size={16} />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Quick Links</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products?category=snacks" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Traditional Snacks
                </Link>
              </li>
              <li>
                <Link to="/products?category=fresh" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Fresh Foods
                </Link>
              </li>
              <li>
                <Link to="/subscription" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Subscriptions
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Support</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Contact</h4>
            <div className="space-y-1.5">
              <a 
                href="https://wa.me/1234567890" 
                className="text-sm text-primary hover:text-food-accent font-medium transition-colors block"
                title="WhatsApp"
              >
                WhatsApp: +123 456 7890
              </a>
              <p className="text-sm text-muted-foreground">
                Monday to Saturday
                <br />
                9:00 AM - 6:00 PM IST
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-muted-foreground">
            © {currentYear} snackolicious. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <a className="text-xs text-muted-foreground hover:text-primary transition-colors" href="#">
              Terms
            </a>
            <a className="text-xs text-muted-foreground hover:text-primary transition-colors" href="#">
              Privacy
            </a>
            <a className="text-xs text-muted-foreground hover:text-primary transition-colors" href="#">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
