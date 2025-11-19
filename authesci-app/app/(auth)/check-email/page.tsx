import { Suspense } from 'react';
import { CheckEmailContent } from './CheckEmailContent';

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}
