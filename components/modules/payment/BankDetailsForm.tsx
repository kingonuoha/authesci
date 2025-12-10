"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveBankDetails, resolveAccount, deleteBankDetails } from "@/app/(app)/actions/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle, Trash2, Building2, CreditCard } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from 'sweetalert2';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

type Bank = {
  name: string;
  code: string;
  id: number;
  slug?: string;
};

interface BankDetailsFormProps {
  banks: Bank[];
  initialData?: {
    bankName?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
  };
}

const initialState = {
  status: "idle" as const,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        "Save Bank Details"
      )}
    </Button>
  );
}

export default function BankDetailsForm({ banks, initialData }: BankDetailsFormProps) {
  const [state, formAction] = useActionState(saveBankDetails, initialState);
  const [selectedBank, setSelectedBank] = useState<string>(
    banks.find((b) => b.name === initialData?.bankName)?.code || ""
  );
  const [open, setOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || "");
  const [accountName, setAccountName] = useState(initialData?.accountName || "");
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [isViewMode, setIsViewMode] = useState(!!initialData?.accountNumber);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  useEffect(() => {
    const resolve = async () => {
      if (selectedBank && accountNumber.length === 10) {
        // Only resolve if account number has changed from initial or if we don't have a name
        if (
          accountNumber === initialData?.accountNumber &&
          selectedBank === banks.find((b) => b.name === initialData?.bankName)?.code &&
          initialData?.accountName
        ) {
          setAccountName(initialData.accountName);
          return;
        }

        setIsResolving(true);
        setResolveError("");
        setAccountName(""); // Clear previous name while resolving

        const result = await resolveAccount(accountNumber, selectedBank);

        setIsResolving(false);
        if (result.success) {
          setAccountName(result.account_name);
        } else {
          setResolveError(result.message || "Could not resolve account");
          setAccountName("");
        }
      }
    };

    const timeoutId = setTimeout(resolve, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [selectedBank, accountNumber, initialData, banks]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Remove Bank Details?',
      text: "You won't be able to receive payments until you add a new account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
      customClass: {
        popup: 'dark:bg-neutral-800 dark:text-white',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-neutral-300'
      }
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      const result = await deleteBankDetails();
      if (result.status === "success") {
        toast.success(result.message);
        setSelectedBank("");
        setAccountNumber("");
        setAccountName("");
        setIsViewMode(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete bank details");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedBankName = banks.find((b) => b.code === selectedBank)?.name || "";

  if (isViewMode && initialData?.accountNumber) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 p-6">
        <div className="absolute top-0 right-0 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex flex-col h-full justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm text-primary-600 overflow-hidden">
              {banks.find(b => b.name === initialData.bankName)?.slug ? (
                <img
                  src={`https://nigerianbanks.xyz/logo/${banks.find(b => b.name === initialData.bankName)?.slug}.png`}
                  alt={initialData.bankName || "Bank"}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>';
                  }}
                />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">Bank Name</p>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{initialData.bankName}</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">Account Name</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">{initialData.accountName}</p>
            </div>

            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">Account Number</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-mono font-semibold text-neutral-900 dark:text-white tracking-widest">
                  {initialData.accountNumber}
                </p>
                <div className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase">
                  Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="bankName" value={selectedBankName} />
      <input type="hidden" name="bankCode" value={selectedBank} />
      <input type="hidden" name="accountName" value={accountName} />

      <div className="space-y-2">
        <Label htmlFor="bank">Bank Name</Label>
        <div className="relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedBank
                  ? banks.find((bank) => bank.code === selectedBank)?.name
                  : "Select your bank..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-md">
              <Command className="bg-transparent">
                <CommandInput placeholder="Search bank..." />
                <CommandList>
                  <CommandEmpty>No bank found.</CommandEmpty>
                  <CommandGroup>
                    {banks.map((bank) => (
                      <CommandItem
                        key={bank.id}
                        value={bank.name}
                        onSelect={() => {
                          setSelectedBank(bank.code);
                          setOpen(false);
                        }}
                        className="aria-selected:bg-neutral-100 dark:aria-selected:bg-neutral-800"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedBank === bank.code ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {bank.slug && (
                          <img
                            src={`https://nigerianbanks.xyz/logo/${bank.slug}.png`}
                            alt={bank.name}
                            className="w-6 h-6 mr-2 object-contain rounded-full bg-white"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        {bank.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          name="accountNumber"
          placeholder="0123456789"
          value={accountNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
            setAccountNumber(val);
          }}
          maxLength={10}
        />
      </div>

      <div className="p-4 my-3   rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Account Name
          </span>
        </div>

        <div className="min-h-[24px]">
          {isResolving ? (
            <Skeleton className="h-6 w-3/4" />
          ) : accountName ? (
            <div className="flex items-center text-success-600 gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              {accountName}
            </div>
          ) : resolveError ? (
            <div className="flex items-center text-destructive gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {resolveError}
            </div>
          ) : (
            <span className="text-neutral-400 text-sm italic">
              Enter bank and account number to verify
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <SubmitButton />
      </div>
    </form>
  );
}
