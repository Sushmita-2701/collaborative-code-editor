

import React from 'react';

export const Input = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-pink-100 mb-1.5"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`w-full px-3 py-2 bg-[#2d1b26] border ${
          error
            ? 'border-rose-500 focus:ring-rose-500'
            : 'border-pink-900 focus:border-pink-500 focus:ring-pink-500'
        } rounded-lg text-sm text-white placeholder-pink-200/40 focus:outline-none focus:ring-1 transition-colors ${className}`}
        {...props}
      />

      {error && (
        <p className="mt-1 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
};
