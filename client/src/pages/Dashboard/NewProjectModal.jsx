
import React, { useState } from 'react';
import { Modal } from '../../components/Common/Modal';
import { Button } from '../../components/Common/Button';
import { Input } from '../../components/Common/Input';
import { FolderPlus } from 'lucide-react';

export const NewProjectModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onCreate(name.trim());
      setName('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-950/30 border border-pink-900/40">
          <div className="w-10 h-10 rounded-xl bg-pink-600/20 flex items-center justify-center">
            <FolderPlus className="w-5 h-5 text-pink-400" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-pink-100">
              Start a new project
            </h3>
            <p className="text-xs text-pink-200/60 mt-1">
              Give your workspace a name to get started.
            </p>
          </div>
        </div>

        <Input
          label="Project Name"
          placeholder="my-awesome-app"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoFocus
          maxLength={50}
        />

        <p className="text-xs text-pink-200/60 leading-relaxed">
          Your project will be initialized with starter JavaScript,
          Python, and C++ files.
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
            icon={FolderPlus}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
