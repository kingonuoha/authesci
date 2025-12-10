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
    <form ref={formRef} onSubmit={handleSubmit}>
      <FormInput type="email" name="email" placeholder="Email" icon={<Mail />} id="email" />
      <button
        type="submit"
        className="btn btn-primary justify-center text-sm btn-sm px-3 py-4 w-full rounded-xl"
        disabled={pending}
      >
        {pending ? 'Sending...' : 'Continue'}
      </button>

      <div className="text-center">
        <a href="/login" className="text-primary-600 font-bold mt-6 hover:underline">
          Back to Sign In
        </a>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
