"use client";

import { Lock, Loader } from "lucide-react";
import FormInput from "./FormInput";
import { useEffect, useState } from "react";
import { showToast } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ResetPasswordForm = () => {
  const router = useRouter();
  const [hasSetSession, setHasSetSession] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ path: string[]; message: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // If a session is detected, show the form. This is less strict than
      // checking for PASSWORD_RECOVERY, but helps in debugging if the event
      // is not firing as expected.
      if (session) {
        setHasSetSession(true);
      }
    });

    // Also check for errors in the URL hash, in case the link is invalid.
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDescription = params.get("error_description");
      if (errorDescription) {
        showToast("error", "Password Reset Error", errorDescription);
        router.push("/login");
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [isMounted, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError({ path: ["confirmPassword"], message: "Passwords do not match." });
      return;
    }

    if (!password) {
      setError({ path: ["password"], message: "Password cannot be empty." });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      showToast("error", "Password reset failed", updateError.message);
      setLoading(false);
      return;
    }

    showToast("success", "Password updated successfully!", "You can now log in with your new password.");

    // Sign out and redirect to login
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!hasSetSession) {
    return (
      <div className="text-center flex flex-col items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-blue-500 mb-4" />
        <p>Validating your reset token...</p>
        <p>You will be redirected shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-6 text-secondary-light">Please set your new password.</p>
      <FormInput
        type="password"
        name="password"
        placeholder="New Password"
        icon={<Lock />}
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <FormInput
        type="password"
        name="confirmPassword"
        placeholder="Confirm New Password"
        icon={<Lock />}
        id="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button
        type="submit"
        className="btn btn-primary justify-center text-sm btn-sm px-3 py-4 w-full rounded-xl mt-8"
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
};

export default ResetPasswordForm;