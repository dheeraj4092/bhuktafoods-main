import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PincodeCheckProps {
  onDeliveryAvailable?: () => void;
  onDeliveryUnavailable?: () => void;
}

const PincodeCheck = ({ onDeliveryAvailable, onDeliveryUnavailable }: PincodeCheckProps) => {
  const [pincode, setPincode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const checkPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch(`/api/check-pincode?pincode=${pincode}`);
      const data = await response.json();
      
      setIsAvailable(data.available);
      if (data.available) {
        toast.success("Delivery available in your area!");
        onDeliveryAvailable?.();
      } else {
        toast.error("Sorry, delivery is not available in your area");
        onDeliveryUnavailable?.();
      }
    } catch (error) {
      toast.error("Failed to check pincode. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">Check Delivery Availability</h3>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter your pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="flex-1"
        />
        <Button 
          onClick={checkPincode} 
          disabled={isChecking || pincode.length !== 6}
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Check"
          )}
        </Button>
      </div>
      
      {isAvailable !== null && (
        <div className="mt-4 flex items-center gap-2">
          {isAvailable ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-green-500">Delivery available in your area</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-500">Delivery not available in your area</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PincodeCheck; 