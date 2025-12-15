import AuthCard from "@/components/modules/auth/AuthCard";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login | Authesci",
  description: "Sign in to your Authesci account.",
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCard type="signin" />
    </Suspense>
  );
};

export default LoginPage;
