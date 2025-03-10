
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SubscriptionCTA = () => {
  return (
    <section className="py-20 px-6 lg:px-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-xl border border-border">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
            <div className="w-full lg:w-1/2 space-y-6 animate-fade-in">
              <span className="inline-block py-1 px-3 text-xs font-medium bg-food-fresh/10 text-food-fresh rounded-full">
                Subscription Plan
              </span>
              <h2 className="text-3xl lg:text-4xl font-medium leading-tight">
                Never run out of your favorite items
              </h2>
              <p className="text-lg max-w-xl">
                Subscribe to regular deliveries and save 10%. Pause, modify, or cancel anytime via WhatsApp.
              </p>
              <div className="pt-4">
                <Button asChild size="lg" className="px-6 font-medium rounded-full">
                  <Link to="/subscription">
                    Explore Subscription Plans <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="w-full lg:w-1/2 animate-fade-in animate-delay-300">
              <div className="bg-secondary rounded-2xl p-6 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-food-fresh/10 rounded-full flex-shrink-0 flex items-center justify-center">
                    <span className="text-food-fresh text-xl font-medium">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Flexible Delivery Schedule</h4>
                    <p className="text-sm text-muted-foreground">Choose weekly, bi-weekly, or monthly deliveries to suit your needs.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-food-fresh/10 rounded-full flex-shrink-0 flex items-center justify-center">
                    <span className="text-food-fresh text-xl font-medium">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">10% Subscription Discount</h4>
                    <p className="text-sm text-muted-foreground">Save on every delivery when you subscribe to regular orders.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-food-fresh/10 rounded-full flex-shrink-0 flex items-center justify-center">
                    <span className="text-food-fresh text-xl font-medium">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">WhatsApp Management</h4>
                    <p className="text-sm text-muted-foreground">Easily pause, modify, or cancel your subscription via WhatsApp.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-food-fresh/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-food-snack/5 rounded-full blur-3xl -z-10" />
    </section>
  );
};

export default SubscriptionCTA;
