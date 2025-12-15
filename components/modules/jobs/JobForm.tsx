"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createJob, updateJob } from "@/app/(app)/actions/jobs";
import { JobType, Job } from "@prisma/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "NGN";

const SCIENTIFIC_CATEGORIES = [
  "Academic Research",
  "Biotechnology",
  "Bioinformatics",
  "Chemistry",
  "Clinical Research",
  "Data Science",
  "Engineering",
  "Environmental Science",
  "Genetics",
  "Laboratory Technology",
  "Microbiology",
  "Neuroscience",
  "Pharmaceuticals",
  "Physics",
  "Public Health",
  "Science Communication",
];

// Validation limits based on currency
const MIN_AMOUNT = CURRENCY === "NGN" ? 10000 : 20;
const MAX_AMOUNT = CURRENCY === "NGN" ? 4000000 : 500000;

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string().min(10, "Requirements are required"),
  category: z.string().optional(),
  jobType: z.nativeEnum(JobType),
  projectType: z.enum(["Short-term", "Long-term", "One-time task"]),
  location: z.string().min(1, "Location is required"),
  salaryMode: z.enum(["FIXED", "RANGE"]),
  salaryFixed: z.string().optional(),
  // ... (omitted parts of schema for brevity, will be handled by replace block context)
  // Note: I will split this into two replacements if needed, but the tool supports contiguous block.
  // Let's do the schema update first, then the UI.
  // Actually, I'll use multi_replace.

  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  screeningQuestions: z.array(z.object({ question: z.string().min(1, "Question cannot be empty") })).optional(),
}).superRefine((data, ctx) => {
  if (data.salaryMode === "FIXED") {
    if (!data.salaryFixed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Salary is required",
        path: ["salaryFixed"],
      });
    } else {
      const amount = parseFloat(data.salaryFixed.replace(/,/g, ""));
      if (isNaN(amount)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid amount",
          path: ["salaryFixed"],
        });
      } else if (amount < MIN_AMOUNT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Minimum salary is ${CURRENCY} ${MIN_AMOUNT.toLocaleString()}`,
          path: ["salaryFixed"],
        });
      } else if (amount > MAX_AMOUNT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Maximum salary is ${CURRENCY} ${MAX_AMOUNT.toLocaleString()}`,
          path: ["salaryFixed"],
        });
      }
    }
  } else {
    // Range Mode
    let minVal = 0;
    let maxVal = 0;

    if (!data.salaryMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Min salary is required",
        path: ["salaryMin"],
      });
    } else {
      minVal = parseFloat(data.salaryMin.replace(/,/g, ""));
      if (isNaN(minVal)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid amount",
          path: ["salaryMin"],
        });
      } else if (minVal < MIN_AMOUNT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Min salary must be at least ${CURRENCY} ${MIN_AMOUNT.toLocaleString()}`,
          path: ["salaryMin"],
        });
      }
    }

    if (!data.salaryMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Max salary is required",
        path: ["salaryMax"],
      });
    } else {
      maxVal = parseFloat(data.salaryMax.replace(/,/g, ""));
      if (isNaN(maxVal)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid amount",
          path: ["salaryMax"],
        });
      } else if (maxVal > MAX_AMOUNT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Max salary cannot exceed ${CURRENCY} ${MAX_AMOUNT.toLocaleString()}`,
          path: ["salaryMax"],
        });
      }
    }

    if (data.salaryMin && data.salaryMax && minVal >= maxVal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Max salary must be greater than Min salary",
        path: ["salaryMax"],
      });
    }
  }
});

type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  initialData?: Job;
  jobId?: string;
}

