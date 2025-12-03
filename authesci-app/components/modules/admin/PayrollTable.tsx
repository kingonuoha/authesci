"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { processPayout } from "@/app/actions/payment";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { CheckCircle, DollarSign, User, Building, Clock, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

const MySwal = withReactContent(Swal);

interface Payout {
    id: string;
    amount: any; // Decimal
    scientistAmount: any; // Decimal
    status: string;
    updatedAt: Date;
    project: {
        title: string;
    };
    scientist: {
        fullName: string | null;
        email: string;
        bankName: string | null;
        accountNumber: string | null;
        accountName: string | null;
        recipientCode: string | null;
    };
}

interface PayrollTableProps {
    payouts: Payout[];
}

export function PayrollTable({ payouts }: PayrollTableProps) {
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"PENDING" | "COMPLETED">("PENDING");

    const filteredPayouts = payouts.filter(p =>
        activeTab === "PENDING" ? p.status === "RELEASED" : p.status === "COMPLETED"
    );

    const handleProcess = async (payout: Payout) => {
        const hasBankDetails = payout.scientist.bankName && payout.scientist.accountNumber;
        const hasRecipientCode = !!payout.scientist.recipientCode;

        const result = await MySwal.fire({
            title: 'Process Payout',
            html: `
                <div class="text-left text-sm mb-4">
                    <p><strong>Amount:</strong> ${formatCurrency(payout.scientistAmount)}</p>
                    <p><strong>Recipient:</strong> ${payout.scientist.accountName || 'N/A'}</p>
                    <p><strong>Bank:</strong> ${payout.scientist.bankName || 'N/A'}</p>
                    <p><strong>Account:</strong> ${payout.scientist.accountNumber || 'N/A'}</p>
                </div>
                <p class="text-sm text-neutral-500">Choose payout method:</p>
            `,
            icon: 'info',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonColor: '#10b981',
            denyButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Manual Transfer (Mark as Done)',
            denyButtonText: 'Auto Transfer (Paystack)',
            customClass: {
                popup: 'dark:bg-neutral-800 dark:text-white',
                title: 'dark:text-white',
                htmlContainer: 'dark:text-neutral-300'
            },
            didOpen: () => {
                // Disable Auto button if no bank details
                const denyBtn = Swal.getDenyButton();
                if (denyBtn && !hasBankDetails) {
                    denyBtn.disabled = true;
                    denyBtn.title = "Bank details missing";
                }
            }
        });

        if (result.isDismissed) return;

        const method = result.isDenied ? "AUTO" : "MANUAL";

        setProcessingId(payout.id);
        try {
            const actionResult = await processPayout(payout.id, method);
            if (actionResult.success) {
                toast.success(`Payout processed successfully (${method})`);
            } else {
                toast.error(actionResult.error || "Failed to process payout");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab("PENDING")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "PENDING"
                        ? "bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    Pending
                    <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5 min-w-[1.25rem]">{payouts.filter(p => p.status === "RELEASED").length}</Badge>
                </button>
                <button
                    onClick={() => setActiveTab("COMPLETED")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "COMPLETED"
                        ? "bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                        }`}
                >
                    <CheckCircle className="w-4 h-4" />
                    Completed
                    <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5 min-w-[1.25rem]">{payouts.filter(p => p.status === "COMPLETED").length}</Badge>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPayouts.map((payout) => (
                    <div key={payout.id} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 min-w-0 mr-2">
                                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-white truncate" title={payout.project.title}>
                                        {payout.project.title}
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {activeTab === "PENDING" ? "Released" : "Paid"} {formatDistanceToNow(new Date(payout.updatedAt), { addSuffix: true })}
                                    </p>
                                </div>
                                <Badge variant={payout.status === "RELEASED" ? "outline" : "default"} className={payout.status === "RELEASED" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-100"}>
                                    {payout.status === "RELEASED" ? "Pending" : "Paid"}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="text-sm font-medium">Amount</span>
                                    </div>
                                    <span className="text-lg font-bold text-neutral-900 dark:text-white">
                                        {formatCurrency(payout.scientistAmount)}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 font-medium">
                                        <User className="w-4 h-4 text-neutral-400" />
                                        <span>{payout.scientist.fullName}</span>
                                    </div>
                                    <div className="pl-6 space-y-1 text-neutral-500 dark:text-neutral-400">
                                        <div className="flex items-center gap-2">
                                            <Building className="w-3 h-3" />
                                            <span>{payout.scientist.bankName || "No Bank"}</span>
                                        </div>
                                        <p className="font-mono text-xs bg-neutral-100 dark:bg-neutral-700 inline-block px-2 py-0.5 rounded">
                                            {payout.scientist.accountNumber || "No Account"}
                                        </p>
                                        <p className="text-xs">{payout.scientist.accountName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {activeTab === "PENDING" && (
                            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 border-t border-neutral-100 dark:border-neutral-700">
                                <Button
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                                    onClick={() => handleProcess(payout)}
                                    disabled={!!processingId}
                                >
                                    {processingId === payout.id ? (
                                        "Processing..."
                                    ) : (
                                        <>
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Process Payout
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                        {activeTab === "COMPLETED" && (
                            <div className="bg-green-50 dark:bg-green-900/10 p-4 border-t border-green-100 dark:border-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Payment Completed
                            </div>
                        )}
                    </div>
                ))}

                {filteredPayouts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-neutral-500 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 border-dashed">
                        <div className="flex flex-col items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-neutral-300 mb-3" />
                            <p className="text-lg font-medium text-neutral-900 dark:text-white">No {activeTab.toLowerCase()} payouts</p>
                            <p className="text-sm">
                                {activeTab === "PENDING" ? "You're all caught up!" : "No history available."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
