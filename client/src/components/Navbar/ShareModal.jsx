import React, { useState } from 'react';
import { Modal } from '../Common/Modal';
import { Button } from '../Common/Button';
import { Input } from '../Common/Input';
import { Copy, Check, UserPlus } from 'lucide-react';

export const ShareModal = ({
  isOpen,
  onClose,
  project,
  onAddCollaborator
}) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setLoading(true);
    setError('');
    try {
      await onAddCollaborator(email.trim());
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to add collaborator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Project">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#858585] mb-1.5">
            Collaboration Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full px-3 py-1.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-xs text-[#cccccc] font-mono select-all focus:outline-none"
            />
            <Button
              size="sm"
              variant={copied ? 'success' : 'secondary'}
              onClick={handleCopy}
              icon={copied ? Check : Copy}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="border-t border-[#3c3c3c] pt-4">
          <label className="block text-xs font-medium text-[#858585] mb-1.5">
            Invite Collaborator by Email
          </label>
          <form onSubmit={handleAdd} className="flex gap-2 items-start">
            <div className="flex-1">
              <Input
                placeholder="colleague@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              loading={loading}
              icon={UserPlus}
            >
              Invite
            </Button>
          </form>
        </div>

        {project?.collaborators && project.collaborators.length > 0 && (
          <div className="border-t border-[#3c3c3c] pt-3">
            <span className="text-xs font-medium text-[#858585] block mb-2">
              Collaborators ({project.collaborators.length})
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {project.collaborators.map((c) => (
                <div key={c._id} className="flex items-center justify-between text-xs px-2 py-1 bg-[#1e1e1e] rounded">
                  <span className="font-medium text-white">{c.name}</span>
                  <span className="text-[#858585]">{c.email}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
