import { Link } from "react-router-dom";
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
  Soup
} from "lucide-react";

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
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-6">
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
    </NavigationMenu>
  );
};

export default NavigationMenuComponent; 