'use client';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormInputProps {
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  id?: string; // Add id property
}

const FormInput: React.FC<FormInputProps> = ({ type, placeholder, icon, id }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === 'password';
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`; // Generate unique ID if not provided

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="relative mb-5">
      <label htmlFor={inputId} className="sr-only">{placeholder}</label> {/* Visually hidden label */}
      <div className="icon-field">
        <span className="absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none flex text-xl" aria-hidden="true">
          {icon}
        </span>
        <input
          id={inputId}
          type={isPassword ? (isPasswordVisible ? 'text' : 'password') : type}
          className="form-control h-[56px] ps-11 border-neutral-300 bg-neutral-50 dark:bg-dark-2 rounded-xl"
          placeholder={placeholder}
        />
      </div>
      {isPassword && (
        <button
          type="button"
          className="toggle-password cursor-pointer absolute end-0 top-1/2 -translate-y-1/2 me-4 text-secondary-light"
          onClick={togglePasswordVisibility}
          aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          aria-controls={inputId}
          aria-expanded={isPasswordVisible}
        >
          {isPasswordVisible ? <EyeOff /> : <Eye />}
        </button>
      )}
    </div>
  );
};

export default FormInput;
