
import React, { useState } from 'react';
import {
  FileCode,
  Folder,
  Trash2,
  Edit2
} from 'lucide-react';

export const FileTreeItem = ({
  item,
  isActive,
  onSelect,
  onDelete,
  onRename
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(item.name);

  const getFileBadge = (name) => {
    const ext = name.split('.').pop().toLowerCase();

    switch (ext) {
      case 'js':
      case 'jsx':
        return (
          <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded">
            JS
          </span>
        );

      case 'ts':
      case 'tsx':
        return (
          <span className="text-[10px] font-bold text-sky-300 bg-sky-400/10 px-1.5 py-0.5 rounded">
            TS
          </span>
        );

      case 'py':
        return (
          <span className="text-[10px] font-bold text-pink-300 bg-pink-400/10 px-1.5 py-0.5 rounded">
            PY
          </span>
        );

      case 'cpp':
      case 'c':
      case 'h':
        return (
          <span className="text-[10px] font-bold text-purple-300 bg-purple-400/10 px-1.5 py-0.5 rounded">
            C++
          </span>
        );

      case 'json':
        return (
          <span className="text-[10px] font-bold text-yellow-300 bg-yellow-400/10 px-1.5 py-0.5 rounded">
            {'{}'}
          </span>
        );

      default:
        return (
          <FileCode className="w-3.5 h-3.5 text-pink-300/60" />
        );
    }
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();

    const trimmedName = newName.trim();

    if (trimmedName && trimmedName !== item.name) {
      onRename(item, trimmedName);
    } else {
      setNewName(item.name);
    }

    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleRenameSubmit}
        className="px-2 py-1 flex items-center"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setNewName(item.name);
              setIsEditing(false);
            }
          }}
          autoFocus
          className="w-full min-w-0 bg-[#1f1018] text-pink-100 text-xs px-2 py-1 rounded-md outline-none border border-pink-500 focus:ring-1 focus:ring-pink-500/50"
        />
      </form>
    );
  }

  return (
    <div
      onClick={() => onSelect(item)}
      className={`group flex items-center justify-between gap-1 px-2.5 py-1.5 cursor-pointer text-xs transition-all duration-150 rounded-md border ${
        isActive
          ? 'bg-pink-600/20 text-pink-100 border-pink-500/30 font-medium'
          : 'text-pink-100/70 border-transparent hover:bg-pink-900/30 hover:text-pink-100'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {item.type === 'folder' ? (
          <Folder className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
        ) : (
          getFileBadge(item.name)
        )}

        <span className="truncate">{item.name}</span>
      </div>

      <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setNewName(item.name);
            setIsEditing(true);
          }}
          className="p-1 text-pink-200/50 hover:text-pink-300 rounded hover:bg-pink-800/40"
          title="Rename"
          aria-label={`Rename ${item.name}`}
        >
          <Edit2 className="w-3 h-3" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();

            if (confirm(`Are you sure you want to delete ${item.name}?`)) {
              onDelete(item._id);
            }
          }}
          className="p-1 text-pink-200/50 hover:text-rose-400 rounded hover:bg-rose-900/30"
          title="Delete"
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
