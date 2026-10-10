
import React, { useState } from 'react';
import { Modal } from '../Common/Modal';
import { Button } from '../Common/Button';
import { Input } from '../Common/Input';
import { FilePlus, FolderPlus } from 'lucide-react';

export const NewItemModal = ({
  isOpen,
  onClose,
  type = 'file',
  currentFolder = '/',
  onCreate
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFolder = type === 'folder';
  const ItemIcon = isFolder ? FolderPlus : FilePlus;

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError(`${isFolder ? 'Folder' : 'File'} name is required`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const normalizedPath = currentFolder === '/'
        ? `/${trimmedName}`
        : `${currentFolder}/${trimmedName}`;

      await onCreate({
        name: trimmedName,
        path: normalizedPath,
        type
      });

      setName('');
      onClose();
    } catch (err) {
      setError(err.message || `Failed to create ${type}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`New ${isFolder ? 'Folder' : 'File'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-950/30 border border-pink-900/40">
          <div className="w-10 h-10 rounded-xl bg-pink-600/20 flex items-center justify-center">
            <ItemIcon className="w-5 h-5 text-pink-400" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-pink-100">
              Create New {isFolder ? 'Folder' : 'File'}
            </h3>
            <p className="text-xs text-pink-200/60 mt-1">
              {isFolder
                ? 'Organize your project with a new folder.'
                : 'Add a new file to your workspace.'}
            </p>
          </div>
        </div>

        <Input
          label={`${isFolder ? 'Folder' : 'File'} Name`}
          placeholder={isFolder ? 'components' : 'app.js'}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoFocus
          maxLength={100}
        />

        <p className="text-xs text-pink-200/50">
          Location: <span className="text-pink-300">{currentFolder}</span>
        </p>

        <div className="flex justify-end gap-2 pt-3 border-t border-pink-900/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            variant="primary"
            loading={loading}
            disabled={!name.trim()}
            icon={ItemIcon}
          >
            Create {isFolder ? 'Folder' : 'File'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
