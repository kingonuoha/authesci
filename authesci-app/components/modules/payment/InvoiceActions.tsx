"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fundProject } from "@/app/actions/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/formatCurrency";

interface InvoiceActionsProps {
  applicationId: string;
  salaryRange?: string | null;
  jobTitle: string;
  rangeLimits?: { min: number; max: number };
  fixedPrice?: number;
}

export default function InvoiceActions({ applicationId, salaryRange, jobTitle, rangeLimits, fixedPrice }: InvoiceActionsProps) {
  const router = useRouter();
  // Initialize with fixedPrice or max range, or empty
  const [finalPrice, setFinalPrice] = useState<string>(
    fixedPrice ? fixedPrice.toString() : (rangeLimits ? rangeLimits.max.toString() : "")
  );
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Calculate fees (Internal split, user pays the full price entered)
  const price = parseFloat(finalPrice) || 0;
  // The platform fee is deducted from the price, not added on top.
  // So Total to Pay = Price.
  const totalToPay = price;

  // Calculate progress for range slider
  const getProgress = () => {
    if (!rangeLimits || !price) return 0;
    const { min, max } = rangeLimits;
    if (price < min) return 0;
    if (price > max) return 100;
    return ((price - min) / (max - min)) * 100;
  };

  const isOutOfRange = rangeLimits && (price < rangeLimits.min || price > rangeLimits.max);

  const handlePay = async () => {
    if (rangeLimits) {
      const price = parseFloat(finalPrice);
      if (isNaN(price) || price < rangeLimits.min || price > rangeLimits.max) {
        toast.error(`Please enter a price between ${rangeLimits.min} and ${rangeLimits.max}`);
        return;
      }
    } else if (!finalPrice) {
        toast.error("Please enter the final agreed price.");
        return;
    }

    setIsLoading(true);
    try {
      const result = await fundProject(applicationId, parseFloat(finalPrice));
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.url) {
        // Redirect to Paystack
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode) {
      setCouponError("Coupon invalid: Feature not yet implemented.");
    } else {
        setCouponError("");
    }
  };

  return (
        <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
        <Label htmlFor="finalPrice">Final Agreed Price</Label>
        {salaryRange && !fixedPrice && (
            <TooltipProvider>
                <Tooltip>
                <TooltipTrigger>
                    <Info className="h-4 w-4 text-neutral-400" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>You used a range price ({salaryRange}); please confirm the final agreed amount.</p>
                </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
        </div>
        <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              {formatCurrency(0).charAt(0)}
            </span>
        <Input
            id="finalPrice"
            type="number"
            placeholder="0.00"
            value={finalPrice}
            onChange={(e) => setFinalPrice(e.target.value)}
            className="pl-8"
            min={rangeLimits?.min}
            max={rangeLimits?.max}
            disabled={!!fixedPrice}
        />
        </div>
        {rangeLimits && !fixedPrice && (
          <div className="mt-2">
            <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${isOutOfRange ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Min: {formatCurrency(rangeLimits.min)}</span>
              <span>Max: {formatCurrency(rangeLimits.max)}</span>
            </div>
            {isOutOfRange && price > 0 && (
               <p className="text-xs text-red-500 mt-1">
                 Price is outside the agreed range of {formatCurrency(rangeLimits.min)} - {formatCurrency(rangeLimits.max)}
               </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="coupon">Coupon Code</Label>
        <div className="flex gap-2">
          <Input
            id="coupon"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponError("");
            }}
          />
          <Button type="button" variant="outline" onClick={handleApplyCoupon}>
            Apply
          </Button>
        </div>
        {couponError && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {couponError}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg space-y-2">
          <div className="pt-2 flex justify-between font-bold text-lg">
            <span>Total to Pay</span>
            <span className="text-primary-600">{formatCurrency(totalToPay)}</span>
          </div>
        </div>

        <Button 
          onClick={handlePay} 
          className="w-full" 
          size="lg"
          disabled={isLoading || !finalPrice || isOutOfRange || !!couponError}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(totalToPay)}`
          )}
        </Button>
      </div>
        
        <p className="text-center text-xs text-neutral-500 mt-4">
            Secure payment via Paystack. Funds are held in escrow until project completion.
        </p>
      </div>
  );
}
