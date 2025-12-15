"use client";

import { requestPasswordReset } from "@/app/(app)/actions/auth";
import { Mail } from "lucide-react";
import FormInput from "./FormInput";
import { useEffect, useRef, useState } from "react";
import { showToast } from "@/lib/utils";
import { ActionResult } from "@/app/(app)/actions/auth"; // Import ActionResult type

const ForgotPasswordForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState<ActionResult | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (formState?.status === 'error') {
      showToast('error', formState.message, formState.error);
    } else if (formState?.status === 'success') {
      showToast('success', formState.message);
    }
  }, [formState]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const result = await requestPasswordReset(formData);
      setFormState(result);
    }
    setPending(false);
  };

  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 lg:p-10 w-full animate-in fade-in zoom-in duration-500">
      <div className="mb-8 text-center lg:text-left">
        <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">Forgot Password?</h4>
        <p className="text-gray-700 dark:text-gray-200 text-lg font-medium drop-shadow-sm">
          Enter your email to reset your password.
        </p>
      </div>
      <form ref={formRef} onSubmit={handleSubmit}>
        <FormInput
          type="email"
          name="email"
          placeholder="Email"
          icon={<Mail />}
          id="email"
          className="bg-white/50 border-white/40 focus:bg-white/80"
        />
        <button
          type="submit"
          className="btn btn-primary justify-center text-sm btn-sm px-3 py-4 w-full rounded-xl shadow-lg hover:shadow-primary-500/30 transition-all font-bold"
          disabled={pending}
        >
          {pending ? 'Sending...' : 'Continue'}
        </button>

        <div className="text-center mt-8">
          <a href="/login" className="text-primary-700 dark:text-primary-400 font-bold hover:underline">
            Back to Sign In
          </a>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
