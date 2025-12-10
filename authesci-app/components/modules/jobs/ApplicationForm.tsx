"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitApplication } from "@/app/(app)/actions/applications";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Sparkles, UserCheck, Info, Loader2, ArrowRight, ExternalLink, FileText, UploadCloud } from "lucide-react";
import { AiFillButton } from "@/components/ui/AiFillButton";
import { generateCoverLetterAction } from "@/app/(app)/actions/ai";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const applicationSchema = z.object({
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
  screeningAnswers: z.record(z.string()).optional(),
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
  screeningQuestions?: string[];
}

export function ApplicationForm({ jobId, userProfile, screeningQuestions = [] }: ApplicationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [useProfileResume, setUseProfileResume] = useState(!!userProfile?.cvUrl);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
      screeningAnswers: {},
    },
  });

  const handleAiFill = async () => {
    setIsGeneratingAi(true);
    try {
      const result = await generateCoverLetterAction(jobId);
      if (result.error) {
        toast.error(result.error);
      } else if (result.coverLetter) {
        setValue("coverLetter", result.coverLetter);
        toast.success("Cover letter generated successfully!");
      }
    } catch (error) {
      toast.error("Something went wrong while generating the cover letter.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  async function onSubmit(data: ApplicationFormValues) {
    if (!file && !useProfileResume) {
      toast.error("Please upload your resume or use the one from your profile.");
      return;
    }

    // Validate screening answers if questions exist
    if (screeningQuestions.length > 0) {
      const answers = data.screeningAnswers || {};
      const missingAnswers = screeningQuestions.some((_, index) => !answers[index] || answers[index].trim() === "");
      if (missingAnswers) {
        toast.error("Please answer all screening questions.");
        return;
      }
    }

    setIsSubmitLoading(true);

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("coverLetter", data.coverLetter);
    if (file) {
      formData.append("resume", file);
    }

    if (data.screeningAnswers) {
      // Map answers to questions for better context
      const formattedAnswers = screeningQuestions.map((q, i) => ({
        question: q,
        answer: data.screeningAnswers?.[i] || ""
      }));
      formData.append("screeningAnswers", JSON.stringify(formattedAnswers));
    }

    startTransition(async () => {
      try {
        const result = await submitApplication({ status: "idle", message: "" }, formData);

        if (result.status === "success") {
          toast.success(result.message);
          router.push("/jobs"); // Redirect to jobs list or dashboard
        } else {
          toast.error(result.message);
          setIsSubmitLoading(false);
        }
      } catch (error) {
        toast.error("An unexpected error occurred.");
        setIsSubmitLoading(false);
      }
    });
  }

  const onInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
    if (errors.coverLetter) {
        toast.error(errors.coverLetter.message);
    } else {
        toast.error("Please fill in all required fields correctly.");
    }
  };

  return (
    <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-white dark:bg-slate-950">
      <CardHeader className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 px-6 py-5 flex flex-row items-center justify-between sticky top-0 z-10 transition-colors">
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Complete Application</CardTitle>
        {userProfile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm">
                  {userProfile.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt="Profile" className="rounded-full w-6 h-6 object-cover" />
                  ) : (
                    <div className="rounded-full bg-blue-600 text-white flex items-center justify-center w-6 h-6 text-[10px] font-bold">
                      {userProfile.fullName?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="font-semibold hidden sm:inline">Profile Attached</span>
                  <Info className="text-blue-500" size={14} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white border-0">
                <p>Your profile information will be included with this application.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">

          {screeningQuestions?.length > 0 && (
            <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Screening Questions</h3>
                <Badge variant="secondary" className="text-xs font-normal">Required</Badge>
              </div>
              <div className="space-y-4">
                {screeningQuestions.map((question, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2 border border-slate-100 dark:border-slate-800 group focus-within:border-blue-400 transition-colors">
                    <Label className="font-medium text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                      {question} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Type your answer here..."
                      {...register(`screeningAnswers.${index}`)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="font-bold flex items-center gap-2 text-base text-slate-900 dark:text-white">
                <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                Cover Letter
              </Label>
              <div className="flex items-center gap-2">
                {isGeneratingAi && <span className="text-xs text-slate-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Writing...</span>}
                <AiFillButton
                  onClick={handleAiFill}
                  disabled={isGeneratingAi}
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                  className="border-0 text-white shadow-sm hover:shadow-md transition-shadow h-8 px-3 text-xs"
                />
              </div>
            </div>
            <div className="relative">
              <Textarea
                className="min-h-[200px] resize-y p-4 text-base leading-relaxed bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 placeholder:text-slate-400"
                placeholder="Tell the employer why you are a perfect fit for this role..."
                {...register("coverLetter")}
              />
              <div className="text-right mt-1">
                <span className="text-xs text-slate-400">Markdown Supported</span>
              </div>
            </div>
            {errors.coverLetter && <p className="text-red-500 text-sm flex items-center gap-1 mt-1 animate-in slide-in-from-top-1"><Info size={12} /> {errors.coverLetter.message}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="font-bold text-base text-slate-900 dark:text-white">Resume / CV</Label>
              {userProfile?.cvUrl && (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setUseProfileResume(!useProfileResume);
                    setFile(null);
                  }}
                  className="h-auto p-0 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-semibold text-sm"
                >
                  {useProfileResume ? "Upload a different file" : "Use profile resume"}
                </Button>
              )}
            </div>

            {useProfileResume && userProfile?.cvUrl ? (
              <div className="flex items-center gap-4 p-4 bg-green-50/50 dark:bg-green-900/10 border border-green-200/60 dark:border-green-800 rounded-xl transition-all h-24">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <UserCheck size={24} />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-green-900 dark:text-green-300">Resume from Profile</p>
                  <a href={userProfile.cvUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 dark:text-green-400 hover:underline inline-flex items-center gap-1 mt-0.5">
                    View Document <ExternalLink size={12} />
                  </a>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUseProfileResume(false)}
                  className="bg-white dark:bg-slate-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  Change
                </Button>
              </div>
            ) : (
              <div
                className={`group border-2 border-dashed rounded-xl h-40 flex items-center justify-center text-center transition-all duration-300 cursor-pointer ${file ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/10" : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900"}`}
              >
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    if (e.target.files?.[0]) setUseProfileResume(false);
                  }}
                />
                <label htmlFor="resume-upload" className="w-full h-full flex flex-col items-center justify-center">
                  {file ? (
                    <div className="animate-in zoom-in-50 duration-300">
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-blue-600 flex items-center justify-center mb-2 mx-auto shadow-sm border border-blue-100 dark:border-slate-700">
                        <FileText size={24} />
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">{file.name}</p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ) : (
                    <div className="group-hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3 mx-auto group-hover:bg-blue-100 group-hover:text-blue-500 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400 transition-colors">
                        <UploadCloud size={24} />
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Click to upload or drag and drop</p>
                      <span className="text-sm text-slate-400 dark:text-slate-500">PDF, DOC, DOCX up to 5MB</span>
                    </div>
                  )}
                </label>
              </div>
            )}
          </div>

          <div className="pt-4 border-t dark:border-slate-800">
            <Button
              type="submit"
              disabled={isSubmitLoading}
              className="w-full h-12 text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {isSubmitLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Sending Application...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </Button>
            <p className="text-center text-slate-400 text-xs mt-4">
              By submitting this application, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </form>

      </CardContent>
    </Card>
  );
}
