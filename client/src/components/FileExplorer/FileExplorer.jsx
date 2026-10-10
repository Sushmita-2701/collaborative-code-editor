
import React, { useState } from 'react';
import { FileTreeItem } from './FileTreeItem';
import { NewItemModal } from './NewItemModal';
import {
  FilePlus,
  FolderPlus,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

export const FileExplorer = ({
  files = [],
  activeFile,
  onSelectFile,
  onCreateItem,
  onDeleteItem,
  onRenameItem,
  onRefresh
}) => {
  const [modalType, setModalType] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);

    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <aside className="w-56 bg-[#2d1b26] border-r border-pink-900/50 flex flex-col h-full select-none shrink-0">
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-pink-900/40 text-xs font-semibold uppercase tracking-wider text-pink-200/70">
        <span className="flex items-center gap-1.5">
          <ChevronDown className="w-3.5 h-3.5 text-pink-400" />
          Explorer
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setModalType('file')}
            className="p-1 text-pink-200/60 hover:text-pink-300 rounded-md hover:bg-pink-900/40 transition-colors"
            title="New File"
            aria-label="Create new file"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setModalType('folder')}
            className="p-1 text-pink-200/60 hover:text-pink-300 rounded-md hover:bg-pink-900/40 transition-colors"
            title="New Folder"
            aria-label="Create new folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRefresh}
            className={`p-1 text-pink-200/60 hover:text-pink-300 rounded-md hover:bg-pink-900/40 transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Explorer"
            aria-label="Refresh files"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {files.length === 0 ? (
          <div className="p-4 text-center text-xs text-pink-200/50">
            No files in project. Click + to create a file.
          </div>
        ) : (
          files.map(file => (
            <FileTreeItem
              key={file._id}
              item={file}
              isActive={activeFile?._id === file._id}
              onSelect={onSelectFile}
              onDelete={onDeleteItem}
              onRename={onRenameItem}
            />
          ))
        )}
      </div>

      {/* Explorer Footer */}
      <div className="px-3 py-2 border-t border-pink-900/40 text-[10px] text-pink-200/40 flex items-center justify-between">
        <span>WORKSPACE FILES</span>
        <span>{files.length} items</span>
      </div>

      {/* New File / Folder Modal */}
      <NewItemModal
        isOpen={!!modalType}
        type={modalType || 'file'}
        onClose={() => setModalType(null)}
        onCreate={onCreateItem}
      />
    </aside>
  );
};
