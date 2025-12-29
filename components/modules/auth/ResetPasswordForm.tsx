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
      <div className="bg-white/50 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 lg:p-10 w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center flex flex-col items-center justify-center py-10">
          <Loader className="animate-spin h-8 w-8 text-blue-500 mb-4" />
          <p className="text-gray-800 dark:text-gray-200 font-medium">Validating your reset token...</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">You will be redirected shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 lg:p-10 w-full animate-in fade-in zoom-in duration-500">
      <div className="mb-8 text-center lg:text-left">
        <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">Reset Password</h4>
        <p className="text-gray-700 dark:text-gray-200 text-lg font-medium drop-shadow-sm">
          Please set your new password.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <FormInput
          type="password"
          name="password"
          placeholder="New Password"
          icon={<Lock />}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/50 border-white/40 focus:bg-white/80"
        />
        <FormInput
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          icon={<Lock />}
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-white/50 border-white/40 focus:bg-white/80"
        />
        <button
          type="submit"
          className="btn btn-primary justify-center text-sm btn-sm px-3 py-4 w-full rounded-xl mt-8 shadow-lg hover:shadow-primary-500/30 transition-all font-bold"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;