
import React from 'react';
import { Spinner } from './Spinner';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#1f1018] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-pink-600 hover:bg-pink-700 text-white focus:ring-pink-500',
    success:
      'bg-pink-700 hover:bg-pink-800 text-white focus:ring-pink-500',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
    secondary:
      'bg-[#3d2633] hover:bg-[#503044] text-pink-100 focus:ring-pink-500',
    ghost:
      'hover:bg-pink-950/50 text-pink-200 focus:ring-pink-500',
    outline:
      'border border-pink-800 hover:bg-pink-950/50 text-pink-200 focus:ring-pink-500'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5'
  };

  return (
    <button
      className={`${baseClasses} ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 'xs' : 'sm'} />
      ) : (
        Icon && (
          <Icon
            className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}
          />
        )
      )}

      {children}
    </button>
  );
};

