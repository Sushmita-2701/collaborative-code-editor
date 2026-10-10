
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../Common/Button';
import { UserPresence } from '../UserPresence/UserPresence';
import { ShareModal } from './ShareModal';
import {
  Code2,
  Play,
  Share2,
  Save,
  Check,
  ChevronDown,
  LogOut,
  FolderOpen,
} from 'lucide-react';

export const Navbar = ({
  project,
  onSave,
  onRun,
  isRunning,
  selectedLanguage,
  onLanguageChange,
  isDirty,
  saveStatus,
  connectionStatus,
  onlineUsers,
  onAddCollaborator,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <span className="flex items-center gap-1 text-[11px] text-pink-300 font-medium bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            Connected
          </span>
        );

      case 'connecting':
      case 'reconnecting':
        return (
          <span className="flex items-center gap-1 text-[11px] text-pink-300 font-medium bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            {connectionStatus === 'connecting'
              ? 'Connecting...'
              : 'Reconnecting...'}
          </span>
        );

      default:
        return (
          <span className="flex items-center gap-1 text-[11px] text-rose-300 font-medium bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Disconnected
          </span>
        );
    }
  };

  return (
    <>
      <header className="h-12 bg-[#2d1b26] border-b border-pink-900/60 px-3 flex items-center justify-between gap-2 select-none z-20">
        {/* Logo and Project Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
            title="Go to Dashboard"
          >
            <div className="w-7 h-7 rounded-lg bg-pink-600 flex items-center justify-center text-white shadow-md shadow-pink-600/20">
              <Code2 className="w-4 h-4" />
            </div>

            <span className="font-bold text-sm tracking-tight text-pink-100 hidden sm:inline">
              CodeCollab
            </span>
          </div>

          <div className="h-4 w-px bg-pink-900/60" />

          <div className="flex items-center gap-2 min-w-0">
            <span
              className="text-xs font-medium text-white truncate max-w-[100px] sm:max-w-xs"
              title={project?.name}
            >
              {project?.name || 'Untitled Project'}
            </span>

            {isDirty ? (
              <span
                className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
                title="Unsaved changes"
              />
            ) : (
              <span className="flex items-center text-[10px] text-pink-200/60 gap-0.5 shrink-0">
                <Check className="w-3 h-3 text-pink-400" />
                {saveStatus || 'Saved'}
              </span>
            )}
          </div>

          <div className="hidden md:block">
            {getStatusBadge()}
          </div>
        </div>

        {/* Language and Editor Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-[#1f1018] border border-pink-900 text-xs text-pink-100 rounded-lg px-2 py-1.5 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC)</option>
          </select>

          <Button
            size="sm"
            variant="primary"
            onClick={onRun}
            loading={isRunning}
            icon={Play}
            className="font-semibold px-3"
          >
            {isRunning ? 'Running...' : 'Run'}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={onSave}
            icon={Save}
            title="Save file (Ctrl+S)"
          >
            Save
          </Button>
        </div>

        {/* Collaborators and User Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <UserPresence onlineUsers={onlineUsers} />

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsShareOpen(true)}
            icon={Share2}
          >
            Share
          </Button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-pink-900/30 transition-colors focus:outline-none focus:ring-1 focus:ring-pink-500"
              aria-label="User menu"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: user?.color || '#db2777' }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-pink-200/60" />
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-[#2d1b26] border border-pink-900/70 rounded-lg shadow-xl py-1 z-50 text-xs"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-pink-900/50">
                  <p className="font-semibold text-pink-100 truncate">
                    {user?.name}
                  </p>
                  <p className="text-pink-200/50 truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-pink-900/30 flex items-center gap-2 text-pink-100"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-950/40 flex items-center gap-2 text-rose-300"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        project={project}
        onAddCollaborator={onAddCollaborator}
      />
    </>
  );
};

