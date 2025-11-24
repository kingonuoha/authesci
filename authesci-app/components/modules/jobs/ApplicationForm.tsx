"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitApplication } from "@/app/actions/applications";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Sparkles, UserCheck, Info } from "lucide-react";
import { AiFillButton } from "@/components/ui/AiFillButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const applicationSchema = z.object({
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  jobId: string;
  userProfile?: {
    fullName: string;
    role: string;
    cvUrl?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export function ApplicationForm({ jobId, userProfile }: ApplicationFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [useProfileResume, setUseProfileResume] = useState(!!userProfile?.cvUrl);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
    },
  });

  const handleAiFill = () => {
    // Placeholder for AI functionality
    toast.success("AI Cover Letter generation coming soon!");
    setValue("coverLetter", `Dear Hiring Manager,\n\nI am writing to express my strong interest in this position. With my background in ${userProfile?.role || 'this field'} and passion for scientific innovation, I believe I would be a valuable asset to your team.\n\n[AI will generate more personalized content here based on your profile]\n\nSincerely,\n${userProfile?.fullName || 'Applicant'}`);
  };

  async function onSubmit(data: ApplicationFormValues) {
    if (!file && !useProfileResume) {
      toast.error("Please upload your resume or use the one from your profile.");
      return;
    }

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("coverLetter", data.coverLetter);
    if (file) {
      formData.append("resume", file);
    }

    startTransition(async () => {
      const result = await submitApplication({ status: "idle", message: "" }, formData);

      if (result.status === "success") {
        toast.success(result.message);
        router.push("/jobs"); // Redirect to jobs list or dashboard
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="card h-full p-0 rounded-xl border-0 overflow-hidden">
      <div className="card-header border-b border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 py-4 px-6 flex justify-between items-center">
        <h6 className="text-lg font-semibold mb-0">Submit Your Application</h6>
        {userProfile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100 cursor-help">
                  {userProfile.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt="Profile" className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-[8px] font-bold text-blue-700">
                      {userProfile.fullName?.charAt(0) || "U"}
                    </div>
                  )}
                  <span>Profile Attached</span>
                  <Info className="w-3 h-3 text-blue-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your profile information will be included with this application.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="card-body p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="form-label mb-0">Cover Letter</label>
              <AiFillButton onClick={handleAiFill} />
            </div>
            <textarea
              className="form-control min-h-[200px]"
              placeholder="Why are you a good fit for this role?"
              {...register("coverLetter")}
            ></textarea>
            {errors.coverLetter && <span className="form-error-message">{errors.coverLetter.message}</span>}
          </div>

          <div>
            <label className="form-label flex justify-between items-center">
              <span>Resume (PDF/Word)</span>
              {userProfile?.cvUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setUseProfileResume(!useProfileResume);
                    setFile(null);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  {useProfileResume ? "Upload new resume" : "Use profile resume"}
                </button>
              )}
            </label>
            
            {useProfileResume && userProfile?.cvUrl ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Resume attached from profile</p>
                  <a href={userProfile.cvUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline hover:no-underline opacity-80">
                    View current resume
                  </a>
                </div>
                <button 
                  type="button" 
                  onClick={() => setUseProfileResume(false)}
                  className="text-xs bg-white border border-green-200 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    if (e.target.files?.[0]) setUseProfileResume(false);
                  }}
                />
                <p className="text-sm text-neutral-500 mt-1">Max file size: 5MB</p>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary text-sm btn-sm px-4 py-3 w-full rounded-lg flex items-center justify-center gap-2"
            >
              {isPending ? "Submitting Application..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
