import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading]);

  const handleQuantityChange = (id: string, currentQuantity: number, change: number, quantityUnit: string) => {
    updateQuantity(id, currentQuantity + change, quantityUnit);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
                  <p className="text-muted-foreground">Add some delicious items to your cart!</p>
                </div>
                <Link to="/products">
                  <HoverBorderGradient
                    containerClassName="rounded-full"
                    className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-6 py-2"
                  >
                    <span>Continue Shopping</span>
                  </HoverBorderGradient>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 pt-24 sm:pt-28">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-medium">Shopping Cart</h1>
            <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {items.map((item, index) => (
                      <div key={item.id} className="p-6">
                        <div className="flex items-center gap-6">
                          <div className="relative w-24 h-24 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className={cn(
                              "absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full",
                              item.category === "snacks" 
                                ? "bg-food-snack/10 text-food-snack"
                                : "bg-food-fresh/10 text-food-fresh"
                            )}>
                              {item.category === "snacks" ? "Traditional" : "Fresh"}
                            </div>
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-lg">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.quantityUnit} - ₹{item.basePrice.toFixed(2)}
                              {item.quantityUnit === "500g" && " (2x price)"}
                              {item.quantityUnit === "1Kg" && " (4x price with 10% discount)"}
                            </p>
                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.quantityUnit)}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.quantityUnit)}
                                  className="h-8 w-8"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} × {item.quantity} ({item.quantityUnit})
                          </span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-lg">₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <Link to="/checkout">
                      <HoverBorderGradient
                        containerClassName="rounded-full w-full"
                        className="dark:bg-black bg-white text-black dark:text-white flex items-center justify-center space-x-2 px-6 py-2"
                      >
                        <span>Proceed to Checkout</span>
                      </HoverBorderGradient>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;