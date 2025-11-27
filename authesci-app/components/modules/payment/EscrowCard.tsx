import React from "react";
import { ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/formatCurrency";

interface EscrowCardProps {
  totalAmount: number;
  platformFee: number;
  scientistAmount: number;
  isEmployer?: boolean;
  projectStatus?: string;
}

export default function EscrowCard({ totalAmount, platformFee, scientistAmount, isEmployer = false, projectStatus }: EscrowCardProps) {
  const isCompleted = projectStatus === 'COMPLETED';

  return (
    <div className="card border-0 p-0 rounded-xl h-full">
      <div className="card-header border-b border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 py-4 px-6">
        <h6 className="text-lg font-semibold mb-0">Escrow Status</h6>
      </div>
      <div className="card-body p-6">
        <div className="space-y-6">
          <div className={`p-4 rounded-lg border text-center ${isCompleted
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
              : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
            }`}>
            <p className={`text-sm font-medium mb-1 ${isCompleted ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'
              }`}>
              {isCompleted ? 'Funds Released' : 'Funds Held in Escrow'}
            </p>
            <h3 className={`text-3xl font-bold ${isCompleted ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'
              }`}>
              {formatCurrency(totalAmount)}
            </h3>
            <div className={`flex items-center justify-center gap-2 mt-2 text-xs ${isCompleted ? 'text-blue-600 dark:text-blue-500' : 'text-green-600 dark:text-green-500'
              }`}>
              {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              <span>{isCompleted ? 'Payment Processed' : 'Securely protected'}</span>
            </div>
          </div>

          <div className="space-y-3">
            {!isEmployer ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Scientist Payout (90%)</span>
                  <span className="font-medium">{formatCurrency(scientistAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Platform Fee (10%)</span>
                  <span className="font-medium">{formatCurrency(platformFee)}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {isCompleted
                    ? "Funds have been released to the scientist. Thank you for your collaboration."
                    : "Your funds are safely held in escrow and will only be released to the scientist upon your approval of the completed work."
                  }
                </p>
              </div>
            )}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between font-bold">
              <span>Total Budget</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {!isCompleted && (
            <div className="pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="w-full block">
                      <Button className="w-full" disabled>
                        Release Funds
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Available when project is marked Complete</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-[10px] text-center text-neutral-400 mt-2">
                Funds are securely held until project completion.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
