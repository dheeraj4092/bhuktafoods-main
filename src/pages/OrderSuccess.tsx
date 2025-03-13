import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const OrderSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess; 