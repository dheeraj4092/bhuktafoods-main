import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PincodeCheckProps {
  onDeliveryAvailable: () => void;
  onDeliveryUnavailable: () => void;
}

const PincodeCheck = ({ onDeliveryAvailable, onDeliveryUnavailable }: PincodeCheckProps) => {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const { toast } = useToast();

  const checkPincode = async () => {
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/delivery/check-pincode?pincode=${pincode}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Log the response for debugging
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to check pincode');
      }

      setIsEligible(data.isEligible);
      
      if (data.isEligible) {
        onDeliveryAvailable();
        toast({
          title: "Delivery Available",
          description: "Great! We deliver to your area.",
        });
      } else {
        onDeliveryUnavailable();
        toast({
          title: "Delivery Not Available",
          description: "Sorry, we don't deliver to your area yet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Pincode check error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check delivery availability. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Check Delivery Availability</h3>
          <p className="text-sm text-muted-foreground">
            Enter your pincode to check if we deliver to your area
          </p>
        </div>

        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Enter 6-digit pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="max-w-[200px]"
          />
          <Button
            onClick={checkPincode}
            disabled={loading || pincode.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "Check"
            )}
          </Button>
        </div>

        {isEligible !== null && (
          <div className={`flex items-center gap-2 ${
            isEligible ? "text-green-600" : "text-red-600"
          }`}>
            {isEligible ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Delivery available in your area</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                <span>Delivery not available in your area</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PincodeCheck;