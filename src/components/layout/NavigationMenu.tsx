import { Link } from "react-router-dom";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { 
  Utensils, 
  Leaf, 
  Beef, 
  Candy, 
  Package, 
  Sprout,
  Soup,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const categories = [
  {
    title: "Traditional Snacks",
    description: "Authentic Indian snacks made with traditional recipes",
    href: "/products?category=snacks",
    icon: Utensils,
    color: "text-food-snack"
  },
  {
    title: "Fresh Foods",
    description: "Fresh and healthy meals prepared daily",
    href: "/products?category=fresh",
    icon: Leaf,
    color: "text-food-fresh"
  },
  {
    title: "Veg Pickles",
    description: "Traditional homemade vegetarian pickles",
    href: "/products?category=pickles-veg",
    icon: Sprout,
    color: "text-green-600"
  },
  {
    title: "Non-Veg Pickles",
    description: "Authentic non-vegetarian pickles",
    href: "/products?category=pickles-nonveg",
    icon: Beef,
    color: "text-red-600"
  },
  {
    title: "Sweets",
    description: "Traditional Indian sweets and desserts",
    href: "/products?category=sweets",
    icon: Candy,
    color: "text-yellow-600"
  },
  {
    title: "Instant Pre-mix",
    description: "Ready-to-cook instant mixes",
    href: "/products?category=instant-premix",
    icon: Package,
    color: "text-blue-600"
  },
  {
    title: "Podi",
    description: "Traditional spice powders and podis",
    href: "/products?category=podi",
    icon: Soup,
    color: "text-purple-600"
  }
];

const NavigationMenuComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4">
          <Link 
            to="/" 
            className="text-lg font-medium hover:text-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-medium">Products</p>
            <div className="grid gap-2 pl-4">
              {categories.map((category) => (
                <Link
                  key={category.href}
                  to={category.href}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <category.icon className={cn("h-4 w-4", category.color)} />
                  {category.title}
                </Link>
              ))}
            </div>
          </div>
          <Link 
            to="/subscription" 
            className="text-lg font-medium hover:text-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Subscriptions
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );

  const DesktopNav = () => (
    <NavigationMenuList className="hidden md:flex gap-6">
      <NavigationMenuItem>
        <Link 
          to="/" 
          className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          Home
        </Link>
      </NavigationMenuItem>
      
      <NavigationMenuItem>
        <NavigationMenuTrigger className="text-sm font-medium">Products</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[400px] gap-1 p-4">
            {categories.map((category) => (
              <li key={category.href}>
                <NavigationMenuLink asChild>
                  <Link
                    to={category.href}
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none",
                      "transition-colors hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground",
                      "group"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <category.icon className={cn("h-5 w-5", category.color)} />
                      <div>
                        <div className="text-sm font-medium leading-none">{category.title}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <Link 
          to="/subscription" 
          className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          Subscriptions
        </Link>
      </NavigationMenuItem>
    </NavigationMenuList>
  );

  return (
    <NavigationMenu className="flex justify-between items-center w-full">
      <MobileNav />
      <DesktopNav />
    </NavigationMenu>
  );
};

export default NavigationMenuComponent; 