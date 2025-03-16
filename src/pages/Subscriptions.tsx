import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Check } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import FloatingCart from "../components/ui/FloatingCart"; 
import PincodeCheck from "../components/ui/PincodeCheck";

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState<boolean | null>(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/subscriptions');
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions');
        }
        const data = await response.json();
        setSubscriptions(data.subscriptions);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleDeliveryAvailable = () => {
    setIsDeliveryAvailable(true);
  };

  const handleDeliveryUnavailable = () => {
    setIsDeliveryAvailable(false);
  };

  const handleSubscribe = async (subscriptionId) => {
    if (!isDeliveryAvailable) {
      return;
    }

    try {
      // Validate subscription ID format
      if (!subscriptionId || typeof subscriptionId !== 'string') {
        console.error("Invalid subscription selected");
        return;
      }

      // Navigate to checkout with the subscription ID
      navigate(`/checkout?subscription=${subscriptionId}`);
    } catch (error) {
      console.error('Error handling subscription:', error);
      // Remove toast since it's not imported/available
      console.error("Failed to process subscription. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading subscriptions...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">Error loading subscriptions</div>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Choose Your Subscription Plan</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select a subscription plan that best fits your needs. All plans include free delivery and the ability to customize your order.
          </p>
        </div>

        <div className="mb-8">
          <PincodeCheck
            onDeliveryAvailable={handleDeliveryAvailable}
            onDeliveryUnavailable={handleDeliveryUnavailable}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription: Subscription) => (
            <Card key={subscription.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{subscription.name}</CardTitle>
                <CardDescription>{subscription.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">₹{subscription.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(subscription.id)}
                  disabled={!isDeliveryAvailable}
                >
                  {isDeliveryAvailable === null
                    ? "Check Delivery Availability"
                    : isDeliveryAvailable
                    ? "Subscribe Now"
                    : "Delivery Not Available"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
      <FloatingCart />
    </div>
  );
};

export default SubscriptionsPage; 