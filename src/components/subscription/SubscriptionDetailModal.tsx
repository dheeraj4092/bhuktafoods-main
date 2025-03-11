import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  image_url?: string | null;
  features: string[];
  benefits: string[];
  restrictions: string[];
}

interface SubscriptionDetailModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (subscriptionId: string) => Promise<void>;
  isSubscribing: boolean;
}

const SubscriptionDetailModal = ({
  subscription,
  isOpen,
  onClose,
  onSubscribe,
  isSubscribing,
}: SubscriptionDetailModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  if (!subscription) return null;

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/auth", { state: { from: "/subscription" } });
      return;
    }
    await onSubscribe(subscription.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{subscription.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Image and Basic Info */}
          <div className="space-y-4">
            {subscription.image_url ? (
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={subscription.image_url}
                  alt={subscription.name}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">${subscription.price}</span>
                <Badge variant="secondary">{subscription.duration_days} days</Badge>
              </div>
              <p className="text-muted-foreground">{subscription.description}</p>
            </div>
          </div>

          {/* Right Column - Features, Benefits, and Restrictions */}
          <div className="space-y-6">
            {/* Features */}
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-2">
                {subscription.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="font-semibold mb-2">Benefits</h3>
              <ul className="space-y-2">
                {subscription.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Restrictions */}
            <div className={cn(!showMore && "hidden")}>
              <h3 className="font-semibold mb-2">Restrictions</h3>
              <ul className="space-y-2">
                {subscription.restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="font-medium">•</span>
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>

            {subscription.restrictions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMore(!showMore)}
                className="text-muted-foreground"
              >
                {showMore ? "Show less" : "Show restrictions"}
              </Button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubscribe} disabled={isSubscribing}>
            {isSubscribing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              "Subscribe Now"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDetailModal; 