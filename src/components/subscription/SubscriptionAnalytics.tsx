import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CreditCard, Package, Timer } from "lucide-react";

interface SubscriptionAnalytics {
  totalSpent: number;
  activeTime: number; // in days
  ordersPlaced: number;
  nextBillingDate: string;
  savingsToDate: number;
  usageStats: {
    daysRemaining: number;
    ordersRemaining: number;
    cycleProgress: number;
  };
}

interface SubscriptionAnalyticsProps {
  analytics: SubscriptionAnalytics;
  isLoading: boolean;
}

const SubscriptionAnalytics = ({ analytics, isLoading }: SubscriptionAnalyticsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Spent */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Spent
                  </p>
                  <p className="text-2xl font-bold">${analytics.totalSpent}</p>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Active Time */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Time
                  </p>
                  <p className="text-2xl font-bold">{analytics.activeTime} days</p>
                </div>
                <Timer className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Orders Placed */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Orders Placed
                  </p>
                  <p className="text-2xl font-bold">{analytics.ordersPlaced}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Next Billing */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Next Billing
                  </p>
                  <p className="text-2xl font-bold">
                    {new Date(analytics.nextBillingDate).toLocaleDateString()}
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Stats */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Current Cycle Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Cycle Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cycle Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.usageStats.cycleProgress}%
                  </span>
                </div>
                <Progress value={analytics.usageStats.cycleProgress} />
              </div>

              {/* Days Remaining */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Days Remaining</span>
                <Badge variant="secondary">
                  {analytics.usageStats.daysRemaining} days
                </Badge>
              </div>

              {/* Orders Remaining */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Orders Remaining</span>
                <Badge variant="secondary">
                  {analytics.usageStats.ordersRemaining} orders
                </Badge>
              </div>

              {/* Savings */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Savings</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ${analytics.savingsToDate} saved
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default SubscriptionAnalytics; 