"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export function SecurityTab() {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsChangingPassword(true);
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
            password: passwordForm.newPassword,
        });

        setIsChangingPassword(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password updated successfully");
            setPasswordForm({ newPassword: "", confirmPassword: "" });
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Change Password</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Ensure your account is using a long, random password to stay secure.</p>
            </div>

            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        New Password
                    </label>
                    <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center"
                >
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                </button>
            </form>

            <div className="pt-8 border-t border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>

                <button
                    onClick={() => toast.error("Account deletion is not yet implemented.")}
                    className="border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-md font-medium text-sm transition-colors"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
}
