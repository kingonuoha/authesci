import AuthCard from "@/components/modules/auth/AuthCard";

import { Suspense } from "react";

const LoginPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCard type="signin" />
    </Suspense>
  );
};

export default LoginPage;
