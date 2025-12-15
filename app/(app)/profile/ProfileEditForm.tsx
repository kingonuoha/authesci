"use client";

import { useActionState, useState, useEffect } from "react";
import { Profile } from "@prisma/client";
import { updateProfile, ProfileState, uploadFile } from "@/app/(app)/actions/profile";
import { SkillsInput } from "@/components/modules/profile/SkillsInput";
import { FileUploader } from "@/components/modules/profile/FileUploader";
import { toast } from "react-hot-toast";
import { Loader2, Camera, X, Building2 } from "lucide-react";
import Image from "next/image";

import BankDetailsForm from "@/components/modules/payment/BankDetailsForm";
import dynamic from "next/dynamic";

const ImageCropper = dynamic(() => import("@/components/ui/ImageCropper"), {
  ssr: false,
});


interface ProfileEditFormProps {
  profile: Profile;
  onCancel: () => void;
  banks?: any[];
}

export function ProfileEditForm({ profile, onCancel, banks }: ProfileEditFormProps) {
  // ... existing state ...
  const [state, formAction, isPending] = useActionState(updateProfile, {
    status: "idle",
    message: "",
  } as ProfileState);

  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>((profile as any).companyLogoUrl || null);
  const [cvUrl, setCvUrl] = useState<string | null>(profile.cvUrl);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppingField, setCroppingField] = useState<"avatar" | "companyLogo" | null>(null);

  // Handle file upload
  const handleFileUpload = async (file: File | null, field: "avatar" | "cv" | "companyLogo") => {
    if (!file) return;

    // If it's an image (avatar or companyLogo), open cropper first
    if (field === "avatar" || field === "companyLogo") {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCroppingField(field);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
      return;
    }

    // For CV, proceed with upload directly
    await uploadFileToServer(file, field);
  };

  const uploadFileToServer = async (file: File | Blob, field: "avatar" | "cv" | "companyLogo") => {
    setIsUploading(true);
    const formData = new FormData();

    // If it's a blob (from cropper), append it with a filename
    if (file instanceof Blob && !(file instanceof File)) {
      formData.append("file", file, "cropped-image.jpg");
    } else {
      formData.append("file", file);
    }

    formData.append("folder", `authesci/profiles/${profile.userId}/${field}`);

    const result = await uploadFile(formData);
    setIsUploading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.url) {
      toast.success(`${field === "avatar" ? "Profile picture" : field === "companyLogo" ? "Company logo" : "CV"} uploaded. Save to apply changes.`);
      if (field === "avatar") {
        setAvatarUrl(result.url);
      } else if (field === "companyLogo") {
        setCompanyLogoUrl(result.url);
      } else {
        setCvUrl(result.url);
      }
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (croppingField) {
      await uploadFileToServer(croppedBlob, croppingField);
      setCropperOpen(false);
      setImageToCrop(null);
      setCroppingField(null);
    }
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    setImageToCrop(null);
    setCroppingField(null);
  };

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onCancel(); // Switch back to view mode
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, onCancel]);

  return (
    <div className="card h-full border-0 bg-white dark:bg-neutral-700 rounded-2xl shadow-sm">
      <div className="card-body p-6">
        <div className="mb-6 border-b border-neutral-200 dark:border-neutral-600 pb-4">
          <ul className="flex flex-wrap text-sm font-medium text-center" role="tablist">
            <li className="mr-2" role="presentation">
              <button
                className="inline-block p-4 border-b-2 border-primary-600 text-primary-600 rounded-t-lg active dark:text-primary-500 dark:border-primary-500"
                type="button"
                role="tab"
              >
                Edit Profile
              </button>
            </li>
          </ul>
        </div>

        <form action={formAction}>
          {/* Hidden inputs for file URLs */}
          <input type="hidden" name="avatarUrl" value={avatarUrl || ""} />
          <input type="hidden" name="companyLogoUrl" value={companyLogoUrl || ""} />
          <input type="hidden" name="cvUrl" value={cvUrl || ""} />
          <input type="hidden" name="skills" value={JSON.stringify(skills)} />

          {/* Avatar Upload Section */}
          <h6 className="text-base text-neutral-600 dark:text-neutral-200 mb-4">Profile Image</h6>
          <div className="mb-6 mt-4 flex justify-center sm:justify-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-neutral-600 shadow-sm relative">
                <Image
                  src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=random`}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-8 h-8 flex justify-center items-center bg-primary-100 dark:bg-primary-600/25 text-primary-600 dark:text-primary-400 border border-primary-600 hover:bg-primary-200 cursor-pointer rounded-full transition-colors"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "avatar")}
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* Company Logo Upload Section - Only for Employers */}
            {profile.role === "EMPLOYER" && (
              <div className="relative">
                <div className="w-32 h-32 rounded-lg overflow-hidden border-4 border-white dark:border-neutral-600 shadow-sm relative bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  {companyLogoUrl ? (
                    <Image
                      src={companyLogoUrl}
                      alt="Company Logo"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-neutral-400" />
                  )}
                </div>
                <label
                  htmlFor="company-logo-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 flex justify-center items-center bg-primary-100 dark:bg-primary-600/25 text-primary-600 dark:text-primary-400 border border-primary-600 hover:bg-primary-200 cursor-pointer rounded-full transition-colors"
                  title="Upload Company Logo"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  <input
                    type="file"
                    id="company-logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "companyLogo")}
                    disabled={isUploading}
                  />
                </label>
                <p className="text-xs text-center mt-2 text-neutral-500">Company Logo</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-6 gap-y-5">
            <div className="col-span-12 sm:col-span-6">
              <label htmlFor="fullName" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Full Name <span className="text-red-600">*</span></label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                defaultValue={profile.fullName}
                className="w-full h-[48px] px-4 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-primary-600 dark:focus:border-primary-500 transition-colors"
                placeholder="Enter Full Name"
                required
              />
              {state.errors?.fullName && (
                <p className="text-sm text-red-600 mt-1">{state.errors.fullName[0]}</p>
              )}
            </div>

            <div className="col-span-12 sm:col-span-6">
              <label htmlFor="email" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Email <span className="text-red-600">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={profile.email}
                className="w-full h-[48px] px-4 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-200 dark:bg-neutral-900 text-neutral-500 cursor-not-allowed"
                disabled
              />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <label htmlFor="institution" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                {profile.role === "SCIENTIST" ? "Education Background (Institution)" : "Institution / Company"}
              </label>
              <input
                type="text"
                id="institution"
                name="institution"
                defaultValue={profile.institution || ""}
                className="w-full h-[48px] px-4 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-primary-600 dark:focus:border-primary-500 transition-colors"
                placeholder={profile.role === "SCIENTIST" ? "e.g. University of Lagos" : "Enter Institution"}
              />
              {state.errors?.institution && (
                <p className="text-sm text-red-600 mt-1">{state.errors.institution[0]}</p>
              )}
            </div>

            {profile.role === "SCIENTIST" && (
              <>
                <div className="col-span-12 sm:col-span-6">
                  <label htmlFor="degree" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    defaultValue={(profile.education as any)?.degree || ""}
                    className="w-full h-[48px] px-4 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                    placeholder="e.g. PhD, MSc"
                  />
                </div>
                <div className="col-span-12 sm:col-span-6">
                  <label htmlFor="courseOfStudy" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Course of Study</label>
                  <input
                    type="text"
                    name="courseOfStudy"
                    defaultValue={(profile.education as any)?.courseOfStudy || ""}
                    className="w-full h-[48px] px-4 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div className="col-span-12 sm:col-span-6">
                  <label htmlFor="duration" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Duration (Year)</label>
                  <input
                    type="text"
                    name="duration"
                    defaultValue={(profile.education as any)?.duration || ""}
                    className="w-full h-[48px] px-4 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                    placeholder="e.g. 2018 - 2022"
                  />
                </div>
              </>
            )}

            <div className="col-span-12">
              <label htmlFor="bio" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Bio</label>
              <textarea
                id="bio"
                name="bio"
                defaultValue={profile.bio || ""}
                className="w-full p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-primary-600 dark:focus:border-primary-500 transition-colors min-h-[100px]"
                placeholder="Write a short bio..."
              ></textarea>
              {state.errors?.bio && (
                <p className="text-sm text-red-600 mt-1">{state.errors.bio[0]}</p>
              )}
            </div>

            {profile.role !== "EMPLOYER" && (
              <>
                <div className="col-span-12">
                  <label className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Skills</label>
                  <SkillsInput value={skills} onChange={setSkills} />
                  {state.errors?.skills && (
                    <p className="text-sm text-red-600 mt-1">{state.errors.skills[0]}</p>
                  )}
                </div>

                <div className="col-span-12">
                  <label htmlFor="experience" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Experience</label>
                  <textarea
                    id="experience"
                    name="experience"
                    defaultValue={profile.experience || ""}
                    className="w-full p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-primary-600 dark:focus:border-primary-500 transition-colors min-h-[100px]"
                    placeholder="Describe your experience..."
                  ></textarea>
                  {state.errors?.experience && (
                    <p className="text-sm text-red-600 mt-1">{state.errors.experience[0]}</p>
                  )}
                </div>
              </>
            )}

            {profile.role === "SCIENTIST" && (
              <div className="col-span-12">
                <label htmlFor="publications" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Publications (One per line)</label>
                <textarea
                  id="publications"
                  name="publications"
                  defaultValue={profile.publications.join("\n")}
                  className="w-full p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-primary-600 dark:focus:border-primary-500 transition-colors min-h-[100px]"
                  placeholder="List your publications..."
                ></textarea>
                {state.errors?.publications && (
                  <p className="text-sm text-red-600 mt-1">{state.errors.publications[0]}</p>
                )}
              </div>
            )}

            {/* CV Upload - Only for Scientists and Admins */}
            {(profile.role === "SCIENTIST" || profile.role === "ADMIN") && (
              <div className="col-span-12">
                <label className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">CV / Resume</label>
                <FileUploader
                  label="Upload CV (PDF)"
                  accept=".pdf,.doc,.docx"
                  fileType="document"
                  currentFileUrl={cvUrl}
                  onFileSelect={(file) => handleFileUpload(file, "cv")}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="border border-red-600 bg-red-50 hover:bg-red-100 text-red-600 text-base px-8 py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="bg-primary-600 hover:bg-primary-700 text-white text-base px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>

        {profile.role === "SCIENTIST" && banks && (
          <div className="mt-10 pt-10 border-t border-neutral-200 dark:border-neutral-600">
            <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Bank Details</h3>
            <BankDetailsForm
              banks={banks}
              initialData={{
                bankName: profile.bankName,
                accountNumber: profile.accountNumber,
                accountName: profile.accountName
              }}
            />
          </div>
        )}
      </div>

      <ImageCropper
        open={cropperOpen}
        imageSrc={imageToCrop}
        aspect={1}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </div>
  );
}
