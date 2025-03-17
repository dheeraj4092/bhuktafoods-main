import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Calendar, MapPin, CreditCard, ShoppingBag, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Array<Database['public']['Tables']['order_items']['Row'] & {
    products: Database['public']['Tables']['products']['Row']
  }>
}

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('No active session found');
        }

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              price_at_time,
              products (
                id,
                name,
                image_url
              )
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setOrders(data as Order[]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
        setError(errorMessage);
        toast.error(errorMessage);
        
        // If authentication failed, redirect to login
        if (errorMessage.includes('Authentication failed') || errorMessage.includes('No active session')) {
          navigate('/auth');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      navigate('/auth');
    }
  }, [user, navigate]);

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">Loading orders...</div>
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
          <div className="text-center text-red-600">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 pt-24 sm:pt-28">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Order History</h1>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No orders found. Start shopping to create your first order!</p>
                <Button className="mt-4" onClick={() => navigate('/products')}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-muted-foreground" />
                        <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">₹{order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {order.shipping_address.city}, {order.shipping_address.zipCode}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Order Items</span>
                      </div>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <img
                                src={item.products.image_url}
                                alt={item.products.name}
                                className="w-8 h-8 object-cover rounded"
                              />
                              <span>{item.products.name}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-muted-foreground">x{item.quantity}</span>
                              <span>₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderHistory; 