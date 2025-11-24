import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BankDetailsForm from "@/components/modules/payment/BankDetailsForm";
import { getBanks } from "@/app/actions/payment";
import Breadcrumb from "@/components/modules/Breadcrumb";

export default async function WalletPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      role: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
    },
  });

  if (profile?.role !== 'SCIENTIST') {
      redirect(`/${profile?.role.toLowerCase()}/dashboard`);
  }

  const banks = await getBanks();

  return (
    <div className="dashboard-main-body">
      <Breadcrumb pageTitle="Wallet" activePage="Wallet" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <div className="card h-full border-0 p-0 rounded-xl">
            <div className="card-header border-b border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 py-4 px-6">
              <h6 className="text-lg font-semibold mb-0">Bank Details</h6>
            </div>
            <div className="card-body p-6">
              <BankDetailsForm
                banks={banks}
                initialData={{
                  bankName: profile?.bankName || null,
                  accountNumber: profile?.accountNumber || null,
                  accountName: profile?.accountName || null,
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-6">
            <div className="card h-full border-0 p-0 rounded-xl">
                 <div className="card-header border-b border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 py-4 px-6">
                    <h6 className="text-lg font-semibold mb-0">Wallet Information</h6>
                </div>
                <div className="card-body p-6">
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center shrink-0 text-primary-600 dark:text-primary-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                            </div>
                            <div>
                                <h6 className="text-base font-semibold mb-1">Secure Payments</h6>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Your bank details are securely stored and verified via Paystack. We use this account to send your earnings from completed projects.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-800 flex items-center justify-center shrink-0 text-yellow-600 dark:text-yellow-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                            </div>
                            <div>
                                <h6 className="text-base font-semibold mb-1">Platform Fees</h6>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Authesci charges a 10% platform fee on all project budgets. You will receive 90% of the agreed project amount directly to your bank account upon project completion.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
