
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-food-light border-t border-border py-16 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">snackolicious</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Crafting authentic traditional snacks and fresh foods, delivered to your doorstep with care.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-food-accent transition-colors"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-food-accent transition-colors"
              >
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-food-accent transition-colors"
              >
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-base font-medium">Quick Links</h4>
            <ul className="space-y-2">
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
          
          <div className="space-y-4">
            <h4 className="text-base font-medium">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-base font-medium">Contact Us</h4>
            <p className="text-sm text-muted-foreground">
              For orders and inquiries:
            </p>
            <a href="https://wa.me/1234567890" className="text-sm text-primary hover:text-food-accent font-medium transition-colors block">
              WhatsApp: +123 456 7890
            </a>
            <p className="text-sm text-muted-foreground mt-4">
              Operating Hours: Monday to Saturday
              <br />
              9:00 AM - 6:00 PM IST
            </p>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} snackolicious. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <a className="text-xs text-muted-foreground hover:text-primary transition-colors" href="#">
              Terms of Service
            </a>
            <a className="text-xs text-muted-foreground hover:text-primary transition-colors" href="#">
              Privacy Policy
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
