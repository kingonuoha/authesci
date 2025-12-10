"use client";

import { verifyPayment } from "@/app/(app)/actions/payment";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { Suspense } from "react";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [projectId, setProjectId] = useState<string | null>(null);
  const verifiedRef = useRef(false);

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) {
      if (!verifiedRef.current) {
        setStatus("error");
        toast.error("Invalid payment reference");
      }
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verify = async () => {
      try {
        const result = await verifyPayment(reference);

        if (result.success) {
          setStatus("success");
          toast.success("Payment successful! Project created.");
          if (result.projectId) {
            setProjectId(result.projectId);
            // Optional: Auto redirect after a few seconds
            setTimeout(() => {
              router.push(`/project/${result.projectId}`);
            }, 3000);
          } else {
            router.push("/employer/dashboard");
          }
        } else {
          setStatus("error");
          toast.error(result.message || "Payment verification failed");
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
        toast.error("Payment verification failed");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">Verifying Payment</h2>
            <p className="text-neutral-500 dark:text-neutral-400">Please wait while we confirm your transaction...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">Payment Successful!</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">Your project has been funded and created.</p>
            <button
              onClick={() => router.push(projectId ? `/project/${projectId}` : "/employer/dashboard")}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              {projectId ? "Go to Project" : "Go to Dashboard"}
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">Verification Failed</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">We couldn't verify your payment. Please contact support if you were debited.</p>
            <button
              onClick={() => router.push("/employer/dashboard")}
              className="w-full py-2.5 px-4 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
        <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">Loading...</h2>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
