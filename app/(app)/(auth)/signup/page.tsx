import AuthCard from "@/components/modules/auth/AuthCard";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign Up | Authesci",
  description: "Create your Authesci account.",
};

const SignUpPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCard type="signup" />
    </Suspense>
  );
};

export default SignUpPage;
