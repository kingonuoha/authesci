"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyJobPayment } from "@/app/actions/jobs";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("No payment reference found.");
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyJobPayment(reference, id);
        if (result.success) {
          setStatus("success");
          setMessage("Payment verified! Your job is now active.");
          // Optional: Redirect after a delay
          setTimeout(() => router.push("/employer/jobs"), 3000);
        } else {
          setStatus("error");
          setMessage(result.message || "Payment verification failed.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    };

    verify();
  }, [reference, id, router]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-10">
      {status === "loading" && (
        <>
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
          <p className="text-neutral-500 dark:text-neutral-400">{message}</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Success!</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">{message}</p>
          <Link 
            href="/employer/jobs"
            className="btn btn-primary px-6 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
          >
            Go to My Jobs
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">{message}</p>
          <Link 
            href="/employer/jobs"
            className="btn btn-outline-secondary px-6 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700 transition-colors"
          >
            Return to Jobs
          </Link>
        </>
      )}
    </div>
  );
}
