'use client';
import React, { useState, useEffect } from 'react';
import FormInput from './FormInput';
import { Mail, Lock, User, Building, Users as UsersIcon, Facebook, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { login, signUp } from '@/app/(app)/actions/auth';
import { Role } from '@prisma/client';
import RoleSelector from './RoleSelector';
import { useActionState } from 'react';
import { showToast } from '@/lib/utils';
import { ActionResult } from '@/app/(app)/actions/auth';
import { useSearchParams, useRouter } from 'next/navigation';

interface AuthCardProps {
  type: 'signin' | 'signup';
}

const AuthCard: React.FC<AuthCardProps> = ({ type }) => {
  const isSignIn = type === 'signin';
  const [role, setRole] = useState<Role>(Role.SCIENTIST);
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize useRouter
  const emailFromQuery = searchParams.get('email');

  const [loginState, loginAction, isLoginPending] = useActionState<ActionResult | null, FormData>(login, null);
  const [signUpState, signUpAction, isSignUpPending] = useActionState<ActionResult | null, FormData>(signUp, null);

  const state = isSignIn ? loginState : signUpState;
  const pending = isSignIn ? isLoginPending : isSignUpPending;

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      showToast('success', 'Email verified!', 'You can now log in.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (state?.status === 'error') {
      const errorMessage = Array.isArray(state.error)
        ? state.error.map(e => e.message).join('\n')
        : state.error;
      showToast('error', state.message, errorMessage);
    } else if (state?.status === 'success') {
      if (!isSignIn) { // This is a signup success
        // Redirect to verify-email page with email as query param
        router.push(`/verify-email?email=${encodeURIComponent(state.formData?.email || '')}`);
      } else {
        showToast('success', state.message, state.error); // For login, still show toast
      }
    }
  }, [state, isSignIn, router]); // Add router to dependency array

  const getErrorForField = (fieldName: string) => {
    if (state?.status === 'error' && Array.isArray(state.error)) {
      const fieldError = state.error.find((e: any) => e.path && e.path.includes(fieldName));
      return fieldError?.message;
    }
    return undefined;
  };

  return (
    <form action={isSignIn ? loginAction : signUpAction}>
      {!isSignIn && (
        <FormInput
          type="text"
          name="fullName"
          placeholder="Full Name"
          icon={<User />}
          id="fullName"
          defaultValue={state?.formData?.fullName}
          error={getErrorForField('fullName')}
        />
      )}
      <FormInput
        type="email"
        name="email"
        placeholder="Email"
        icon={<Mail />}
        id="email"
        defaultValue={emailFromQuery ?? state?.formData?.email}
        error={getErrorForField('email')}
      />
      <FormInput
        type="password"
        name="password"
        placeholder="Password"
        icon={<Lock />}
        id="password"
        error={getErrorForField('password')}
      />
      {!isSignIn && (
        <FormInput
          type="text"
          name="institution"
          placeholder="Institution (Optional)"
          icon={<Building />}
          id="institution"
          defaultValue={state?.formData?.institution}
          error={getErrorForField('institution')}
        />
      )}
      {!isSignIn && <RoleSelector role={role} setRole={setRole} />}
      <input type="hidden" name="role" value={role} />

      {isSignIn ? (
        <div className="mt-7">
          <div className="flex justify-between gap-2">
            <div className="flex items-center">
              <input className="form-check-input border border-neutral-300" type="checkbox" name="remember" id="remeber" />
              <label className="ps-2" htmlFor="remeber">Remember me</label>
            </div>
            <Link href="/forgot-password" passHref>
              <button type="button" className="text-primary-600 font-medium hover:underline">Forgot Password?</button>
            </Link>
          </div>
        </div>
      ) : (
        <div className=" mt-6">
          <div className="flex justify-between gap-2">
            <div className="form-check style-check flex items-start gap-2">
              <input className="form-check-input border border-neutral-300 mt-1.5" type="checkbox" value="" id="condition" required />
              <label className="text-sm" htmlFor="condition">
                By creating an account means you agree to the
                <a href="/terms" className="text-primary-600 font-semibold"> Terms & Conditions</a> and our
                <a href="/privacy" className="text-primary-600 font-semibold"> Privacy Policy</a>
              </label>
            </div>
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary justify-center text-sm btn-sm px-3 py-4 w-full rounded-xl mt-8" disabled={pending}>
        {pending ? 'Submitting...' : (isSignIn ? 'Sign In' : 'Sign Up')}
      </button>

      <div className="mt-8 center-border-horizontal text-center relative before:absolute before:w-full before:h-[1px] before:top-1/2 before:-translate-y-1/2 before:bg-neutral-300 before:start-0">
        <span className="bg-white dark:bg-dark-2 z-[2] relative px-4">Or {isSignIn ? 'sign in' : 'sign up'} with</span>
      </div>
      <div className="mt-8 flex items-center gap-3">
        <button type="button" className="font-semibold text-neutral-600 dark:text-neutral-200 py-4 px-6 w-1/2 border rounded-xl text-base flex items-center justify-center gap-3 line-height-1 hover:bg-primary-50">
          <Facebook className="text-primary-600 text-xl line-height-1" />
          Facebook
        </button>
        <button type="button" className="font-semibold text-neutral-600 dark:text-neutral-200 py-4 px-6 w-1/2 border rounded-xl text-base flex items-center justify-center gap-3 line-height-1 hover:bg-primary-50">
          <Youtube className="text-primary-600 text-xl line-height-1" />
          Google
        </button>
      </div>
      <div className="mt-8 text-center text-sm">
        <p className="mb-0">
          {isSignIn ? "Don't have an account? " : 'Already have an account? '}
          <Link href={isSignIn ? '/signup' : '/signin'} className="text-primary-600 font-semibold hover:underline">
            {isSignIn ? 'Sign Up' : 'Sign In'}
          </Link>
        </p>
      </div>
    </form>
  );
};

export default AuthCard;
