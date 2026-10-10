
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button } from '../../components/Common/Button';
import { NewProjectModal } from './NewProjectModal';
import {
  Code2,
  Plus,
  FolderCode,
  Users,
  Calendar,
  Trash2,
  ExternalLink,
  LogOut,
  FolderOpen
} from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.projects.getAll();
      setProjects(res.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (name) => {
    try {
      const res = await api.projects.create({ name });

      if (res.success && res.project) {
        setProjects(prev => [res.project, ...prev]);
        navigate(`/workspace/${res.project._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();

    if (
      !confirm(
        'Are you sure you want to delete this project? All associated files will be permanently deleted.'
      )
    ) {
      return;
    }

    try {
      await api.projects.delete(id);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1018] flex flex-col">
      {/* Dashboard Header */}
      <header className="min-h-16 bg-[#2d1b26] border-b border-pink-900/60 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-950/30">
            <Code2 className="w-5 h-5" />
          </div>

          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              CodeCollab
            </h1>
            <p className="text-[11px] text-pink-200/60">
              Real-Time Collaborative Code Editor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-pink-800/50"
              style={{ backgroundColor: user?.color || '#db2777' }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div className="hidden sm:block text-left text-xs">
              <span className="font-semibold text-white block">
                {user?.name}
              </span>
              <span className="text-pink-200/50">
                {user?.email}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            icon={LogOut}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Your Projects
            </h2>
            <p className="text-xs text-pink-200/60 mt-1">
              Create, collaborate, and execute code in isolated Docker environments
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={Plus}
          >
            New Project
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-40 rounded-xl bg-[#2d1b26] border border-pink-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-[#2d1b26]/50 border border-dashed border-pink-900/60 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-pink-950/50 flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-pink-400/70" />
            </div>

            <h3 className="text-base font-semibold text-white">
              No projects found
            </h3>

            <p className="text-xs text-pink-200/60 mt-2 mb-5 max-w-sm">
              Get started by creating your first collaborative coding project.
            </p>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={Plus}
            >
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(project => {
              const isOwner =
                project.owner?._id === user?._id ||
                project.owner === user?._id;

              const collaboratorCount =
                project.collaborators?.length || 0;

              return (
                <div
                  key={project._id}
                  onClick={() => navigate(`/workspace/${project._id}`)}
                  className="group relative bg-[#2d1b26] border border-pink-900/40 hover:border-pink-500/70 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-pink-950/20 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-xl bg-pink-950/60 flex items-center justify-center text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                          <FolderCode className="w-4 h-4" />
                        </div>

                        <h3 className="font-semibold text-white text-sm truncate max-w-[180px]">
                          {project.name}
                        </h3>
                      </div>

                      {isOwner && (
                        <button
                          onClick={e => handleDeleteProject(project._id, e)}
                          className="text-pink-200/50 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-pink-200/60 mt-5">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-pink-400" />
                        {collaboratorCount + 1} member
                        {collaboratorCount > 0 ? 's' : ''}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-pink-400" />
                        {project.updatedAt
                          ? new Date(project.updatedAt).toLocaleDateString()
                          : 'Recently updated'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-pink-900/40 flex items-center justify-between gap-2 text-xs">
                    <span className="text-pink-200/60 truncate">
                      {isOwner
                        ? 'Project Owner'
                        : `Shared by ${project.owner?.name || 'collaborator'}`}
                    </span>

                    <span className="text-pink-400 group-hover:text-pink-300 group-hover:underline flex items-center gap-1 font-medium shrink-0">
                      Open
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};