export function JobForm({ initialData, jobId }: JobFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Determine initial salary mode and values
  let initialMode: "FIXED" | "RANGE" = "FIXED";
  let initialFixed = "";
  let initialMin = "";
  let initialMax = "";

  if (initialData?.salaryRange) {
    if (initialData.salaryRange.includes("-")) {
      initialMode = "RANGE";
      const parts = initialData.salaryRange.split("-");
      if (parts.length === 2) {
        // Extract numbers
        initialMin = parts[0].replace(/[^0-9.]/g, "");
        initialMax = parts[1].replace(/[^0-9.]/g, "");
      }
    } else {
      initialMode = "FIXED";
      initialFixed = initialData.salaryRange.replace(/[^0-9.]/g, "");
    }
  }

  const [salaryMode, setSalaryMode] = useState<"FIXED" | "RANGE">(initialMode);

  // Parse initial screening questions if they exist
  const initialQuestions = initialData?.screeningQuestions
    ? (initialData.screeningQuestions as string[]).map(q => ({ question: q }))
    : [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      requirements: initialData?.requirements?.join("\n") || "",
      category: initialData?.category || "",
      jobType: initialData?.jobType || JobType.REMOTE,
      projectType: (initialData as any)?.projectType || "Short-term",
      location: initialData?.location || "",
      salaryMode: initialMode,
      salaryFixed: initialFixed,
      salaryMin: initialMin,
      salaryMax: initialMax,
      screeningQuestions: initialQuestions,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "screeningQuestions",
  });

  // Update form value when mode changes to ensure validation works correctly
  const handleModeChange = (mode: "FIXED" | "RANGE") => {
    setSalaryMode(mode);
    setValue("salaryMode", mode);
  };

  async function onSubmit(data: JobFormValues) {
    const formData = new FormData();

    // Construct salary string and determine payment amount
    let finalSalary = "";
    let paymentAmount = "0";

    if (data.salaryMode === "FIXED") {
      const fixed = data.salaryFixed;
      if (fixed) {
        finalSalary = `${CURRENCY} ${fixed}`;
        paymentAmount = fixed.replace(/,/g, "");
      }
    } else {
      const min = data.salaryMin;
      const max = data.salaryMax;
      if (min && max) {
        finalSalary = `${CURRENCY} ${min} - ${CURRENCY} ${max}`;
        paymentAmount = max.replace(/,/g, "");
      }
    }

    // Add all fields to formData
    Object.entries(data).forEach(([key, value]) => {
      if (key === "salaryFixed" || key === "salaryMin" || key === "salaryMax" || key === "salaryMode" || key === "screeningQuestions") {
        // Skip these, we handle them separately
      } else if (value) {
        formData.append(key, value as string);
      }
    });

    if (finalSalary) formData.append("salaryRange", finalSalary);

    // Append payment amount for backend to use
    formData.append("paymentAmount", paymentAmount);

    // Handle screening questions
    if (data.screeningQuestions && data.screeningQuestions.length > 0) {
      const questions = data.screeningQuestions.map(q => q.question);
      formData.append("screeningQuestions", JSON.stringify(questions));
    }

    if (jobId) {
      formData.append("jobId", jobId);
    }

    startTransition(async () => {
      let result;
      if (jobId) {
        result = await updateJob({ status: "idle", message: "" }, formData);
      } else {
        result = await createJob({ status: "idle", message: "" }, formData);
      }

      if (result.status === "success") {
        toast.success(result.message);
        if (result.paystackUrl) {
          window.location.href = result.paystackUrl;
        } else {
          router.push("/employer/jobs");
          router.refresh();
        }
      } else {
        toast.error(result.message);
        if (result.errors) {
          console.error(result.errors);
        }
      }
    });
  }

  return (
    <div className="card h-full p-0 rounded-xl border-0 overflow-hidden">
      <div className="card-header border-b border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 py-4 px-6">
        <h6 className="text-lg font-semibold mb-0">{jobId ? "Edit Job" : "Post a New Job"}</h6>
      </div>
      <div className="card-body p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <label className="form-label">Job Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Senior Research Scientist"
              {...register("title")}
            />
            {errors.title && <span className="text-danger-600">{errors.title.message}</span>}
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="form-label">Job Type <span className="text-red-500">*</span></label>
            <select className="form-select w-full" {...register("jobType")}>
              {Object.values(JobType).map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")}
                </option>
              ))}
            </select>
            {errors.jobType && <span className="text-danger-600">{errors.jobType.message}</span>}
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="form-label">Project Type</label>
            <select className="form-select w-full" {...register("projectType")}>
              <option value="Short-term">Short-term</option>
              <option value="Long-term">Long-term</option>
              <option value="One-time task">One-time task</option>
            </select>
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="form-label">Category (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Molecular Biology"
              list="category-suggestions"
              {...register("category")}
            />
            <datalist id="category-suggestions">
              {SCIENTIFIC_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            {errors.category && <span className="text-danger-600">{errors.category.message}</span>}
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="form-label">Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Lagos, Nigeria"
              {...register("location")}
            />
            {errors.location && <span className="text-danger-600">{errors.location.message}</span>}
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className="form-label flex justify-between items-center">
              <span>Salary <span className="text-red-500">*</span></span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  className={`px-2 py-1 rounded ${salaryMode === "FIXED" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"}`}
                  onClick={() => handleModeChange("FIXED")}
                >
                  Fixed
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded ${salaryMode === "RANGE" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"}`}
                  onClick={() => handleModeChange("RANGE")}
                >
                  Range
                </button>
              </div>
            </label>

            {salaryMode === "FIXED" ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">{CURRENCY}</span>
                <input
                  type="number"
                  className="form-control form-padding-left"
                  placeholder="e.g. 150000"
                  {...register("salaryFixed")}
                />
                {errors.salaryFixed && <span className="text-danger-600">{errors.salaryFixed.message}</span>}
              </div>
            ) : (
              <div className="flex gap-2 items-start">
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">{CURRENCY}</span>
                  <input
                    type="number"
                    className="form-control form-padding-left"
                    placeholder="Min"
                    {...register("salaryMin")}
                  />
                  {errors.salaryMin && <span className="text-danger-600">{errors.salaryMin.message}</span>}
                </div>
                <span className="text-neutral-400 mt-2">-</span>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">{CURRENCY}</span>
                  <input
                    type="number"
                    className="form-control form-padding-left"
                    placeholder="Max"
                    {...register("salaryMax")}
                  />
                  {errors.salaryMax && <span className="text-danger-600">{errors.salaryMax.message}</span>}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-12">
            <label className="form-label">Description <span className="text-red-500">*</span></label>
            <textarea
              className="form-control min-h-[150px]"
              placeholder="Describe the research project details, methodology, and expected outcomes..."
              {...register("description")}
            ></textarea>
            {errors.description && <span className="text-danger-600">{errors.description.message}</span>}
          </div>

          <div className="col-span-12">
            <label className="form-label">Requirements (One per line) <span className="text-red-500">*</span></label>
            <textarea
              className="form-control min-h-[150px]"
              placeholder="- PhD in Bioinformatics or related field&#10;- Experience with NGS data analysis&#10;- Proficiency in R or Python"
              {...register("requirements")}
            ></textarea>
            {errors.requirements && <span className="text-danger-600">{errors.requirements.message}</span>}
          </div>

          <div className="col-span-12">
            <div className="flex justify-between items-center mb-2">
              <label className="form-label mb-0">Screening Questions (Optional)</label>
              <button
                type="button"
                onClick={() => append({ question: "" })}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={index === 0 ? "e.g. Have you published any papers in the last 2 years?" : `Question ${index + 1}`}
                    {...register(`screeningQuestions.${index}.question` as const)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {errors.screeningQuestions && <span className="text-danger-600">{errors.screeningQuestions.message}</span>}
            </div>
          </div>

          <div className="col-span-12 mt-4">
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary text-sm btn-sm px-4 py-3 w-full md:w-auto rounded-lg flex items-center justify-center gap-2"
            >
              {isPending && <span className="loading loading-spinner loading-sm"></span>}
              {isPending ? (jobId ? "Updating Job..." : "Creating Job...") : (jobId ? "Update Job" : "Post Job")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
