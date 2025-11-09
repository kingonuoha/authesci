'use client';
import React from 'react';
import FormInput from './FormInput';
import { Mail, Lock, User, Facebook, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface AuthCardProps {
  type: 'signin' | 'signup';
}

const AuthCard: React.FC<AuthCardProps> = ({ type }) => {
  const isSignIn = type === 'signin';

  return (
    <section className="bg-white dark:bg-dark-2 flex flex-wrap min-h-screen">
      <div className="lg:w-1/2 lg:block hidden">
        <div className="flex items-center flex-col h-full justify-center">
          <Image src="/assets/images/auth/auth-img.png" alt="Auth Image" width={500} height={500} />
        </div>
      </div>
      <div className="lg:w-1/2 py-8 px-6 flex flex-col justify-center">
        <div className="lg:max-w-[464px] mx-auto w-full">
          <div>
            <Link href="/" className="mb-2.5 max-w-[290px]">
              <Image src="/assets/images/logo.png" alt="Logo" width={290} height={40} />
            </Link>
            <h4 className="mb-3">{isSignIn ? 'Sign In to your Account' : 'Sign Up to your Account'}</h4>
            <p className="mb-8 text-secondary-light text-lg">Welcome back! please enter your detail</p>
          </div>
          <form action="#">
            {!isSignIn && <FormInput type="text" placeholder="Username" icon={<User />} id="username-input" />}
            <FormInput type="email" placeholder="Email" icon={<Mail />} id="email-input" />
            <FormInput type="password" placeholder="Password" icon={<Lock />} id="password-input" />

            {isSignIn ? (
              <div className="mt-7">
                <div className="flex justify-between gap-2">
                  <div className="flex items-center">
                    <input className="form-check-input border border-neutral-300" type="checkbox" value="" id="remeber" />
                    <label className="ps-2" htmlFor="remeber">Remember me</label>
                  </div>
                  <button type="button" className="text-primary-600 font-medium hover:underline">Forgot Password?</button>
                </div>
              </div>
            ) : (
              <div className=" mt-6">
                <div className="flex justify-between gap-2">
                  <div className="form-check style-check flex items-start gap-2">
                    <input className="form-check-input border border-neutral-300 mt-1.5" type="checkbox" value="" id="condition" />
                    <label className="text-sm" htmlFor="condition">
                      By creating an account means you agree to the
                      <a href="/terms" className="text-primary-600 font-semibold"> Terms & Conditions</a> and our
                      <a href="/privacy" className="text-primary-600 font-semibold"> Privacy Policy</a>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary justify-center text-sm btn-sm px-3 py-4 w-full rounded-xl mt-8">
              {isSignIn ? 'Sign In' : 'Sign Up'}
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
        </div>
      </div>
    </section>
  );
};

export default AuthCard;
