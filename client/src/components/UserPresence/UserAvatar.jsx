import React from 'react';

export const UserAvatar = ({ user, size = 'sm', showTooltip = true }) => {
  const name = user?.name || user?.email || 'User';
  const initial = name.charAt(0).toUpperCase();
  const color = user?.color || '#38bdf8';

  const sizes = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm'
  };

  return (
    <div className="relative group inline-block">
      <div
        className={`flex items-center justify-center font-bold rounded-full text-white shadow-sm ring-1 ring-[#1e1e1e] cursor-default transition-transform transform group-hover:scale-110 ${sizes[size] || sizes.sm}`}
        style={{ backgroundColor: color }}
      >
        {initial}
      </div>

      {showTooltip && (
        <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
          <div className="bg-[#181818] border border-[#3c3c3c] text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
            {name}
          </div>
        </div>
      )}
    </div>
  );
};
