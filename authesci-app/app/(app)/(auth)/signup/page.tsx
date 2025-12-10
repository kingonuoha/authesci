import AuthCard from "@/components/modules/auth/AuthCard";

import { Suspense } from "react";

const SignUpPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCard type="signup" />
    </Suspense>
  );
};

export default SignUpPage;
