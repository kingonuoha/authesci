"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/app/(app)/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Transaction {
    id: string;
    type: string;
    amount: any;
    status: string;
    reference: string | null;
    description: string | null;
    createdAt: Date;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchTransactions() {
            const result = await getTransactions();
            if (result.success && result.data) {
                setTransactions(result.data);
            }
            setLoading(false);
        }
        fetchTransactions();
    }, []);

    const filteredTransactions = transactions.filter(t =>
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (type: string) => {
        switch (type) {
            case "DEPOSIT": return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
            case "PAYOUT": return <ArrowUpRight className="w-5 h-5 text-red-500" />;
            case "REFUND": return <RefreshCcw className="w-5 h-5 text-blue-500" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SUCCESS": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "PENDING": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "FAILED": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Transactions</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Track your financial history and payments.
                    </p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading transactions...</div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                            No transactions found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full bg-white dark:bg-neutral-800 shadow-sm`}>
                                            {getIcon(tx.type)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900 dark:text-white">
                                                {tx.description || tx.type}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                <span>{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</span>
                                                {tx.reference && (
                                                    <span className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                                        {tx.reference}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-600 dark:text-green-400' : 'text-neutral-900 dark:text-white'}`}>
                                            {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </p>
                                        <Badge variant="secondary" className={`mt-1 text-xs ${getStatusColor(tx.status)}`}>
                                            {tx.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
