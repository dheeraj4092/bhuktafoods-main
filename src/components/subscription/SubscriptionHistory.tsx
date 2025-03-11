import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Download } from "lucide-react";
import { format } from "date-fns";

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

interface SubscriptionHistoryProps {
  history: SubscriptionHistoryItem[];
  isLoading: boolean;
}

const SubscriptionHistory = ({ history, isLoading }: SubscriptionHistoryProps) => {
  const [sortField, setSortField] = useState<keyof SubscriptionHistoryItem>("start_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedHistory = [...history].sort((a, b) => {
    if (sortField === "start_date" || sortField === "end_date") {
      return sortDirection === "asc"
        ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
        : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
    }
    return sortDirection === "asc"
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField]));
  });

  const handleSort = (field: keyof SubscriptionHistoryItem) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
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
        <CardTitle>Subscription History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("subscription_name")}
                >
                  Plan
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("start_date")}
                >
                  Start Date
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("end_date")}
                >
                  End Date
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  Amount
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("payment_status")}
                >
                  Payment
                </TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.subscription_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(item.start_date), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(item.end_date), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(item.status)}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getPaymentStatusColor(item.payment_status)}
                    >
                      {item.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.invoice_url ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(item.invoice_url, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    <div className="text-muted-foreground">
                      No subscription history found
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionHistory; 