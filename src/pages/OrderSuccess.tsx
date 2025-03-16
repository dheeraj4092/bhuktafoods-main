import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Package, MapPin, CreditCard, Copy, Calendar, ShoppingBag, AlertCircle, MessageCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderSuccessState {
  orderId: string;
  orderTotal: number;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    quantity_unit: string;
    price: number;
    price_at_time: number;
  }>;
  shippingAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
    phone_number: string;
  };
}

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderSuccessState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("");

  useEffect(() => {
    // Calculate estimated delivery date (3-5 business days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3 + Math.floor(Math.random() * 3));
    setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));

    // Check if we have order details in location state
    if (location.state) {
      const state = location.state as OrderSuccessState;
      console.log('Received order state:', state);
      console.log('Order total:', state.orderTotal);
      
      // Validate required fields
      if (!state.orderId || !state.orderTotal || !state.items || !state.shippingAddress) {
        console.error('Missing required fields:', {
          orderId: state.orderId,
          orderTotal: state.orderTotal,
          items: state.items,
          shippingAddress: state.shippingAddress
        });
        setError("Invalid order details");
        toast.error("Invalid order details");
        navigate("/");
        return;
      }

      setOrderDetails(state);
    } else {
      // If no state, try to get order details from URL params
      const params = new URLSearchParams(location.search);
      const orderId = params.get('orderId');
      console.log('No state found, checking URL params. OrderId:', orderId);
      
      if (orderId) {
        // TODO: Fetch order details from backend
        setError("Order details not found");
        toast.error("Order details not found");
        navigate("/");
        return;
      } else {
        setError("No order details found");
        toast.error("No order details found");
        navigate("/");
      }
    }
    setIsLoading(false);
  }, [location.state, location.search, navigate]);

  const copyOrderId = () => {
    if (orderDetails?.orderId) {
      navigator.clipboard.writeText(orderDetails.orderId);
      toast.success("Order ID copied to clipboard!");
    }
  };

  const formatWhatsAppMessage = () => {
    if (!orderDetails) return "";
    
    const message = `🙏 *Welcome to Bhukta Foods!*
---------------------------
We're excited to confirm your order:

📦 *Order Details*
Order ID: ${orderDetails.orderId}
Date: ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}

🛍️ *Your Items:*
${orderDetails.items.map(item => 
  `• ${item.name}
   Quantity: ${item.quantity} ${item.quantity_unit}
   Price: ₹${(item.price_at_time * item.quantity).toFixed(2)}`
).join('\n\n')}

💰 *Payment Summary*
Total Amount: ₹${orderDetails.orderTotal.toFixed(2)}

📍 *Delivery Information*
${orderDetails.shippingAddress.name}
${orderDetails.shippingAddress.address}
${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.zipCode}

💳 *Payment Instructions*
• We will process your payment through this WhatsApp chat
• Our team will guide you through the payment process
• You'll receive payment confirmation instantly

Need help? Feel free to ask any questions!

Thank you for choosing Bhukta Foods! We're preparing your delicious order with care. 🌟`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppRedirect = () => {
    const ADMIN_PHONE = "+916300081285"; // Replace with your actual WhatsApp business number
    const message = formatWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${ADMIN_PHONE}?text=${message}`;
    
    toast.success("Redirecting to WhatsApp...");
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                  <p className="text-lg font-medium text-center">{error}</p>
                  <Button asChild>
                    <Link to="/">Return to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!orderDetails) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Message Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <CardTitle className="text-2xl text-center">Order Placed Successfully!</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground">
                Thank you for your order. We'll send you an email with your order details shortly.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-700 font-medium mb-2">Payment Instructions</p>
                <p className="text-blue-600 mb-4">
                  We will contact you shortly on WhatsApp at {orderDetails?.shippingAddress.phone_number} for payment details and to confirm your order.
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                  onClick={handleWhatsAppRedirect}
                >
                  <MessageCircle className="w-5 h-5" />
                  Continue to WhatsApp Payment
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                <Button asChild className="w-full">
                  <Link to="/orders">View Orders</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order ID and Total */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Order ID:</span>
                    <span className="text-muted-foreground">{orderDetails.orderId}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={copyOrderId}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-muted-foreground">₹{orderDetails.orderTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Estimated Delivery:</span>
                    <span className="text-muted-foreground">{estimatedDelivery}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Shipping Address:</span>
                  </div>
                  <div className="pl-7 text-muted-foreground">
                    <p>{orderDetails.shippingAddress.name}</p>
                    <p>{orderDetails.shippingAddress.address}</p>
                    <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* Order Items Summary */}
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Order Items:</span>
                </div>
                <div className="space-y-2">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity} ({item.quantity_unit})</span>
                      <span>₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total Cost</span>
                      <span>₹{orderDetails.orderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700 font-medium">Your order is being processed and will be shipped soon.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess; 