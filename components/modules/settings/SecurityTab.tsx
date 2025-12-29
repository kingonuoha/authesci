"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { deleteUserAccount } from "@/app/actions/auth-actions";
import Swal from "sweetalert2";

export function SecurityTab() {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift") setIsShiftPressed(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Shift") setIsShiftPressed(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

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

    const handleDeleteClick = async () => {
        if (isShiftPressed) {
            // Secret forced delete path with SweetAlert
            const result = await Swal.fire({
                title: 'Are you absolutely sure?',
                text: "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                customClass: {
                    popup: 'dark:bg-neutral-800 dark:text-white',
                    title: 'dark:text-white',
                    htmlContainer: 'dark:text-neutral-300'
                }
            });

            if (result.isConfirmed) {
                const res = await deleteUserAccount();
                if (res?.error) {
                    toast.error(res.error);
                } else {
                    await Swal.fire({
                        title: 'Deleted!',
                        text: 'Your account has been deleted.',
                        icon: 'success',
                        customClass: {
                            popup: 'dark:bg-neutral-800 dark:text-white',
                            title: 'dark:text-white',
                            htmlContainer: 'dark:text-neutral-300'
                        }
                    });
                    window.location.href = "/";
                }
            }
        } else {
            // Standard behavior: mailto link
            window.location.href = "mailto:support@authesci.com?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20account%20associated%20with%20this%20email.";
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
                    onClick={handleDeleteClick}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-2 ${isShiftPressed
                        ? "bg-red-600 text-white hover:bg-red-700 shadow-md scale-105"
                        : "border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        }`}
                >
                    {isShiftPressed ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin hidden" /> {/* Hidden loader to maintain height if needed later */}
                            Permanently Delete Account
                        </>
                    ) : (
                        "Contact support to delete account"
                    )}
                </button>
            </div>
        </div>
    );
}
