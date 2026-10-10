import React from 'react';
import { UserAvatar } from './UserAvatar';
import { Users } from 'lucide-react';

export const UserPresence = ({ onlineUsers = [] }) => {
  // Deduplicate by user id or name
  const uniqueUsers = Array.from(
    new Map(onlineUsers.map(u => [u.id || u.name, u])).values()
  );

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#2d1b26] border border-pink-900/60">
      <Users className="w-3.5 h-3.5 text-pink-400" />

      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {uniqueUsers.map((user, idx) => (
          <UserAvatar
            key={user.clientId || user.id || idx}
            user={user}
            size="xs"
          />
        ))}
      </div>

      <span className="text-xs text-pink-200/70 ml-1">
        {uniqueUsers.length} online
      </span>
    </div>
  );
};