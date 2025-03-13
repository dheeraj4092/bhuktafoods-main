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
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/products?category=snacks"
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      "group"
                    )}
                  >
                    <div className="text-sm font-medium leading-none">Traditional Snacks</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Authentic Indian snacks made with traditional recipes
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/products?category=fresh"
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      "group"
                    )}
                  >
                    <div className="text-sm font-medium leading-none">Fresh Foods</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Fresh and healthy meals prepared daily
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
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