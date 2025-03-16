import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : "",
    email: user?.email || "",
    address: "",
    city: "",
    zipCode: "",
    phoneNumber: "",
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
    }
  }, [items, navigate]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Please enter your address");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("Please enter your city");
      return false;
    }
    if (!formData.zipCode.trim()) {
      toast.error("Please enter your ZIP code");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    // Basic phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    // Check for valid session
    if (!session?.access_token) {
      toast.error("Your session has expired. Please log in again.");
      navigate("/auth", { state: { from: "/checkout" } });
      return;
    }

    setIsProcessing(true);
  
    try {
      // Log session state for debugging
      console.log('Session state:', {
        user: user?.id,
        sessionExpiry: session?.expires_at,
        hasAccessToken: !!session?.access_token
      });

      // Prepare the order payload
      const orderPayload = {
        items: items.map(item => ({
          product_id: item.productId,
          quantity: parseInt(item.quantity.toString()),
          quantity_unit: item.quantityUnit || '250g',
          unit_price: parseFloat(item.basePrice.toString())
        })),
        shipping_address: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          zip_code: formData.zipCode,
          phone_number: formData.phoneNumber
        },
        total_amount: parseFloat(totalPrice.toString())
      };

      // Log request details for debugging
      console.log('Order request:', {
        url: `${API_BASE_URL}/api/orders`,
        payload: orderPayload,
        hasAuthHeader: true
      });
  
      // Send the order to the backend
      const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      // Log full response details
      console.log('Order response details:', {
        status: orderResponse.status,
        statusText: orderResponse.statusText,
        headers: Object.fromEntries(orderResponse.headers.entries()),
        url: orderResponse.url
      });
  
      if (!orderResponse.ok) {
        const errorText = await orderResponse.text(); // Get raw response text first
        console.error('Raw error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: errorText };
        }

        console.error('Order creation failed:', {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          error: errorData,
          requestPayload: orderPayload
        });
        
        // Handle specific error cases
        if (orderResponse.status === 401) {
          toast.error("Your session has expired. Please log in again.");
          navigate("/auth", { state: { from: "/checkout" } });
          return;
        }
        
        if (orderResponse.status === 403) {
          toast.error("You don't have permission to create orders. Please contact support.");
          return;
        }

        if (orderResponse.status === 500) {
          toast.error("Server error. Our team has been notified. Please try again later.");
          // Log additional context for debugging
          console.error('Server error context:', {
            user: user?.id,
            timestamp: new Date().toISOString(),
            orderPayload,
            errorData
          });
          return;
        }
        
        throw new Error(
          errorData.error || 
          errorData.details || 
          errorData.message || 
          "Failed to create order"
        );
      }
  
      let data;
      try {
        const responseText = await orderResponse.text();
        console.log('Raw success response:', responseText);
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        throw new Error("Invalid response format from server");
      }

      console.log('Order created:', data);
      
      if (!data.order?.id) {
        console.error('Invalid order response structure:', data);
        throw new Error("Invalid order response from server");
      }

      clearCart();
      toast.success(data.message || "Order placed successfully!");
      
      // Navigate to success page with order details
      const orderState = {
        orderId: data.order.id,
        orderTotal: data.order.total_amount,
        items: data.order.order_items.map(item => ({
          productId: item.product_id,
          name: item.products.name,
          quantity: item.quantity,
          quantity_unit: item.quantity_unit,
          price: item.price_at_time,
          price_at_time: item.price_at_time
        })),
        shippingAddress: data.order.shipping_address
      };

      navigate(`/order-success?orderId=${data.order.id}`, { 
        state: orderState
      });
    } catch (error) {
      console.error("Checkout error:", {
        error,
        sessionState: {
          hasUser: !!user,
          hasSession: !!session,
          hasAccessToken: !!session?.access_token
        }
      });
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Please log in to proceed with checkout
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/auth" state={{ from: "/checkout" }}>
                    Log In to Continue
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Enter your 10-digit phone number"
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Enter your city"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          placeholder="Enter your ZIP code"
                        />
                      </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Place Order"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.quantity} × {item.quantityUnit}
                          </span>
                        </div>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>₹{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
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

export default Checkout;