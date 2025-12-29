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
  const router = useRouter();
  const emailFromQuery = searchParams.get('email');

  const [loginState, loginAction, isLoginPending] = useActionState<ActionResult | null, FormData>(login, null);
  const [signUpState, signUpAction, isSignUpPending] = useActionState<ActionResult | null, FormData>(signUp, null);

  const state = isSignIn ? loginState : signUpState;
  const pending = isSignIn ? isLoginPending : isSignUpPending;

  // Header Logic
  const title = isSignIn ? "Sign In to your Account" : "Sign Up to your Account";
  const subtitle = isSignIn ? "Welcome back! please enter your detail" : "Welcome! please enter your details";

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
      if (!isSignIn) {
        router.push(`/verify-email?email=${encodeURIComponent(state.formData?.email || '')}`);
      } else {
        showToast('success', state.message, state.error);
        if (isSignIn && (state.formData as any)?.redirectUrl) {
          const url = (state.formData as any).redirectUrl;
          setTimeout(() => {
            router.push(url);
          }, 1500); // 1.5s delay to read toast
        }
      }
    }
  }, [state, isSignIn, router]);

  const getErrorForField = (fieldName: string) => {
    if (state?.status === 'error' && Array.isArray(state.error)) {
      const fieldError = state.error.find((e: any) => e.path && e.path.includes(fieldName));
      return fieldError?.message;
    }
    return undefined;
  };

  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 lg:p-10 w-full animate-in fade-in zoom-in duration-500">

      {/* Header */}
      <div className="mb-8 text-center lg:text-left">
        <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">{title}</h4>
        <p className="text-gray-700 dark:text-gray-200 text-lg font-medium drop-shadow-sm">
          {subtitle}
        </p>
      </div>

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
            className="bg-white/50 border-white/40 focus:bg-white/80"
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
          className="bg-white/50 border-white/40 focus:bg-white/80"
        />
        <FormInput
          type="password"
          name="password"
          placeholder="Password"
          icon={<Lock />}
          id="password"
          error={getErrorForField('password')}
          className="bg-white/50 border-white/40 focus:bg-white/80"
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
            className="bg-white/50 border-white/40 focus:bg-white/80"
          />
        )}
        {!isSignIn && <RoleSelector role={role} setRole={setRole} variant="glass" />}
        <input type="hidden" name="role" value={role} />

        {isSignIn ? (
          <div className="mt-7">
            <div className="flex justify-between gap-2">
              <div className="flex items-center">
                <input className="form-check-input border border-neutral-300" type="checkbox" name="remember" id="remeber" />
                <label className="ps-2 text-gray-800 dark:text-gray-200 font-medium" htmlFor="remeber">Remember me</label>
              </div>
              <Link href="/forgot-password" passHref>
                <button type="button" className="text-primary-700 dark:text-primary-400 font-bold hover:underline">Forgot Password?</button>
              </Link>
            </div>
          </div>
        ) : (
          <div className=" mt-6">
            <div className="flex justify-between gap-2">
              <div className="form-check style-check flex items-start gap-2">
                <input className="form-check-input border border-neutral-300 mt-1.5" type="checkbox" value="" id="condition" required />
                <label className="text-sm text-gray-800 dark:text-gray-200" htmlFor="condition">
                  By creating an account means you agree to the
                  <a href="/terms" className="text-primary-700 dark:text-primary-400 font-bold ml-1">Terms & Conditions</a> and our
                  <a href="/privacy" className="text-primary-700 dark:text-primary-400 font-bold ml-1">Privacy Policy</a>
                </label>
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary justify-center text-sm btn-sm px-3 py-4 w-full rounded-xl mt-8 shadow-lg hover:shadow-primary-500/30 transition-all font-bold" disabled={pending}>
          {pending ? 'Submitting...' : (isSignIn ? 'Sign In' : 'Sign Up')}
        </button>

        {/* Social Auth Removed as per PRD */}
        <div className="mt-8 text-center text-sm">
          <p className="mb-0 text-gray-800 dark:text-gray-200">
            {isSignIn ? "Don't have an account? " : 'Already have an account? '}
            <Link href={isSignIn ? '/signup' : '/signin'} className="text-primary-700 dark:text-primary-400 font-bold hover:underline">
              {isSignIn ? 'Sign Up' : 'Sign In'}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AuthCard;
