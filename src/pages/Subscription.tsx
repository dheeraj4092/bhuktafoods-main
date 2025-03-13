import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import SubscriptionDetailModal from "@/components/subscription/SubscriptionDetailModal";
import SubscriptionHistory from "@/components/subscription/SubscriptionHistory";
import SubscriptionAnalytics from "@/components/subscription/SubscriptionAnalytics";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  benefits: string[];
  restrictions: string[];
  image_url?: string;
}

interface UserSubscription {
  id: string;
  subscription: Subscription;
  start_date: string;
  end_date: string;
  status: string;
  auto_renew: boolean;
  pause_start?: string;
  pause_end?: string;
}

interface SubscriptionHistoryItem {
  id: string;
  subscription_name: string;
  start_date: string;
  end_date: string;
  status: string;
  price: number;
  payment_status: string;
  invoice_url?: string;
}

interface SubscriptionAnalyticsData {
  totalSpent: number;
  activeTime: number;
  ordersPlaced: number;
  nextBillingDate: string;
  savingsToDate: number;
  usageStats: {
    daysRemaining: number;
    ordersRemaining: number;
    cycleProgress: number;
  };
}

const Subscription = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [changingPlan, setChangingPlan] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [pauseDuration, setPauseDuration] = useState(7);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState("plans");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available subscriptions
        const subsResponse = await fetch("http://localhost:5001/api/subscriptions");
        const subsData = await subsResponse.json();
        setSubscriptions(subsData);

        // Fetch user's subscription data if logged in
        if (user && session?.access_token) {
          const [userSubResponse, historyResponse, analyticsResponse] = await Promise.all([
            fetch("http://localhost:5001/api/subscriptions/user/active", {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }),
            fetch("http://localhost:5001/api/subscriptions/history", {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }),
            fetch("http://localhost:5001/api/subscriptions/analytics", {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }),
          ]);

          if (!userSubResponse.ok) {
            console.error('Error fetching active subscription:', await userSubResponse.text());
            return;
          }

          if (!historyResponse.ok) {
            console.error('Error fetching subscription history:', await historyResponse.text());
            return;
          }

          if (!analyticsResponse.ok) {
            console.error('Error fetching subscription analytics:', await analyticsResponse.text());
            return;
          }

          const userSubData = await userSubResponse.json();
          setUserSubscription(userSubData);

          const historyData = await historyResponse.json();
          setSubscriptionHistory(historyData);

          const analyticsData = await analyticsResponse.json();
          setAnalytics(analyticsData);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        toast.error("Failed to load subscription data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, session]);

  const handleSubscribe = async (subscriptionId: string) => {
    if (!user) {
      navigate("/auth", { state: { from: "/subscription" } });
      return;
    }

    if (!session?.access_token) {
      toast.error("Authentication error. Please try logging in again.");
      return;
    }

    console.log("Attempting to subscribe with ID:", subscriptionId); // Debug log

    // Validate that we have a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(subscriptionId)) {
      console.error("Invalid subscription ID format:", subscriptionId);
      toast.error("Invalid subscription selected. Please try again.");
      return;
    }

    // Check if the subscription exists in our available subscriptions
    const subscriptionExists = subscriptions.some(sub => sub.id === subscriptionId);
    if (!subscriptionExists) {
      console.error("Subscription not found:", subscriptionId);
      toast.error("Selected subscription not found. Please refresh and try again.");
      return;
    }

    setSubscribing(true);
    try {
      console.log("Making subscription request to:", "http://localhost:5001/api/subscriptions/subscribe"); // Debug log
      
      const response = await fetch("http://localhost:5001/api/subscriptions/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ subscription_id: subscriptionId }),
      });

      console.log("Response status:", response.status); // Debug log

      const responseText = await response.text();
      console.log("Raw response:", responseText); // Debug log

      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        const errorMessage = errorData?.message || errorData?.error || "Failed to subscribe";
        console.error("Subscription error details:", errorData); // Debug log
        throw new Error(errorMessage);
      }

      setUserSubscription(errorData);
      toast.success("Successfully subscribed to the plan!");
      
      // Refresh subscription data
      const [historyResponse, analyticsResponse] = await Promise.all([
        fetch("http://localhost:5001/api/subscriptions/history", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch("http://localhost:5001/api/subscriptions/analytics", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setSubscriptionHistory(historyData);
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error("Subscription error details:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(error instanceof Error ? error.message : "Failed to subscribe to the plan");
    } finally {
      setSubscribing(false);
      setSelectedSubscription(null); // Close the modal if it's open
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    if (!session?.access_token) {
      toast.error("Authentication error. Please try logging in again.");
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch("http://localhost:5001/api/subscriptions/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to cancel subscription");

      setUserSubscription(null);
      toast.success("Subscription cancelled successfully");
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const handleRenew = async () => {
    if (!session?.access_token) {
      toast.error("Authentication error. Please try logging in again.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/subscriptions/renew", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to renew subscription");

      const renewedSubscription = await response.json();
      setUserSubscription(renewedSubscription);
      toast.success("Successfully renewed subscription!");
    } catch (error) {
      console.error("Renewal error:", error);
      toast.error("Failed to renew subscription");
    }
  };

  const handleChangePlan = async (newSubscriptionId: string) => {
    if (!session?.access_token) {
      toast.error("Authentication error. Please try logging in again.");
      return;
    }

    setChangingPlan(true);
    try {
      const response = await fetch("http://localhost:5001/api/subscriptions/change-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ new_subscription_id: newSubscriptionId }),
      });

      if (!response.ok) throw new Error("Failed to change subscription plan");

      const newSubscription = await response.json();
      setUserSubscription(newSubscription);
      toast.success("Successfully changed subscription plan!");
    } catch (error) {
      console.error("Change plan error:", error);
      toast.error("Failed to change subscription plan");
    } finally {
      setChangingPlan(false);
    }
  };

  const handlePause = async () => {
    if (!session?.access_token) {
      toast.error("Authentication error. Please try logging in again.");
      return;
    }

    setPausing(true);
    try {
      // Calculate the pause end date
      const pauseEndDate = new Date();
      pauseEndDate.setDate(pauseEndDate.getDate() + pauseDuration);

      const response = await fetch("http://localhost:5001/api/subscriptions/pause", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ pause_until: pauseEndDate.toISOString() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to pause subscription");
      }

      const pausedSubscription = await response.json();
      setUserSubscription(pausedSubscription);
      setShowPauseDialog(false);
      toast.success(`Successfully paused subscription for ${pauseDuration} days!`);
    } catch (error) {
      console.error("Pause error:", error);
      toast.error("Failed to pause subscription");
    } finally {
      setPausing(false);
    }
  };

  const handleResume = async () => {
    if (!session?.access_token) {
      toast.error("Authentication error. Please try logging in again.");
      return;
    }

    setResuming(true);
    try {
      const response = await fetch("http://localhost:5001/api/subscriptions/resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to resume subscription");

      const resumedSubscription = await response.json();
      setUserSubscription(resumedSubscription);
      toast.success("Successfully resumed subscription!");
    } catch (error) {
      console.error("Resume error:", error);
      toast.error("Failed to resume subscription");
    } finally {
      setResuming(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? This action cannot be undone.")) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch("http://localhost:5001/api/subscriptions/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to cancel subscription");

      setUserSubscription(null);
      setShowCancelDialog(false);
      toast.success("Subscription cancelled successfully");
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const renderSubscriptionCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map((subscription) => (
        <Card 
          key={subscription.id}
          className={cn(
            "cursor-pointer hover:shadow-lg transition-shadow",
            userSubscription?.subscription.id === subscription.id && "border-primary"
          )}
          onClick={() => setSelectedSubscription(subscription)}
        >
          <CardHeader>
            {subscription.image_url && (
              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                <img
                  src={subscription.image_url}
                  alt={subscription.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardTitle>{subscription.name}</CardTitle>
            <CardDescription>{subscription.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold">${subscription.price}</span>
                <Badge variant="secondary">{subscription.duration_days} days</Badge>
              </div>
              <div className="space-y-2">
                {subscription.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {subscription.features.length > 3 && (
                  <span className="text-sm text-muted-foreground">
                    +{subscription.features.length - 3} more features
                  </span>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              variant={userSubscription?.subscription.id === subscription.id ? "outline" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                if (subscription?.id) {
                  handleSubscribe(subscription.id);
                } else {
                  toast.error("Invalid subscription. Please try again.");
                }
              }}
              disabled={subscribing || !subscription?.id}
            >
              {subscribing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : userSubscription?.subscription.id === subscription.id ? (
                "Current Plan"
              ) : (
                "Subscribe Now"
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderSubscriptionTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plan</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Features</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((subscription) => (
          <TableRow 
            key={subscription.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => setSelectedSubscription(subscription)}
          >
            <TableCell>
              <div className="flex items-center gap-3">
                {subscription.image_url && (
                  <img
                    src={subscription.image_url}
                    alt={subscription.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <div className="font-medium">{subscription.name}</div>
                  <div className="text-sm text-muted-foreground">{subscription.description}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{subscription.duration_days} days</TableCell>
            <TableCell>${subscription.price}</TableCell>
            <TableCell>
              <div className="max-w-[200px] truncate">
                {subscription.features.join(", ")}
              </div>
            </TableCell>
            <TableCell>
              {userSubscription?.subscription.id === subscription.id ? (
                <Badge>Current Plan</Badge>
              ) : (
                <Badge variant="secondary">Available</Badge>
              )}
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant={userSubscription?.subscription.id === subscription.id ? "outline" : "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  if (subscription?.id) {
                    handleSubscribe(subscription.id);
                  } else {
                    toast.error("Invalid subscription. Please try again.");
                  }
                }}
                disabled={subscribing || !subscription?.id}
              >
                {subscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : userSubscription?.subscription.id === subscription.id ? (
                  "Current Plan"
                ) : (
                  "Subscribe"
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderSubscriptionActions = () => {
    if (!userSubscription) return null;

    const isActive = userSubscription.status === "active";
    const isPaused = userSubscription.status === "paused";

    return (
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Manage Subscription
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {isActive && (
              <>
                <DropdownMenuItem onClick={() => setShowPauseDialog(true)}>
                  Pause Subscription
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      const response = await fetch("http://localhost:5001/api/subscriptions/auto-renew", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${session?.access_token}`,
                        },
                        body: JSON.stringify({
                          auto_renew: !userSubscription.auto_renew,
                        }),
                      });

                      if (!response.ok) throw new Error("Failed to update auto-renewal");

                      const updatedSubscription = await response.json();
                      setUserSubscription(updatedSubscription);
                      toast.success(
                        `Auto-renewal ${updatedSubscription.auto_renew ? "enabled" : "disabled"}`
                      );
                    } catch (error) {
                      console.error("Auto-renewal update error:", error);
                      toast.error("Failed to update auto-renewal setting");
                    }
                  }}
                >
                  {userSubscription.auto_renew ? "Disable" : "Enable"} Auto-renewal
                </DropdownMenuItem>
              </>
            )}
            {isPaused && (
              <DropdownMenuItem onClick={handleResume}>
                Resume Subscription
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel Subscription
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Subscription Management</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your subscription, view history, and track usage all in one place.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
              <TabsTrigger value="plans">Available Plans</TabsTrigger>
              <TabsTrigger value="current" disabled={!userSubscription}>
                Current Plan
              </TabsTrigger>
              <TabsTrigger value="history" disabled={!user}>
                History
              </TabsTrigger>
              <TabsTrigger value="analytics" disabled={!userSubscription}>
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plans">
              <div className="space-y-6">
                <div className="flex justify-center gap-4 mb-8">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    onClick={() => setViewMode('cards')}
                  >
                    Card View
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    onClick={() => setViewMode('table')}
                  >
                    Comparison View
                  </Button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    {viewMode === "cards" ? renderSubscriptionCards() : renderSubscriptionTable()}
                    
                    <SubscriptionDetailModal
                      subscription={selectedSubscription}
                      isOpen={!!selectedSubscription}
                      onClose={() => setSelectedSubscription(null)}
                      onSubscribe={handleSubscribe}
                      isSubscribing={subscribing}
                    />
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="current">
              {userSubscription && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Subscription</CardTitle>
                      <CardDescription>
                        Manage your current subscription plan and settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Plan Details</h3>
                            <div className="space-y-4">
                              <div>
                                <span className="font-medium">Plan:</span>{" "}
                                {userSubscription.subscription.name}
                              </div>
                              <div>
                                <span className="font-medium">Price:</span>{" "}
                                ${userSubscription.subscription.price}/cycle
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>{" "}
                                <Badge
                                  variant="secondary"
                                  className={cn({
                                    "bg-green-100 text-green-800": userSubscription.status === "active",
                                    "bg-yellow-100 text-yellow-800": userSubscription.status === "paused",
                                    "bg-red-100 text-red-800": userSubscription.status === "cancelled"
                                  })}
                                >
                                  {userSubscription.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Subscription Period</h3>
                            <div className="space-y-4">
                              <div>
                                <span className="font-medium">Start Date:</span>{" "}
                                {new Date(userSubscription.start_date).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">End Date:</span>{" "}
                                {new Date(userSubscription.end_date).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Auto-renewal:</span>{" "}
                                <Badge variant="outline">
                                  {userSubscription.auto_renew ? "Enabled" : "Disabled"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        {renderSubscriptionActions()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <SubscriptionHistory
                history={subscriptionHistory}
                isLoading={loading}
              />
            </TabsContent>

            <TabsContent value="analytics">
              {analytics && (
                <SubscriptionAnalytics
                  analytics={analytics}
                  isLoading={loading}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Pause Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Subscription</DialogTitle>
            <DialogDescription>
              Choose how long you want to pause your subscription. Your subscription will automatically resume after this period.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <label className="text-sm font-medium">Pause Duration (days)</label>
            <input
              type="range"
              min="1"
              max="30"
              value={pauseDuration}
              onChange={(e) => setPauseDuration(parseInt(e.target.value))}
              className="w-full mt-2"
            />
            <div className="text-center mt-2">{pauseDuration} days</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePause} disabled={pausing}>
              {pausing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Pausing...
                </>
              ) : (
                "Confirm Pause"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Subscription"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Subscription; 