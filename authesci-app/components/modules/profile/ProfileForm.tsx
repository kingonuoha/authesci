"use client";

import { useActionState, useState, useEffect } from "react";
import { updateProfile, ProfileState } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillsInput } from "./SkillsInput";
import { FileUploader } from "./FileUploader";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  initialData: {
    fullName: string;
    email: string;
    bio?: string | null;
    institution?: string | null;
    experience?: string | null;
    skills: string[];
    avatarUrl?: string | null;
    cvUrl?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, {
    status: "idle",
    message: "",
  } as ProfileState);

  const [skills, setSkills] = useState<string[]>(initialData.skills || []);

  // Show toast on state change
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your personal information and professional details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-xs">
              <FileUploader
                label="Profile Picture"
                accept="image/*"
                fileType="image"
                currentFileUrl={initialData.avatarUrl}
                onFileSelect={(file) => {
                  // TODO: Handle file upload logic separately or via FormData
                  console.log("Avatar selected:", file);
                }}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={initialData.fullName}
                placeholder="Dr. Jane Doe"
                required
              />
              {state.errors?.fullName && (
                <p className="text-sm text-destructive">{state.errors.fullName[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                defaultValue={initialData.email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Institution / Company</Label>
            <Input
              id="institution"
              name="institution"
              defaultValue={initialData.institution || ""}
              placeholder="University of Science"
            />
            {state.errors?.institution && (
              <p className="text-sm text-destructive">{state.errors.institution[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={initialData.bio || ""}
              placeholder="Tell us about your research interests..."
              className="min-h-[100px]"
            />
            {state.errors?.bio && (
              <p className="text-sm text-destructive">{state.errors.bio[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <SkillsInput
              value={skills}
              onChange={setSkills}
              placeholder="Add skills (e.g. PCR, Data Analysis)"
            />
            <input type="hidden" name="skills" value={JSON.stringify(skills)} />
            {state.errors?.skills && (
              <p className="text-sm text-destructive">{state.errors.skills[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              name="experience"
              defaultValue={initialData.experience || ""}
              placeholder="Describe your professional experience..."
              className="min-h-[100px]"
            />
            {state.errors?.experience && (
              <p className="text-sm text-destructive">{state.errors.experience[0]}</p>
            )}
          </div>

          {/* CV Upload */}
          <div className="space-y-2">
            <Label>CV / Resume</Label>
            <FileUploader
              label="Upload CV (PDF)"
              accept=".pdf,.doc,.docx"
              fileType="document"
              currentFileUrl={initialData.cvUrl}
              onFileSelect={(file) => {
                // TODO: Handle file upload logic
                console.log("CV selected:", file);
              }}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
