"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { markProjectAsComplete, confirmProjectCompletion } from "@/app/(app)/actions/projects";
import { toast } from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ProjectActionsProps {
    projectId: string;
    isEmployer: boolean;
    projectStatus: string;
}

export default function ProjectActions({ projectId, isEmployer, projectStatus }: ProjectActionsProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleMarkComplete = async () => {
        setIsLoading(true);
        try {
            const res = await markProjectAsComplete(projectId);
            if (res.error) toast.error(res.error);
            else toast.success("Project marked as complete. Awaiting employer confirmation.");
        } catch (e) {
            toast.error("Failed to update project.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmCompletion = async () => {
        setIsLoading(true);
        try {
            const res = await confirmProjectCompletion(projectId);
            if (res.error) toast.error(res.error);
            else toast.success("Project confirmed and funds released!");
        } catch (e) {
            toast.error("Failed to confirm completion.");
        } finally {
            setIsLoading(false);
        }
    };

    if (projectStatus === "COMPLETED") {
        return <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-center font-medium">Project Completed</div>;
    }

    if (isEmployer) {
        if (projectStatus === "PENDING_COMPLETION") {
            return (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Completion & Release Funds
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Project Completion?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to confirm this project as complete? This will release the funds held in escrow to the scientist. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmCompletion} className="bg-green-600 hover:bg-green-700">
                                Confirm & Release
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
        }
        return null; // Employer waits for scientist
    } else {
        // Scientist
        if (projectStatus === "ACTIVE") {
            return (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Mark as Work Completed
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Mark Project as Complete?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you have completed all tasks and deliverables? The employer will be notified to review and confirm.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleMarkComplete}>
                                Yes, Mark as Complete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
        }
        if (projectStatus === "PENDING_COMPLETION") {
            return (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-lg text-center font-medium">
                    Awaiting Employer Confirmation
                </div>
            );
        }
    }

    return null;
}
