'use client';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormInputProps {
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  id?: string;
  name: string;
  defaultValue?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput: React.FC<FormInputProps> = ({ type, placeholder, icon, id, name, defaultValue, error, value, onChange }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === 'password';
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="relative mb-5">
      <label htmlFor={inputId} className="sr-only">{placeholder}</label>
      <div className="icon-field">
        <span className="absolute start-4 top-2/3 -translate-y-2/3 pointer-events-none flex text-xl" aria-hidden="true">
          {icon}
        </span>
        <input
          id={inputId}
          name={name}
          type={isPassword ? (isPasswordVisible ? 'text' : 'password') : type}
          className={`form-control h-[56px] ps-11 border-neutral-300 bg-neutral-50 dark:bg-dark-2 rounded-xl ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          autoComplete={name === 'email' ? 'email' : name === 'password' ? 'current-password' : ''}
        />
      </div>
      {isPassword && (
        <button
          type="button"
          className="toggle-password cursor-pointer absolute end-0 top-2/3 -translate-y-2/3 me-4 text-secondary-light"
          onClick={togglePasswordVisibility}
          aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          aria-controls={inputId}
          aria-expanded={isPasswordVisible}
        >
          {isPasswordVisible ? <EyeOff /> : <Eye />}
        </button>
      )}
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
