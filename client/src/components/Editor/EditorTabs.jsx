
import React from 'react';
import { X, FileCode } from 'lucide-react';

export const EditorTabs = ({
  openFiles = [],
  activeFile,
  dirtyFiles = {},
  onSelectTab,
  onCloseTab
}) => {
  if (openFiles.length === 0) return null;

  return (
    <div className="h-9 bg-[#2d1b26] border-b border-pink-900/50 flex items-center overflow-x-auto select-none no-scrollbar">
      {openFiles.map((file) => {
        const isActive = activeFile?._id === file._id;
        const isDirty = dirtyFiles[file._id];

        return (
          <div
            key={file._id}
            onClick={() => onSelectTab(file)}
            className={`group h-full flex items-center gap-2 px-3 border-r border-pink-900/40 text-xs cursor-pointer transition-colors ${
              isActive
                ? 'bg-[#1f1018] text-pink-100 border-t-2 border-t-pink-500 font-medium'
                : 'bg-[#2d1b26] text-pink-200/60 hover:bg-pink-950/40 hover:text-pink-100 border-t-2 border-t-transparent'
            }`}
          >
            <FileCode
              className={`w-3.5 h-3.5 flex-shrink-0 ${
                isActive ? 'text-pink-400' : 'text-pink-300/50'
              }`}
            />

            <span className="truncate max-w-[120px]">
              {file.name}
            </span>

            <div className="flex items-center">
              {isDirty ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file);
                  }}
                  className="w-2 h-2 rounded-full bg-pink-400 group-hover:hidden"
                  title="Unsaved changes"
                />
              ) : null}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file);
                }}
                className={`p-0.5 rounded hover:bg-pink-800/50 hover:text-white transition-colors ${
                  isDirty
                    ? 'hidden group-hover:block'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
                title="Close Tab"
                aria-label={`Close ${file.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
