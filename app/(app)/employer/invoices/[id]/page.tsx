import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InvoiceActions from "@/components/modules/payment/InvoiceActions";
import Breadcrumb from "@/components/modules/Breadcrumb";
import { format } from "date-fns";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: {
        include: {
          employer: true,
        },
      },
      applicant: true,
    },
  });

  if (!application) {
    return <div>Application not found</div>;
  }

  const job = application.job;
  const applicant = application.applicant;
  const employer = job.employer;

  // Ensure current user is the employer
  if (employer.userId !== user.id) {
      redirect("/employer/dashboard");
  }

  const invoiceDate = new Date();
  const invoiceNumber = `INV-${application.id.substring(0, 8).toUpperCase()}`;

  let rangeLimits: { min: number; max: number } | undefined = undefined;
  let fixedPrice: number | undefined = undefined;

  if (job.salaryRange) {
    const numbers = job.salaryRange.match(/\d+/g)?.map(Number);
    if (numbers && numbers.length >= 2) {
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      if (min !== max) {
        rangeLimits = { min, max };
      } else {
        fixedPrice = min;
      }
    } else if (numbers && numbers.length === 1) {
      fixedPrice = numbers[0];
    }
  }

  return (
    <div className="dashboard-main-body">
      <Breadcrumb pageTitle="Invoice Review" activePage="Invoice" />

      <div className="card border-0">
        <div className="card-body py-[60px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
                <div className="max-w-[1174px] mx-auto w-full">
                    <div className="shadow-4 border border-neutral-200 dark:border-neutral-600 rounded-lg">
                    <div className="p-5 flex flex-wrap justify-between gap-3 border-b border-neutral-200 dark:border-neutral-600">
                        <div>
                        <h3 className="text-xl font-bold">Invoice #{invoiceNumber}</h3>
                        <p className="mb-1 text-sm">Date Issued: {format(invoiceDate, "dd/MM/yyyy")}</p>
                        </div>
                        <div className="text-right">
                        <h4 className="text-lg font-bold text-primary-600">Authesci Escrow</h4>
                        <p className="mb-1 text-sm">Secure Payment Protection</p>
                        </div>
                    </div>
                    <div className="py-7 px-5">
                        <div className="flex flex-wrap justify-between align-items-end gap-3">
                        <div>
                            <h6 className="text-base font-semibold mb-2">Bill To:</h6>
                            <table className="text-sm text-secondary-light">
                            <tbody>
                                <tr>
                                <td className="font-medium text-neutral-600 dark:text-neutral-200">Name</td>
                                <td className="ps-2">:{employer.fullName}</td>
                                </tr>
                                <tr>
                                <td className="font-medium text-neutral-600 dark:text-neutral-200">Email</td>
                                <td className="ps-2">:{employer.email}</td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        <div>
                            <h6 className="text-base font-semibold mb-2">Pay To (Escrow):</h6>
                            <table className="text-sm text-secondary-light">
                            <tbody>
                                <tr>
                                <td className="font-medium text-neutral-600 dark:text-neutral-200">Beneficiary</td>
                                <td className="ps-2">:{applicant.fullName}</td>
                                </tr>
                                <tr>
                                <td className="font-medium text-neutral-600 dark:text-neutral-200">Role</td>
                                <td className="ps-2">:Scientist</td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        </div>

                        <div className="mt-6">
                        <div className="table-responsive scroll-sm">
                            <table className="table bordered-table text-sm w-full text-left">
                            <thead className="bg-neutral-50 dark:bg-neutral-700">
                                <tr>
                                <th scope="col" className="p-3 text-sm font-semibold">Item</th>
                                <th scope="col" className="p-3 text-sm font-semibold">Description</th>
                                <th scope="col" className="p-3 text-sm font-semibold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-neutral-200 dark:border-neutral-600">
                                <td className="p-3">Project Funding</td>
                                <td className="p-3">
                                    <span className="block font-medium">{job.title}</span>
                                    <span className="text-xs text-neutral-500">Escrow deposit for project commencement</span>
                                </td>
                                <td className="p-3 text-right font-medium">
                                    {fixedPrice ? `NGN${fixedPrice.toLocaleString()}` : (job.salaryRange ? "To be determined" : "TBD")}
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
            
            <div className="col-span-12 lg:col-span-4">
                <div className="card h-full border-0 p-0 rounded-xl sticky top-6">
                    <div className="card-header border-b border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 py-4 px-6">
                        <h6 className="text-lg font-semibold mb-0">Payment Details</h6>
                    </div>
                    <div className="card-body p-6">
                        <InvoiceActions 
                            applicationId={application.id} 
                            salaryRange={job.salaryRange}
                            jobTitle={job.title}
                            rangeLimits={rangeLimits}
                            fixedPrice={fixedPrice}
                        />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
